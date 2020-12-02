import React, { useContext, useState } from "react";
// Components
import Post from "./Post";
// FaunaDB
import { q, adminClient } from "../../../utils/faunaDB";
// Store
import { store } from "../../../utils/store";
// Styles
import postsContainerStyles from "../styles/Posts_container.module.scss";

function PostsContainer({ size }) {
  const { state, dispatch } = useContext(store);
  const [loading, setLoading] = useState(false);

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
            q.Reverse(
              q.Match(q.Index("posts_by_words7"), q.Casefold(state.query))
            ),
            {
              size,
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
              size,
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
            size,
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

  // ************* RETURN *********************
  return (
    <div className={postsContainerStyles.posts}>
      {state.posts &&
        state.posts.data &&
        state.posts.data.map((post, index) => <Post key={index} post={post} />)}

      {state.posts && state.posts.after && (
        <div className={postsContainerStyles.load_more}>
          {loading ? (
            <p className={postsContainerStyles.loading_message}>Loading...</p>
          ) : (
            <button
              id="load_more_button"
              className={postsContainerStyles.load_more_button}
              onClick={loadMore}
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PostsContainer;
