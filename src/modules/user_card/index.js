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

// 'User' path means we don't want to load logged in user's info,
// we just want to load short info on the needed user. Any other
// path (where user's card component is available) will show logged
// in user's full info if he's logged in or links to log in or sign up.

function User({ handle }) {
  const { state, dispatch } = useContext(store);
  const [isAddInfoOpen, setIsAddInfoOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const path = state.path;

  // Get logged in user info.
  const getOwnUserInfo = async (email) => {
    try {
      const res = await adminClient.query(
        q.Get(q.Match(q.Index("users_by_email"), q.Casefold(email)))
      );
      dispatch({ type: "SET_USER", payload: { data: res.data, ref: res.ref } });
    } catch (error) {
      console.log(error);
    }
  };

  // Get user's likes function.
  const getLikes = async () => {
    try {
      const userLikes = await adminClient.query(
        q.Map(
          q.Paginate(
            q.Reverse(
              q.Match(q.Index("likes_by_user"), q.Casefold(state.user.handle))
            ),
            { size: 1000 }
          ),
          q.Lambda("X", q.Get(q.Var("X")))
        )
      );
      dispatch({ type: "SET_LIKES", payload: userLikes.data });
    } catch (error) {
      console.log(error);
    }
  };

  // Get other user info.
  const getUserInfo = async () => {
    try {
      const res = await adminClient.query(
        q.Get(q.Match(q.Index("users_by_handle"), q.Casefold(handle)))
      );

      dispatch({ type: "SET_OTHER_USER", payload: res.data });
    } catch (error) {
      console.log(error);
    }
  };

  // Toggle card's open/closed state.
  const toggleOpenCard = () => {
    if (isCardOpen) {
      setIsCardOpen(false);
    } else {
      setIsCardOpen(true);
    }
  };

  // Get user's likes.
  useEffect(() => {
    if (state.user.handle !== null && state.user.handle !== undefined) {
      getLikes();
    }
  }, [state.user.handle, window.location.pathname]);

  // Get user's info.
  useEffect(() => {
    // If path is 'user'...
    if (path === "user") {
      getUserInfo();
      // If path is 'profile', 'home', 'post' ...
    } else {
      // Check if user is signed in...
      if (auth.currentUser() !== null && auth.currentUser() !== undefined) {
        const email = auth.currentUser().email;

        getOwnUserInfo(email);
      }
    }
  }, [path]);

  // Check if user card should be shown in the beginning.
  useEffect(() => {
    // Toggle open/close card button.
    const button = document.getElementById("open_card_button");

    if (window.innerWidth > 800) {
      setIsCardOpen(true);
    } else if (window.innerWidth <= 800 && state.loggedIn && path !== "user") {
      setIsCardOpen(false);
      button.style.display = "block";
      // If user is not logged in, don't show 'open card' button on top, don't hide the card itself.
    } else if (window.innerWidth <= 800 && !state.loggedIn && path !== "user") {
      button.style.display = "none";
      setIsCardOpen(true);
    } else if (path === "user") {
      button.style.display = "none";
      setIsCardOpen(true);
    }
  }, [state.loggedIn, path]);

  // Open/close card.
  useEffect(() => {
    const card = document.getElementById("user_card");
    if (isCardOpen) {
      card.style.display = "flex";
    } else if (!isCardOpen) {
      card.style.display = "none";
    }
  }, [isCardOpen]);

  return (
    <div className={userCardStyles.container}>
      <button
        className={userCardStyles.open_card_button}
        id="open_card_button"
        onClick={() => {
          toggleOpenCard();
        }}
      >
        {state.path === "user" ? state.otherUser.handle : state.user.handle}
      </button>
      <div className={userCardStyles.user} id="user_card">
        {/* Add info */}
        {isAddInfoOpen && <AddInfo setIsAddInfoOpen={setIsAddInfoOpen} />}
        {/* Logged in user's card */}
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
              Change info
            </button>
            <UploadImage />
            <Logout />
          </>
        )}

        {/* User is not logged in and it's not 'user' path */}
        {!state.loggedIn && path !== "user" && (
          <div id={userCardStyles.login_signup_buttons_container}>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </div>
        )}

        {/* Other user's card */}
        {path === "user" && (
          <>
            <img
              src={state.otherUser.imageUrl}
              alt="user"
              height="300"
              width="240"
            />

            <p>{state.otherUser.handle}</p>
            {state.otherUser.location && (
              <p>
                <strong>Location:</strong> {state.otherUser.location}
              </p>
            )}
            {state.otherUser.hobbies && (
              <p>
                <strong>Hobbies:</strong> {state.otherUser.hobbies}
              </p>
            )}
            {state.otherUser.occupation && (
              <p>
                <strong>Occupation:</strong> {state.otherUser.occupation}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default User;
