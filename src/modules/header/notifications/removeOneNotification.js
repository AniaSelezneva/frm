import React, { useContext } from "react";
// Store
import { context } from "./utils/store";
// FaunaDB
import { q, adminClient } from "../../../utils/faunaDB";

function RemoveNotification({ notification }) {
  const { state, dispatch } = useContext(context);

  // Remove one notification.
  const removeNotification = async () => {
    try {
      // Remove notification from db.
      await adminClient.query(q.Delete(notification.ref));

      //Remove notification from the store.
      dispatch({
        type: "REMOVE_NOTIFICATION",
        payload: notification.data.id,
      });

      dispatch({ type: "SET_TOTAL", payload: state.total - 1 });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <input
      id="remove_notification"
      type="image"
      src="/img/header/remove.svg"
      className="remove_notification_button"
      data-dont-detect-click="true"
      tabIndex="0"
      onClick={removeNotification}
    />
  );
}

export default RemoveNotification;
