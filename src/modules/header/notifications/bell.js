import React, { useContext, useState, useEffect } from "react";
// Store
import { store } from "../../../utils/store";
import { context } from "./utils/store";
// FaunaDB
import { q, adminClient } from "../../../utils/faunaDB";
// Components
import NotificationsContainer from "./container";

function Bell() {
  const { state: globalState } = useContext(store);
  const { state, dispatch } = useContext(context);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // ****************** FUNCTIONS ************************

  // Count users notifications, set totalNotifications in the store.
  const countNotifications = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const total = await adminClient.query(
          q.Count(
            q.Match(
              q.Index("notifications_by_recepient"),
              globalState.user.handle
            )
          )
        );
        dispatch({ type: "SET_TOTAL", payload: total });
        resolve("Success");
      } catch (error) {
        console.log(error);
        setIsError(true);
        reject(error);
      }
    });
  };

  // ********* EFFECTS ***********************************

  // Count user's notifications.
  useEffect(() => {
    const dealWithNotifications = async () => {
      setIsLoading(true);
      try {
        await countNotifications();
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    dealWithNotifications();
  }, [globalState.user.handle, window.location.pathname]);

  //   *********************** RETURN ***********************
  return (
    <>
      {isLoading ? (
        // 'Loading' message.
        <p id="notifications_loading_msg">loading...</p>
      ) : // Don't show notifications icon at all if there's an error.
      !isError && state.total <= 0 ? (
        // Transparent bell if there are no notifications.
        <input
          type="image"
          alt="notifications"
          id="notifications_bell"
          src="/img/header/bell-transparent.svg"
          tabIndex="-1"
          className="inactive_bell"
          height="49.531"
        />
      ) : (
        // Yellow bell if there are notifications.
        <>
          <input
            type="image"
            alt="notifications"
            src="/img/header/bell-yellow.svg"
            id="notifications_bell"
            data-dont-detect-click="true"
            height="49.531"
            onClick={() => {
              if (!state.isOpen) {
                dispatch({ type: "SET_IS_OPEN", payload: true });
              } else {
                dispatch({ type: "SET_IS_OPEN", payload: false });
              }
            }}
          />
          <p id="total_notifications">{state.total}</p>
        </>
      )}
      {/* Notifications container. */}
      {state.isOpen && <NotificationsContainer />}
    </>
  );
}

export default Bell;
