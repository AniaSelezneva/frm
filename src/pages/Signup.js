import React, { useState } from "react";
// Fauna
import faunadb from "faunadb";
// GoTrue - user authentication library
import GoTrue from "gotrue-js";

// Fauna
const q = faunadb.query;
const adminClient = new faunadb.Client({
  secret: process.env.REACT_APP_SECRET,
});

// GoTrue
const auth = new GoTrue({
  APIUrl: "https://forum-wtchs.netlify.app/.netlify/identity",
  audience: "",
  setCookie: false,
});

function Signup() {
  const [email, setEmail] = useState();
  const [handle, setHandle] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();

  const [handleUnique, setHandleUnique] = useState();
  const [emailUnique, setEmailUnique] = useState();
  const [passwordsMatch, setPasswordsMatch] = useState();

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

  const isHandleUnique = () => {
    return new Promise(async (resolve, reject) => {
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
    });
  };

  const isEmailUnique = () => {
    return new Promise(async (resolve, reject) => {
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
    });
  };

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
    e.preventDefault();
    const handleUnique = await isHandleUnique();
    const emailUnique = await isEmailUnique();

    if (handleUnique && emailUnique && doPasswordsMatch()) {
      await auth.signup(email, password);
      await addUserToDb();

      const user = auth.currentUser();
      console.log("user after signing in", user);
    }

    (async () => {
      const res = await fetch("/api/hey");
      const response = await res.json();
      console.log(response);
    })();
  };

  useEffect(() => {
    const user = auth.currentUser();
    console.log("user on page load", user);

    const smth = async () => {
      const res = await fetch("/api/hey");
      const response = await res.json();
      console.log(response);
    };

    smth();
  }, []);

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
          setPasswordsMatch(true);
        }}
        required="required"
      ></input>
      {passwordsMatch === false ? <p>Passwords don't match</p> : null}

      <button type="submit">Signup</button>
    </form>
  );
}

export default Signup;
