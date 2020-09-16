import React, { useState, useContext, useEffect } from "react";
// store
import { store } from "../utils/store";
// auth
import auth from "../utils/auth";
// withLoader hoc
import WithLoader from "../HOCs/WithLoader";

function Login({ setIsLoading }) {
  const { state, dispatch } = useContext(store);

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [error, setError] = useState(undefined);

  // Check if user is signed in.
  useEffect(() => {
    // If he is...
    if (auth.currentUser() !== null && auth.currentUser() !== undefined) {
      // change loggedIn property in state object.
      dispatch({ type: "LOG_IN" });
    }
    setIsLoading(false);
  }, []);

  // Login
  const login = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    try {
      await auth.login(email, password, true);
      dispatch({ type: "LOG_IN" });
    } catch (error) {
      if (error.message == "invalid_grant: Email not confirmed") {
        setError("Email not confirmed");
      } else if (
        error.message ==
        "invalid_grant: No user found with that email, or password invalid."
      ) {
        setError("No user found with that email, or password invalid");
      } else {
        setError("Error occured, please try again later");
      }
    }
    setIsLoading(false);
  };

  return (
    <form
      onSubmit={(e) => {
        login(e);
      }}
      method="post"
    >
      <label htmlFor="email">Email:</label>
      <input
        type="email"
        name="email"
        id="email"
        onChange={(e) => {
          setEmail(e.target.value);
          setError(undefined);
        }}
        required="required"
      ></input>

      <label htmlFor="password">Password:</label>
      <input
        type="password"
        name="password"
        id="password"
        onChange={(e) => {
          setPassword(e.target.value);
          setError(undefined);
        }}
        required="required"
      ></input>

      {error !== undefined && <p>{error}</p>}

      <button type="submit">Login</button>
    </form>
  );
}

export default WithLoader(Login, "wait");
