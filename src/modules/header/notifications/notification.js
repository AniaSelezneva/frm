import React from "react";
import { Link } from "react-router-dom";
// Components
import RemoveNotification from "./removeOneNotification";

function Notification({ notification }) {
  return (
    <li data-dont-detect-click="true">
      <Link to={`/user/${notification.data.sender}`}>
        {notification.data.sender}
      </Link>
      {notification.data.type === "like" ? " liked " : " commented on "}
      <Link to={`/post/${notification.data.postId}`}>your post</Link>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <RemoveNotification notification={notification} />
    </li>
  );
}

export default Notification;
