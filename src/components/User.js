import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
// store
import { store } from "../utils/store";
// faunaDB
import { q, adminClient } from "../utils/faunaDB";
// auth
import auth from "../utils/auth";
// withLoader hoc
import WithLoader from "../HOCs/WithLoader";

function User({ setIsLoading }) {
  const { state, dispatch } = useContext(store);
  const [email, setEmail] = useState();

  const getUserInfo = async () => {
    const data = await fetch("api/avatar");
    const data1 = await JSON.parse(data);
    console.log(data1);

    setIsLoading(true);
    const res = await adminClient.query(
      q.Get(q.Match(q.Index("users_by_email"), q.Casefold(email)))
    );
    dispatch({ type: "FETCH_USER", payload: res.data });
    setIsLoading(false);
  };

  // Check if user is signed in.
  useEffect(() => {
    // If he is...
    if (auth.currentUser() !== null && auth.currentUser() !== undefined) {
      // change loggedIn property in state object.
      dispatch({ type: "LOG_IN" });
      setEmail(auth.currentUser().email);
    }
  }, []);

  useEffect(() => {
    if (email !== null && email !== undefined) {
      getUserInfo();
    }
  }, [email]);

  return (
    <>
      {state.loggedIn ? (
        <div>
          <p>{state.user.handle}</p>
          <p>{state.user.email}</p>
          <img src={state.user.imageUrl} alt="profile image" />
        </div>
      ) : (
        <div>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </div>
      )}
    </>
  );
}

export default WithLoader(User, "wait...");
