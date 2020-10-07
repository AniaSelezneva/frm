import React, { useContext } from "react";
import { Link } from "react-router-dom";
// faunaDB
import { q, adminClient } from "../../../utils/faunaDB";
// styles
import postStyles from "../styles/Post.module.scss";
// components
import NewComment from "./NewComment";
import Pagination from "./Pagination";
// store
import { store } from "../../../utils/store";

function Index() {
  const { state, dispatch } = useContext(store);

  const deleteComment = async (commentRef, commentId) => {
    const promises = [];

    // delete notifications associated with this comment
    const notifications = await adminClient.query(
      q.Map(
        q.Paginate(q.Match(q.Index("notifications_by_commentid"), commentId)),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );
    notifications.data.forEach((notification) => {
      promises.push(adminClient.query(q.Delete(notification.ref)));
    });
    // await for  notifications to be deleted
    await Promise.all(promises);
    // delete post itself
    const res = await adminClient.query(q.Delete(commentRef));
    window.location.reload();
  };

  return (
    <div>
      {state.loggedIn ? (
        <NewComment />
      ) : (
        <p className={postStyles.posts_header}>
          <Link to="/login">
            <strong>login</strong>
          </Link>
          or
          <Link to="/signup">
            <strong>signup</strong>
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
          <div className={postStyles.comment} key={index}>
            <p>{comment.data.body}</p>
            <div className={postStyles.comment_info}>
              {state.user.handle === comment.data.userHandle && (
                <button
                  onClick={() => {
                    deleteComment(comment.ref, comment.data.commentId);
                  }}
                >
                  delete comment
                </button>
              )}
              <Link to={`/user/${comment.data.userHandle}`}>
                <img src={comment.data.userImageUrl} />
                <h6>{comment.data.userHandle}</h6>
              </Link>
            </div>
          </div>
        ))}

      <Pagination />
    </div>
  );
}

export default Index;
