import React, { useContext } from "react";
import { Link } from "react-router-dom";
// styles
import postStyles from "../styles/Post.module.scss";
// components
import NewComment from "./NewComment";
import Pagination from "./Pagination";
import Comment from "./Comment";
// store
import { store } from "../../../utils/store";

function Index() {
  const { state } = useContext(store);

  return (
    <div>
      {state.loggedIn ? (
        <NewComment />
      ) : (
        <p className={postStyles.posts_header}>
          <Link to="/login">
            <strong>login </strong>
          </Link>
          or
          <Link to="/signup">
            <strong> signup </strong>
          </Link>
          to leave a comment
        </p>
      )}

      {state.post !== null &&
        state.post.comments !== undefined &&
        state.post.comments.data !== undefined &&
        state.post.comments.data !== null &&
        state.post.comments.data.length > 0 &&
        state.post.comments.data.map((comment, index) => (
          <Comment comment={comment} index={index} key={index} />
        ))}

      <Pagination />
    </div>
  );
}

export default Index;
