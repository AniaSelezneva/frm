import React, { useState, useEffect } from "react";
// GoTrue - user authentication library
import GoTrue from "gotrue-js";

// GoTrue
const auth = new GoTrue({
  APIUrl: "https://forum-wtchs.netlify.app/.netlify/identity",
  audience: "",
  setCookie: false,
});

function Login() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  // Login
  const login = async (e) => {
    e.preventDefault();
    const res = await auth.login(email, password);
    console.log(auth.currentUser());
  };

  useEffect(() => {
    console.log(auth.currentUser());
  }, []);

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
        }}
        required="required"
      ></input>

      <button type="submit">Signup</button>
    </form>
  );
}

export default Login;
