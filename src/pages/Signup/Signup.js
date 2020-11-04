import React, { useState, useEffect } from "react";

// faunaDB
import { q, adminClient } from "../../utils/faunaDB";
// auth
import auth from "../../utils/auth";
// withLoader hoc
import WithLoader from "../../HOCs/WithLoader";
// Styles
import signupStyles from "./styles/Signup.module.scss";
// Layout
import Layout from "../../HOCs/Layout";

function Signup({ setIsLoading }) {
  const [email, setEmail] = useState();
  const [handle, setHandle] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();

  const [handleUnique, setHandleUnique] = useState();
  const [emailUnique, setEmailUnique] = useState();
  const [passwordsMatch, setPasswordsMatch] = useState();

  const [confirmationSent, setConfirmationSent] = useState(false);

  // General error
  const [isError, setIsError] = useState();

  // Loading = false
  useEffect(() => {
    setIsLoading(false);
  }, []);

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

  // Signup.
  const signup = async (e) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/addUserToDb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          handle,
          email,
        }),
      });

      doPasswordsMatch();

      const response = await res.json();
      console.log(response);
      if (response === "Email already in use") {
        setEmailUnique(false);
      } else if (response === "Handle already taken") {
        setHandleUnique(false);
      } else if (response === "User is added to database") {
        await auth.signup(email, password);
        setConfirmationSent(true);
      }
    } catch (error) {
      console.log(error);
      setIsError(true);
    }
    setIsLoading(false);
  };

  // Change color of labels when corresponding input is active.
  useEffect(() => {
    const inputs = document.getElementsByTagName("input");
    const labels = document.getElementsByTagName("label");
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].onfocus = function () {
        const inputName = inputs[i].getAttribute("name");
        for (let j = 0; j < labels.length; j++) {
          if (inputName === labels[j].htmlFor) {
            labels[j].style.color = "rgba(48, 136, 135, 1.00)";
          }
        }
      };

      inputs[i].onblur = function () {
        const inputName = inputs[i].getAttribute("name");
        for (let j = 0; j < labels.length; j++) {
          if (inputName === labels[j].htmlFor) {
            labels[j].style.color = "black";
          }
        }
      };
    }
  }, []);

  // Change color of handle label and input if there is error.
  useEffect(() => {
    const input = document.getElementsByName("handle")[0];
    const label = document.getElementById("handle_label");
    if (handleUnique || handleUnique === undefined) {
      input.style.border = "1px solid black";
      label.style.color = "black";
    } else if (!handleUnique) {
      input.style.border = "1px solid rgba(211, 56, 49, 1)";
      label.style.color = "rgba(211, 56, 49, 1)";
    }
  }, [handleUnique]);

  // Change color of email label and input if there is error.
  useEffect(() => {
    const input = document.getElementsByName("email")[0];
    const label = document.getElementById("email_label");
    if (emailUnique || emailUnique === undefined) {
      input.style.border = "1px solid black";
      label.style.color = "black";
    } else if (!emailUnique) {
      input.style.border = "1px solid rgba(211, 56, 49, 1)";
      label.style.color = "rgba(211, 56, 49, 1)";
    }
  }, [emailUnique]);

  // Change color of passwords label and input if there is error.
  useEffect(() => {
    const password = document.getElementsByName("password")[0];
    const confirmPassword = document.getElementsByName("confirmPassword")[0];
    const passwordLabel = document.getElementById("password_label");
    const confirmPasswordLabel = document.getElementById(
      "confirm_password_label"
    );
    if (passwordsMatch || passwordsMatch === undefined) {
      password.style.border = "1px solid black";
      confirmPassword.style.border = "1px solid black";
      passwordLabel.style.color = "black";
      confirmPasswordLabel.style.color = "black";
    } else if (!passwordsMatch) {
      password.style.border = "1px solid rgba(211, 56, 49, 1)";
      confirmPassword.style.border = "1px solid rgba(211, 56, 49, 1)";
      passwordLabel.style.color = "rgba(211, 56, 49, 1)";
      confirmPasswordLabel.style.color = "rgba(211, 56, 49, 1)";
    }
  }, [passwordsMatch]);

  return (
    <Layout>
      {!confirmationSent ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            signup(e);
          }}
          method="post"
          id={signupStyles.form}
        >
          <label htmlFor="email" id="email_label">
            Email:
          </label>
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

          <label htmlFor="handle" id="handle_label">
            Username:
          </label>
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

          <label htmlFor="password" id="password_label">
            Password:
          </label>
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

          <label htmlFor="confirmPassword" id="confirm_password_label">
            Confirm password:
          </label>
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
      ) : (
        <p id={signupStyles.confirmation_message}>
          Confirmation letter has been sent to your email
        </p>
      )}
    </Layout>
  );
}

export default WithLoader(Signup, "loading");
