import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
// faunaDB
import { q, adminClient } from "../../../utils/faunaDB";
// styles
import postStyles from "../styles/Post.module.scss";
// store
import { store } from "../../../utils/store";
// Day.js
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

function Comment({ comment }) {
  const { state, dispatch } = useContext(store);
  const [time, setTime] = useState();

  // Delete comment
  const deleteComment = async (commentRef, commentId) => {
    const promises = [];

    // Delete notifications associated with this comment
    const notifications = await adminClient.query(
      q.Map(
        q.Paginate(q.Match(q.Index("notifications_by_commentid"), commentId)),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );
    notifications.data.forEach((notification) => {
      promises.push(adminClient.query(q.Delete(notification.ref)));
    });

    // Reduce the total number of nitifications in post
    adminClient.query(
      q.Update(state.post.ref, {
        data: {
          commentCount: state.post.data.commentCount - 1,
        },
      })
    );

    await adminClient.query(
      q.Map(
        q.Paginate(q.Match(q.Index("notifications_by_commentid"), commentId)),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );

    // Wait for  notifications to be deleted
    await Promise.all(promises);
    // Delete post itself
    await adminClient.query(q.Delete(commentRef));

    dispatch({ type: "DELETE_COMMENT", payload: comment.data.commentId });
  };

  useEffect(() => {
    const time = new Date(comment.ts / 1000);
    const d = dayjs(time).fromNow();
    setTime(d);
  }, []);

  return (
    <div className={postStyles.comment}>
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
          <p>{time}</p>
          <div className={postStyles.user_info}>
            <img src={comment.data.userImageUrl} alt="user" />
            <h6>{comment.data.userHandle}</h6>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Comment;
