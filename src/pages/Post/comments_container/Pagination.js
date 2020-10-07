import React, { useContext, useEffect } from "react";

// faunaDB
import { q, adminClient } from "../../../utils/faunaDB";
// store
import { store } from "../../../utils/store";
// styles
import postStyles from "../styles/Post.module.scss";

function Pagination() {
  const { state, dispatch } = useContext(store);

  const size = 5;

  const goToNextPage = async () => {
    const res = await adminClient.query(
      q.Map(
        q.Paginate(
          q.Reverse(
            q.Match(q.Index("comments_by_postId"), state.post.data.postId)
          ),
          {
            size,
            after: state.post.comments.after,
          }
        ),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );

    dispatch({ type: "SET_COMMENTS", payload: res });
  };

  const goToPrevPage = async () => {
    const res = await adminClient.query(
      q.Map(
        q.Paginate(
          q.Reverse(
            q.Match(q.Index("comments_by_postId"), state.post.data.postId)
          ),
          {
            size,
            after: state.post.comments.before,
          }
        ),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );

    console.log(res);

    dispatch({ type: "SET_COMMENTS", payload: res });
  };

  // Disable prev or forward buttons.
  useEffect(() => {
    if (
      state.post !== null &&
      state.post.comments !== null &&
      state.post.comments !== undefined
    ) {
      const prevBtn = document.getElementById("prev_btn");
      const nextBtn = document.getElementById("next_btn");
      // If there is no previous page...
      if (state.post.comments.before === undefined) {
        // disable 'prev' button.
        prevBtn.setAttribute("disabled", "disabled");
      } else {
        // If there is previous page, don't disable 'prev' button.
        prevBtn.removeAttribute("disabled");
      }
      if (state.post.comments.after === undefined) {
        nextBtn.setAttribute("disabled", "disabled");
      } else {
        nextBtn.removeAttribute("disabled");
      }
    }
  }, [state.post]);

  return (
    <div className={postStyles.pagination_container}>
      <button
        onClick={(e) => {
          e.preventDefault();
          goToPrevPage();
        }}
        id="prev_btn"
      >
        back
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          goToNextPage();
        }}
        id="next_btn"
      >
        forward
      </button>
    </div>
  );
}

export default Pagination;
