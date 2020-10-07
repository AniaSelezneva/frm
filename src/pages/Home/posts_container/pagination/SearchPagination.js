import React, { useContext, useEffect } from "react";

// faunaDB
import { q, adminClient } from "../../../../utils/faunaDB";
// store
import { store } from "../../../../utils/store";

function SearchPagination() {
  const { state, dispatch } = useContext(store);

  const goToNextPage = async (size) => {
    const res = await adminClient.query(
      q.Map(
        q.Paginate(
          q.Reverse(q.Match(q.Index("posts_by_words7"), state.query)),
          {
            size,
            after: state.posts.after,
          }
        ),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );

    dispatch({ type: "SET_POSTS", payload: res });
    window.scrollTo(0, 350);
  };

  const goToPrevPage = async (size) => {
    const res = await adminClient.query(
      q.Map(
        q.Paginate(
          q.Reverse(q.Match(q.Index("posts_by_words7"), state.query)),
          {
            size,
            before: state.posts.before,
          }
        ),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );

    dispatch({ type: "SET_POSTS", payload: res });
    window.scrollTo(0, 350);
  };

  // Disable prev or forward buttons.
  useEffect(() => {
    const prevBtn = document.getElementById("prev_btn");
    const nextBtn = document.getElementById("next_btn");
    // If there is no previous page...
    if (state.posts.before === undefined) {
      // disable 'prev' button.
      prevBtn.setAttribute("disabled", "disabled");
    } else {
      // If there is previous page, don't disable 'prev' button.
      prevBtn.removeAttribute("disabled");
    }
    if (state.posts.after === undefined) {
      nextBtn.setAttribute("disabled", "disabled");
    } else {
      nextBtn.removeAttribute("disabled");
    }
  }, [state.posts]);

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          goToPrevPage(3);
        }}
        id="prev_btn"
      >
        back
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          goToNextPage(3);
        }}
        id="next_btn"
      >
        forward
      </button>
    </>
  );
}

export default SearchPagination;
