import React, { useContext, useRef, useEffect, useState } from "react";
// Components
import Post from "./Post";
import HomePagination from "./pagination/HomePagination";
import SearchPagination from "./pagination/SearchPagination";
import ProfilePagination from "./pagination/ProfilePagination";
// FaunaDB
import { q, adminClient } from "../../../utils/faunaDB";

// store
import { store } from "../../../utils/store";
// Styles
import postsContainerStyles from "../styles/Posts_container.module.scss";

function PostsContainer({ path }) {
  const { state, dispatch } = useContext(store);
  const [loading, setLoading] = useState(false);

  // Number of posts per page.
  const size = 5;

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

  const observer = useRef(
    new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && after.current) {
          loader.current();
        }
      },
      { threshold: 1 }
    )
  );
  const [element, setElement] = useState(null);

  useEffect(() => {
    after.current = state.posts.after;
  }, [state.posts.after]);

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

  useEffect(() => {
    loader.current = loadMore;
  }, [loadMore]);

  return (
    <div className={postsContainerStyles.posts}>
      {state.posts.data.map((post, index) => (
        <Post key={index} post={post} />
      ))}

      <div ref={setElement} id="load-more">
        {loading ? <p>Loading...</p> : <p>end</p>}
      </div>
    </div>
  );
}

export default PostsContainer;
