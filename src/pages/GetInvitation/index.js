import React, { useState, useEffect } from "react";

// faunaDB
import { q, adminClient } from "../../utils/faunaDB";
// withLoader hoc
import WithLoader from "../../HOCs/WithLoader";
// Styles
import getInvitationStyles from "./styles/GetInvitation.module.scss";
// Layout
import Layout from "../../HOCs/Layout";

function GetInvitation({ setIsLoading }) {
  const [email, setEmail] = useState();
  const [error, setError] = useState(undefined);
  const [confirmationSent, setConfirmationSent] = useState(false);

  // Check if user email doesn't exist in db already.
  const isEmailUnique = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const emailExists = await adminClient.query(
          q.Exists(q.Match(q.Index("emails_to_invite"), q.Casefold(email)))
        );

        const emailExistsInUsers = await adminClient.query(
          q.Exists(q.Match(q.Index("users_by_email"), q.Casefold(email)))
        );

        if (emailExists || emailExistsInUsers) {
          setError("Email already in use");
          resolve(false);
        } else {
          setError(undefined);
          setConfirmationSent(true);
          resolve(true);
        }
      } catch (error) {
        reject(error);
        setError("Something went wrong, please try again later");
      }
    });
  };

  const addUser = async () => {
    setIsLoading(true);

    try {
      const result = await isEmailUnique();

      if (result === true) {
        await adminClient.query(
          q.Create(q.Collection("emails_to_invite"), {
            data: {
              email,
            },
          })
        );
      } else if (result === false) {
        setError("Email already in use");
      }
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <Layout>
      {confirmationSent ? (
        <p id={getInvitationStyles.confirmation_message}>
          Invitation will be sent to this email address
        </p>
      ) : (
        <form
          id={getInvitationStyles.form}
          method="POST"
          onSubmit={(e) => {
            e.preventDefault();
            addUser();
          }}
        >
          <label htmlFor="email">Email:</label>
          <input
            name="email"
            id="email"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <button>Send invitation</button>
          {error !== undefined && <p>{error}</p>}
        </form>
      )}
    </Layout>
  );
}

export default WithLoader(GetInvitation, "loading");
