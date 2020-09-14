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
  const [password, setPassword] = useState();

  // adminClient
  //   .query(
  //     q.Create(q.Collection("users"), {
  //       data: {
  //         handle: "handle1",
  //         email: "email1@email.com",
  //         imageUrl: "imageUrl1.com",
  //       },
  //     })
  //   )
  //   .then((ret) => console.log(ret));

  const signup = async (e) => {
    e.preventDefault();
    const res = await auth.signup(email, password);
    console.log(res);
  };

  return (
    <form
      onSubmit={(e) => {
        signup(e);
      }}
      method="post"
    >
      <label htmlFor="email">Email: </label>
      <input
        type="email"
        name="email"
        id="email"
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      ></input>

      <label htmlFor="Password">Password:</label>
      <input
        type="password"
        name="password"
        id="password"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      ></input>
      <button type="submit">Signup</button>
    </form>
  );
}

export default Signup;
