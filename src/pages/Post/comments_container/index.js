import React, { useContext, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
// styles
import postStyles from "../styles/Post.module.scss";
// components
import NewComment from "./NewComment";
import Comment from "./Comment";
// faunaDB
import { q, adminClient } from "../../../utils/faunaDB";

// store
import { store } from "../../../utils/store";

function Index() {
  const { state, dispatch } = useContext(store);
  const [loading, setLoading] = useState(false);
  const [element, setElement] = useState(null);

  const loadMore = async () => {
    setLoading(true);
    const res = await adminClient.query(
      q.Map(
        q.Paginate(
          q.Reverse(
            q.Match(q.Index("comments_by_postId"), state.post.data.postId)
          ),
          {
            size,
            after: after.current,
          }
        ),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );

    dispatch({ type: "ADD_COMMENTS", payload: res });
    setLoading(false);
  };

  const loader = useRef(loadMore);
  const after = useRef([]);

  // Number of posts per page.
  const size = 5;

  const observer = useRef(
    new IntersectionObserver(
      (entries) => {
        const bottomElement = entries[0];

        // If bottom element is visible and there is 'after' (there is next page)...
        if (bottomElement.isIntersecting) {
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
    if (currentElement && after.current && after.current.length > 0) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [element, after.current]);

  // Keep loader function up to date.
  useEffect(() => {
    loader.current = loadMore;
  }, [loadMore]);

  // Keep 'after' up to date.
  useEffect(() => {
    if (state.post && state.post.comments && state.post.comments.after) {
      after.current = state.post.comments.after;
    } else {
      after.current = [];
    }
  }, [state.post]);

  // Go to the top of the page in the beginning.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      {state.loggedIn ? (
        <NewComment />
      ) : (
        <p className={postStyles.posts_header}>
          <Link to="/login">
            <strong>login </strong>
          </Link>
          or
          <Link to="/signup">
            <strong> signup </strong>
          </Link>
          to leave a comment
        </p>
      )}

      {state.post !== null &&
        state.post.comments !== undefined &&
        state.post.comments.data !== undefined &&
        state.post.comments.data !== null &&
        state.post.comments.data.length > 0 &&
        state.post.comments.data.map((comment, index) => (
          <Comment comment={comment} key={index} />
        ))}

      <div ref={setElement} id="load-more">
        {loading ? (
          <p className={postStyles.loading_message}>Loading...</p>
        ) : (
          <p className={postStyles.end_message}>End</p>
        )}
      </div>
    </div>
  );
}

export default Index;
