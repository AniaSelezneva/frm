import React, { useContext, useState, useEffect } from "react";
// store
import { store } from "../../../utils/store";
// WithLoader
import WithLoader from "../../../HOCs/WithLoader";
// styles
import postStyles from "../styles/Post.module.scss";

function NewComment({ setIsLoading }) {
  const { state, dispatch } = useContext(store);
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
          setError("Something went wrong, try again later");
        }
      } catch (error) {
        setError("Something went wrong, try again later");
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
      onSubmit={async (e) => {
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
      <button type="submit">Send</button>
      {error !== undefined && <p className="error_message">{error}</p>}
    </form>
  );
}

export default WithLoader(NewComment, "Wait...");
