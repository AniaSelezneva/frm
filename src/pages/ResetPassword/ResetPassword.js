import React, { useState, useContext, useEffect } from "react";
// store
import { store } from "../../utils/store";
// auth
import auth from "../../utils/auth";
// withLoader hoc
import WithLoader from "../../HOCs/WithLoader";
// Layout
import Layout from "../../HOCs/Layout";
// Styles
import loginStyles from "../Login/styles/Login.module.scss";

function ResetPassword({ setIsLoading }) {
  const { dispatch } = useContext(store);

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [passwordsMatch, setPasswordsMatch] = useState(undefined);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const [error, setError] = useState(undefined);
  const [userNotFound, setUserNotFound] = useState(undefined);

  // Recover and set user's email.
  useEffect(() => {
    // Recovery token
    let recoveryToken = decodeURIComponent(window.location.hash)
      .substring(1)
      .split("recovery_token=")[1];

    auth
      .recover(recoveryToken)
      .then((res) => {
        setEmail(res.email);
        setUserNotFound(false);
      })

      .catch((err) => {
        console.log(err);
        setUserNotFound(true);
      });

    setIsLoading(false);
  }, []);

  // Loading = false
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // OverflowX = hidden on body (otherwise the page jumps on animation - buttom scroll appears and disappears)
  useEffect(() => {
    document.body.style.overflowX = "hidden";
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

  // Change color of passwords label and input if there is error.
  useEffect(() => {
    if (userNotFound !== undefined) {
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
    }
  }, [passwordsMatch]);

  // Reset password.
  const resetPassword = async () => {
    setIsLoading(true);

    const passwordsMatch = doPasswordsMatch();

    if (passwordsMatch) {
      try {
        const user = auth.currentUser();
        await user.update({ email, password });
        setPasswordUpdated(true);

        await auth.login(email, password, true);
        setTimeout(() => {
          dispatch({ type: "LOG_IN" });
        }, 2000);
      } catch (error) {
        console.log(error);
        setError("Something went wrong, please try again later");
      }
    }

    setIsLoading(false);
  };

  // OverflowX = hidden on body (otherwise the page jumps on animation - buttom scroll appears and disappears)
  useEffect(() => {
    document.body.style.overflowX = "hidden";
  }, []);

  return (
    <Layout>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          resetPassword();
        }}
        method="post"
        id={loginStyles.form}
      >
        {userNotFound !== undefined &&
          (userNotFound ? (
            <p>Password reset link is invalid</p>
          ) : (
            <>
              <label htmlFor="email" id="email_label">
                Email:
              </label>
              <input value={email} disabled></input>
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
                  setError(undefined);
                  setPasswordsMatch(true);
                }}
                required="required"
              ></input>
              {passwordsMatch === false ? <p>Passwords don't match</p> : null}
              {error !== undefined && <p>{error}</p>}
              {!passwordUpdated ? (
                <button type="submit">Reset password</button>
              ) : (
                <p id={loginStyles.restore_password_message}>
                  Password had been reset
                </p>
              )}
            </>
          ))}
      </form>
    </Layout>
  );
}

export default WithLoader(ResetPassword);
