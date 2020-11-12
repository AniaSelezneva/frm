import React, { useContext } from "react";
// Styles
import postStyles from "./styles/Post.module.scss";
// FaunaDB
import { q, adminClient } from "../../utils/faunaDB";
// Store
import { store } from "../../utils/store";

function DeletePostModal({ setShowModal, postId }) {
  const { state, dispatch } = useContext(store);

  // Delete post
  const deletePost = async () => {
    const promises = [];
    // Delete comments
    state.post.comments.data.forEach((comment) => {
      promises.push(adminClient.query(q.Delete(comment.ref)));
    });

    // Delete notifications associated with this post
    const notifications = await adminClient.query(
      q.Map(
        q.Paginate(
          q.Match(q.Index("notifications_by_postid"), state.post.data.postId)
        ),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );
    notifications.data.forEach((notification) => {
      promises.push(adminClient.query(q.Delete(notification.ref)));
    });

    dispatch({ type: "REMOVE_POST", payload: postId });

    // Await for comments and notifications to be deleted
    await Promise.all(promises);
    // Delete post itself
    await adminClient.query(q.Delete(state.post.ref));
    setShowModal(false);
    window.history.back();
  };

  return (
    <div
      className={postStyles.modal_container}
      id="modal"
      onClick={() => setShowModal(false)}
    >
      <div
        className={postStyles.modal_window}
        onClick={(e) => e.stopPropagation()}
      >
        <p>Are you sure you want to remove the post permanently?</p>
        <div className={postStyles.button_container}>
          <button onClick={deletePost}>yes</button>
          <button
            onClick={() => {
              setShowModal(false);
            }}
          >
            no
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeletePostModal;
