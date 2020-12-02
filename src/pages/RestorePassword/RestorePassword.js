import React, { useState, useEffect } from "react";
// auth
import auth from "../../utils/auth";
// withLoader hoc
import WithLoader from "../../HOCs/WithLoader";
// Layout
import Layout from "../../HOCs/Layout";
// Styles
import loginStyles from "../Login/styles/Login.module.scss";

function RestorePassword({ setIsLoading }) {
  const [email, setEmail] = useState();
  const [emailCorrect, setEmailCorrect] = useState();
  const [error, setError] = useState(undefined);
  const [emailSent, setEmailSent] = useState(false);

  // Restore password
  const restore = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    try {
      await auth.requestPasswordRecovery(email);
      setIsLoading(false);
      setEmailSent(true);
    } catch (error) {
      if (error.message === "User not found") {
        setEmailCorrect(false);
        setIsLoading(false);
      }
    }
  };

  // Loading = false on page load
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Change color of email label and input if there is an error
  useEffect(() => {
    const email = document.getElementsByName("email")[0];

    const emailLabel = document.getElementById("email_label");

    if (emailCorrect || emailCorrect === undefined) {
      email.style.border = "1px solid black";

      emailLabel.style.color = "black";
    } else if (!emailCorrect) {
      email.style.border = "1px solid rgba(211, 56, 49, 1)";
      emailLabel.style.color = "rgba(211, 56, 49, 1)";
    }
  }, [emailCorrect]);

  // OverflowX = hidden on body (otherwise the page jumps on animation - buttom scroll appears and disappears)
  useEffect(() => {
    document.body.style.overflowX = "hidden";
  }, []);

  return (
    <Layout>
      <form
        onSubmit={(e) => {
          restore(e);
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
            setEmailCorrect(undefined);
          }}
          required="required"
        ></input>

        {emailCorrect && <p>No user found with that email</p>}
        {error && <p>{error}</p>}

        {!emailSent ? (
          <button type="submit">Restore password</button>
        ) : (
          <p id={loginStyles.restore_password_message}>
            Email with a link to restore your password has been sent
          </p>
        )}
      </form>
    </Layout>
  );
}

export default WithLoader(RestorePassword, "wait");
