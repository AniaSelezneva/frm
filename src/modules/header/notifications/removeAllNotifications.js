import React, { useContext, useEffect } from "react";
// Store
import { store } from "../../../utils/store";
import { context } from "./utils/store";
// FaunaDB
import { q, adminClient } from "../../../utils/faunaDB";
// Components
import Notification from "./notification";
import Pagination from "./pagination";

function RemoveAll() {
  const { state, dispatch } = useContext(context);
  const { state: globalState } = useContext(store);

  //  ******************** FUNCTIONS *************************
  // Get all user's notifications to remove all of them
  const getAllNotifications = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const allNotifications = await adminClient.query(
          q.Paginate(
            q.Match(
              q.Index("notifications_by_recepient"),
              globalState.user.handle
            )
          )
        );

        resolve(allNotifications.data);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  // Remove all notifications
  const removeAllNotifications = async () => {
    try {
      // Get all user's notifications.
      const allNotifications = await getAllNotifications();
      //Remove all notifications from db.
      allNotifications.forEach(async (notificationRef) => {
        await adminClient.query(q.Delete(notificationRef));
      });

      // Remove all notifications from state.
      dispatch({
        type: "REMOVE_ALL",
      });
      // Close notifications.
      dispatch({ type: "SET_TOTAL", payload: 0 });
      dispatch({ type: "SET_IS_OPEN", payload: false });
    } catch (error) {
      console.log(error);
    }
  };

  //   *********************** RETURN *****************
  return (
    <div
      id="mark_read_buttons_container"
      className={state.total <= 0 ? "disabled" : null}
      data-dont-detect-click="true"
    >
      <button
        id="mark_all_read"
        tabIndex="0"
        onClick={removeAllNotifications}
        data-dont-detect-click="true"
      >
        mark all read
      </button>
    </div>
  );
}

export default RemoveAll;
