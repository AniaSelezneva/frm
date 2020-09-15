import React, { useState, useContext, useEffect } from "react";

// store
import { store } from "../utils/store";
// Fauna
import faunadb from "faunadb";
// auth
import auth from "../utils/auth";

// Fauna
const q = faunadb.query;
const adminClient = new faunadb.Client({
  secret: process.env.REACT_APP_SECRET,
});

function Signup() {
  const { state, dispatch } = useContext(store);

  const [email, setEmail] = useState();
  const [handle, setHandle] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();

  const [handleUnique, setHandleUnique] = useState();
  const [emailUnique, setEmailUnique] = useState();
  const [passwordsMatch, setPasswordsMatch] = useState();

  // General error
  const [isError, setIsError] = useState();

  // Check if user is signed in.
  useEffect(() => {
    // If he is...
    if (auth.currentUser() !== null && auth.currentUser() !== undefined) {
      // change loggedIn property in state object.
      dispatch({ type: "LOG_IN" });
    }
  }, []);

  // Add user to 'users' collection in db.
  const addUserToDb = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const ret = await adminClient.query(
          q.Create(q.Collection("users"), {
            data: {
              handle: handle,
              email: email,
              imageUrl: "imageUrl1.com",
            },
          })
        );
        resolve(ret);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Check if user handle doesn't exist in db already.
  const isHandleUnique = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await adminClient.query(
          q.Exists(q.Match(q.Index("users_by_handle"), q.Casefold(handle)))
        );

        if (res === true) {
          setHandleUnique(false);
          resolve(false);
        } else {
          setHandleUnique(true);
          resolve(true);
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  // Check if user email doesn't exist in db already.
  const isEmailUnique = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await adminClient.query(
          q.Exists(q.Match(q.Index("users_by_email"), q.Casefold(email)))
        );

        if (res === true) {
          setEmailUnique(false);
          resolve(false);
        } else {
          setEmailUnique(true);
          resolve(true);
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  // Check if password and confirmPassword match.
  const doPasswordsMatch = () => {
    if (password === confirmPassword) {
      setPasswordsMatch(true);
      return true;
    } else {
      setPasswordsMatch(false);
      return false;
    }
  };

  const signup = async (e) => {
    try {
      e.preventDefault();
      const handleUnique = await isHandleUnique();
      const emailUnique = await isEmailUnique();

      if (handleUnique && emailUnique && doPasswordsMatch()) {
        await auth.signup(email, password);
        await addUserToDb();
      }
    } catch (error) {
      console.log(error);
      setIsError(true);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        signup(e);
      }}
      method="post"
    >
      <label htmlFor="email">Email:</label>
      <input
        type="email"
        name="email"
        id="email"
        onChange={(e) => {
          setEmailUnique(undefined);
          setIsError(false);
          setEmail(e.target.value);
        }}
        required="required"
      ></input>

      {emailUnique === false ? <p>This email is already in use</p> : null}

      <label htmlFor="handle">Username:</label>
      <input
        type="text"
        name="handle"
        id="handle"
        onChange={(e) => {
          setHandleUnique(undefined);
          setIsError(false);
          setHandle(e.target.value);
        }}
        required="required"
      ></input>

      {handleUnique === false ? <p>This handle is already in use</p> : null}

      <label htmlFor="password">Password:</label>
      <input
        type="password"
        name="password"
        id="password"
        onChange={(e) => {
          setPassword(e.target.value);
          setIsError(false);
          setPasswordsMatch(true);
        }}
        required="required"
      ></input>

      <label htmlFor="confirmPassword">Confirm password:</label>
      <input
        type="password"
        name="confirmPassword"
        id="confirmPassword"
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          setIsError(false);
          setPasswordsMatch(true);
        }}
        required="required"
      ></input>
      {passwordsMatch === false ? <p>Passwords don't match</p> : null}

      {isError && <p>Error occured, please try again later</p>}

      <button type="submit">Signup</button>
    </form>
  );
}

export default Signup;
