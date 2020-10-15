import React, { useContext, useRef, useEffect, useState } from "react";
// Components
import Post from "./Post";
// FaunaDB
import { q, adminClient } from "../../../utils/faunaDB";
// Store
import { store } from "../../../utils/store";
// Styles
import postsContainerStyles from "../styles/Posts_container.module.scss";

function PostsContainer({ path }) {
  const { state, dispatch } = useContext(store);
  const [loading, setLoading] = useState(false);
  const [element, setElement] = useState(null);

  // Function to load more posts.
  const loadMore = async () => {
    setLoading(true);
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
    dispatch({ type: "ADD_POSTS", payload: res });
    setLoading(false);
  };

  const loader = useRef(loadMore);
  const after = useRef(state.posts.after);

  // Number of posts per page.
  const size = 5;

  const observer = useRef(
    new IntersectionObserver(
      (entries) => {
        const bottomElement = entries[0];
        // If bottom element is visible and there is 'after' (there is next page)...
        if (bottomElement.isIntersecting && after.current) {
          // ... use loader function.
          loader.current();
        }
      },
      { threshold: 1 }
    )
  );

  // Attach observer to element, return unobserve.
  useEffect(() => {
    const currentElement = element;
    const currentObserver = observer.current;

    if (currentElement) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [element]);

  // Keep loader function up to date.
  useEffect(() => {
    loader.current = loadMore;
  }, [loadMore]);

  // Keep 'after' up to date.
  useEffect(() => {
    after.current = state.posts.after;
  }, [state.posts.after]);

  return (
    <div className={postsContainerStyles.posts}>
      {state.posts.data &&
        state.posts.data.map((post, index) => <Post key={index} post={post} />)}

      <div ref={setElement} id="load-more">
        {loading ? (
          <p className={postsContainerStyles.loading_message}>Loading...</p>
        ) : (
          <p className={postsContainerStyles.end_message}>End</p>
        )}
      </div>
    </div>
  );
}

export default PostsContainer;
