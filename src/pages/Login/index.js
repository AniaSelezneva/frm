import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
// store
import { store } from "../../utils/store";
// auth
import auth from "../../utils/auth";
// withLoader hoc
import WithLoader from "../../HOCs/WithLoader";
// Layout
import Layout from "../../HOCs/Layout";
// Styles
import loginStyles from "./styles/Login.module.scss";

function Login({ setIsLoading }) {
  const { dispatch } = useContext(store);

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [credentialsCorrect, setCredentialsCorrect] = useState();
  const [error, setError] = useState(undefined);

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
        setCredentialsCorrect(false);
      } else {
        setError("Error occured, please try again later");
      }
      setIsLoading(false);
    }
  };

  // Loading = false
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Change color of email label and input if there is error.
  useEffect(() => {
    const email = document.getElementsByName("email")[0];
    const password = document.getElementsByName("password")[0];

    const emailLabel = document.getElementById("email_label");
    const passwordLabel = document.getElementById("password_label");
    if (credentialsCorrect || credentialsCorrect === undefined) {
      email.style.border = "1px solid black";
      password.style.border = "1px solid black";
      emailLabel.style.color = "black";
      passwordLabel.style.color = "black";
    } else if (!credentialsCorrect) {
      email.style.border = "1px solid rgba(211, 56, 49, 1)";
      password.style.border = "1px solid rgba(211, 56, 49, 1)";
      emailLabel.style.color = "rgba(211, 56, 49, 1)";
      passwordLabel.style.color = "rgba(211, 56, 49, 1)";
    }
  }, [credentialsCorrect]);

  return (
    <Layout>
      <form
        onSubmit={(e) => {
          login(e);
        }}
        method="post"
        id={loginStyles.form}
      >
        <label htmlFor="email" id="email_label">
          Email:
        </label>
        <input
          type="email"
          name="email"
          id="email"
          onChange={(e) => {
            setEmail(e.target.value);
            setError(undefined);
            setCredentialsCorrect(undefined);
          }}
          required="required"
        ></input>

        <label htmlFor="password" id="password_label">
          Password:
        </label>
        <input
          type="password"
          name="password"
          id="password"
          onChange={(e) => {
            setPassword(e.target.value);
            setError(undefined);
            setCredentialsCorrect(undefined);
          }}
          required="required"
        ></input>
        {credentialsCorrect !== undefined && (
          <p>No user found with that email, or password invalid</p>
        )}
        {error !== undefined && <p>{error}</p>}

        <button type="submit">Login</button>
        <Link to="/restore">Forgot password?</Link>
      </form>
    </Layout>
  );
}

export default WithLoader(Login, "wait");
