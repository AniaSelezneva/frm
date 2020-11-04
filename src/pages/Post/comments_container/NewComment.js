import React, { useContext, useState, useEffect } from "react";
// store
import { store } from "../../../utils/store";
// HOCs
import WithLoader from "../../../HOCs/WithLoader";
import WithError from "../../../HOCs/WithError";
// styles
import postStyles from "../styles/Post.module.scss";

function NewComment({ setIsLoading, setIsError }) {
  const { state } = useContext(store);
  const [comment, setComment] = useState();
  const [error, setError] = useState(undefined);

  // Loading = false on page load.
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Add comment.
  const addComment = async () => {
    setIsLoading(true);

    if (comment.trim() !== "") {
      try {
        const res = await fetch("/api/addComment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment,
            userHandle: state.user.handle,
            userImageUrl: state.user.imageUrl,
            postId: state.post.data.postId,
            recepient: state.post.data.userHandle,
          }),
        });

        if (res.status === 404) {
          setIsError(true);
        }
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
      window.location.reload();
      // If empty...
    } else {
      const textarea = document.getElementById("comment");
      textarea.style.border = "2px solid red";
      setError(`Must not be empty`);
      setIsLoading(false);
    }
  };

  return (
    <form
      className={postStyles.new_comment_form}
      onSubmit={(e) => {
        e.preventDefault();
        addComment();
      }}
    >
      <textarea
        name="comment"
        rows="5"
        required
        id="comment"
        placeholder="comment..."
        onChange={(e) => {
          const textarea = document.getElementById("comment");
          textarea.style.border = "1px solid black";
          setError(undefined);
          setComment(e.target.value);
        }}
      />
      {error !== undefined && <p className="error_message">{error}</p>}
      <button type="submit">Send</button>
    </form>
  );
}

export default WithLoader(WithError(NewComment), "Wait...");
