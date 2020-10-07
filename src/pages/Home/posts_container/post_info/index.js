import React from "react";
import { Link } from "react-router-dom";
// Styles
import postsContainerStyles from "../../styles/Posts_container.module.scss";

function index({ userImageUrl, userHandle, commentCount }) {
  return (
    <div className={postsContainerStyles.post_info}>
      <Link to={`/user/${userHandle}`}>
        <img src={userImageUrl} className={postsContainerStyles.user_image} />
        <h6>{userHandle}</h6>
      </Link>
      <p>{commentCount} comments</p>
    </div>
  );
}

export default index;
