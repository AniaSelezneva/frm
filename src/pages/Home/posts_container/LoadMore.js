import React, { useContext } from "react";
// Store
import { store } from "../../../utils/store";
// FaunaDB
import { q, adminClient } from "../../../utils/faunaDB";
// Styles
import postsContainerStyles from "../styles/Posts_container.module.scss";

function LoadMore({ setLoading }) {
  const { state, dispatch } = useContext(store);
  const query = new URLSearchParams(window.location.search).get("query");

  // ************ FUNCTION ********************
  // Load more posts.
  const loadMore = async () => {
    setLoading(true);
    const path = state.path;
    let res;

    if (path === "search") {
      res = await adminClient.query(
        q.Map(
          q.Paginate(
            q.Reverse(q.Match(q.Index("posts_by_words7"), q.Casefold(query))),
            {
              size: state.size,
              after: state.posts.after,
            }
          ),
          q.Lambda("X", q.Get(q.Var("X")))
        )
      );
    } else if (path === "profile") {
      res = await adminClient.query(
        q.Map(
          q.Paginate(
            q.Reverse(q.Match(q.Index("posts_by_user"), state.user.handle)),
            {
              size: state.size,
              after: state.posts.after,
            }
          ),
          q.Lambda("X", q.Get(q.Var("X")))
        )
      );
    } else {
      res = await adminClient.query(
        q.Map(
          q.Paginate(q.Reverse(q.Match(q.Index("all_posts"))), {
            size: state.size,
            after: state.posts.after,
          }),
          q.Lambda("X", q.Get(q.Var("X")))
        )
      );
    }
    // Add posts to existing posts in the state.
    dispatch({ type: "ADD_POSTS", payload: res });
    setLoading(false);
  };

  return (
    <button
      id="load_more_button"
      className={postsContainerStyles.load_more_button}
      onClick={loadMore}
    >
      Load more
    </button>
  );
}

export default LoadMore;
