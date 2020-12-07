import React, { useContext, useEffect } from "react";
// Store
import { store } from "../../../utils/store";
import { context } from "./utils/store";
// FaunaDB
import { q, adminClient } from "../../../utils/faunaDB";
// Components
import Notification from "./notification";
import Pagination from "./pagination";
import RemoveAll from "./removeAllNotifications";

function NotificationsContainer() {
  const { state, dispatch } = useContext(context);
  const { state: globalState } = useContext(store);

  //  *********************** FUNCTIONS ***********

  //  Get user's notifications.
  const getUserNotifications = (handle) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await adminClient.query(
          q.Map(
            q.Paginate(
              q.Reverse(q.Match(q.Index("notifications_by_recepient"), handle)),
              { size: state.size }
            ),
            q.Lambda("X", q.Get(q.Var("X")))
          )
        );

        dispatch({ type: "SET_NOTIFICATIONS", payload: response.data });
        dispatch({ type: "SET_AFTER", payload: response.after });
        dispatch({ type: "SET_BEFORE", payload: response.before });

        resolve("successfully loaded");
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  //  ************************* EFFECTS ************

  //   Get user's notifications.
  useEffect(() => {
    const handle = globalState.user.handle;
    if (handle) {
      getUserNotifications(handle);
    }
  }, [globalState.user.handle]);

  //   Set totalCurrentPage from the store.
  useEffect(() => {
    if (state.notifications && state.notifications.data) {
      const totalCurrentPage = state.notifications.data.length;
      dispatch({ type: "SET_TOTAL_CURRENT_PAGE", payload: totalCurrentPage });
    }
  }, [state.notifications]);

  // Close notifications when body is clicked (exclude notifications container)
  useEffect(() => {
    document.body.addEventListener("click", (e) => {
      // Elements in the notifications container have data attribute to find them.
      if (!e.target.dataset.dontDetectClick) {
        dispatch({ type: "SET_IS_OPEN", payload: false });
      }
    });
  }, [state.isOpen]);

  //   ************************* RETURN *****************
  return (
    //  NOTIFICATIONS CONTAINER
    <ul id="notifications_container" data-dont-detect-click="true">
      {state.isLoading ? (
        <p>Loading...</p>
      ) : (
        state.notifications &&
        state.notifications.data &&
        state.notifications.data.map((notification) => (
          // NOTIFICATION
          <Notification
            key={notification.data.id}
            notification={notification}
          />
        ))
      )}

      {/* PAGINATION */}
      <Pagination />

      {/* MARK ALL READ BUTTON */}
      <RemoveAll />

      {/* CLOSE NOTIFICATIONS */}
      <button
        id="close_notifications"
        onClick={() => {
          dispatch({ type: "SET_IS_OPEN", payload: false });
        }}
      >
        close
      </button>
    </ul>
  );
}

export default NotificationsContainer;
