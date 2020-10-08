import React, { useContext, useEffect } from "react";
// FaunaDB
import { q, adminClient } from "../../../../utils/faunaDB";
// Store
import { store } from "../../../../utils/store";

// Navigate through posts on the home page.
function HomePagination() {
  const { state, dispatch } = useContext(store);

  // Number of posts per page.
  const size = 5;

  // Next page
  const goToNextPage = async () => {
    const res = await adminClient.query(
      q.Map(
        q.Paginate(q.Reverse(q.Match(q.Index("all_posts"))), {
          size,
          after: state.posts.after,
        }),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );

    dispatch({ type: "SET_POSTS", payload: res });
    window.scrollTo(0, 0);
  };

  // Previous page
  const goToPrevPage = async () => {
    const res = await adminClient.query(
      q.Map(
        q.Paginate(q.Reverse(q.Match(q.Index("all_posts"))), {
          size,
          before: state.posts.before,
        }),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );

    dispatch({ type: "SET_POSTS", payload: res });
    window.scrollTo(0, 0);
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
    </>
  );
}

export default HomePagination;
