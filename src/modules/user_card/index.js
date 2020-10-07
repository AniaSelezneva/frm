import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
// store
import { store } from "../../utils/store";
// faunaDB
import { q, adminClient } from "../../utils/faunaDB";
// auth
import auth from "../../utils/auth";
// components
import UploadImage from "./UploadImage";
import AddInfo from "./AddInfo";
import Logout from "./Logout";
// Styles
import userCardStyles from "./styles/index.module.scss";

function User({ path, handle }) {
  const { state, dispatch } = useContext(store);
  const [email, setEmail] = useState();
  const [isAddInfoOpen, setIsAddInfoOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);

  // Get logged in user info.
  const getOwnUserInfo = async () => {
    try {
      const res = await adminClient.query(
        q.Get(q.Match(q.Index("users_by_email"), q.Casefold(email)))
      );
      await dispatch({ type: "SET_USER", payload: res.data });
      dispatch({ type: "SET_REF", payload: res.ref });
    } catch (error) {
      console.log(error);
    }
  };

  // Get other user info.
  const getUserInfo = async () => {
    const res = await adminClient.query(
      q.Get(q.Match(q.Index("users_by_handle"), q.Casefold(handle)))
    );

    dispatch({ type: "SET_USER", payload: res.data });
    dispatch({ type: "SET_REF", payload: res.ref });
  };

  useEffect(() => {
    if (path === "user") {
      getUserInfo();
    } else if (
      path === "home" ||
      path === "profile" ||
      path === "search" ||
      path === "post"
    ) {
      // Check if user is signed in.
      if (auth.currentUser() !== null && auth.currentUser() !== undefined) {
        setEmail(auth.currentUser().email);
      }
    }
  }, [path]);

  useEffect(() => {
    if (email !== null && email !== undefined) {
      getOwnUserInfo();
    }
  }, [email]);

  // Toggle card's open/closed state.
  const toggleOpenCard = () => {
    if (isCardOpen) {
      setIsCardOpen(false);
    } else {
      setIsCardOpen(true);
    }
  };

  // Check if user card should be shown in the beginning.
  useEffect(() => {
    if (window.innerWidth > 800) {
      setIsCardOpen(true);
    } else if (window.innerWidth <= 800) {
      setIsCardOpen(false);
    }
  }, []);

  // Open or close card.
  useEffect(() => {
    const card = document.getElementById("user_card");
    if (isCardOpen) {
      card.style.display = "flex";
    } else if (!isCardOpen) {
      card.style.display = "none";
    }
  }, [isCardOpen]);

  window.addEventListener("resize", () => {
    console.log(window.innerWidth > 800);
    if (window.innerWidth > 800) {
      setIsCardOpen(true);
    } else if (window.innerWidth <= 800) {
      setIsCardOpen(false);
    }
  });

  return (
    <div className={userCardStyles.container}>
      <button
        className={userCardStyles.open_card_button}
        onClick={() => {
          toggleOpenCard();
        }}
      >
        open card
      </button>
      <div className={userCardStyles.user} id="user_card">
        {isAddInfoOpen && <AddInfo setIsAddInfoOpen={setIsAddInfoOpen} />}
        {/* User's own page */}
        {path !== "user" && state.loggedIn && !isAddInfoOpen && (
          <>
            <img src={state.user.imageUrl} alt="profile image" />

            <p>{state.user.handle}</p>
            <p>{state.user.email}</p>
            {state.user.location && (
              <p>
                <strong>Location:</strong> {state.user.location}
              </p>
            )}
            {state.user.hobbies && (
              <p>
                <strong>Hobbies:</strong> {state.user.hobbies}
              </p>
            )}
            {state.user.occupation && (
              <p>
                <strong>Occupation:</strong> {state.user.occupation}
              </p>
            )}
            <button
              onClick={() => {
                setIsAddInfoOpen(true);
              }}
            >
              Add info
            </button>
            <UploadImage />
            <Logout />
          </>
        )}
        {!state.loggedIn && path !== "user" && (
          <div id={userCardStyles.login_signup_buttons_container}>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </div>
        )}
        {path === "user" && (
          <>
            <img src={state.user.imageUrl} alt="profile image" />

            <p>{state.user.handle}</p>
            {state.user.location && (
              <p>
                <strong>Location:</strong> {state.user.location}
              </p>
            )}
            {state.user.hobbies && (
              <p>
                <strong>Hobbies:</strong> {state.user.hobbies}
              </p>
            )}
            {state.user.occupation && (
              <p>
                <strong>Occupation:</strong> {state.user.occupation}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default User;
