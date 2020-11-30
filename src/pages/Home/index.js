import React, { useEffect, useContext, useState } from "react";
import { Link } from "react-router-dom";
// withLoader hoc
import WithLoader from "../../HOCs/WithLoader";
// WithError hoc
import WithError from "../../HOCs/WithError";
// faunaDB
import { q, adminClient } from "../../utils/faunaDB";
// Store
import { store } from "../../utils/store";
// Components
import User from "../../modules/user_card";
import Layout from "../../HOCs/Layout";
import PostsContainer from "./posts_container/index";
import NewPost from "./posts_container/NewPost";
// Styles
import homeStyles from "./styles/Home.module.scss";
// auth
import auth from "../../utils/auth";

// HOME PAGE
function Home(props) {
  const { setIsLoading, setIsError } = props;
  const { state, dispatch } = useContext(store);
  const [path, setPath] = useState();
  const [error, setError] = useState(undefined);

  // Number of posts per page
  const size = 5;

  // User name for arbitrary user's route
  let userName = window.location.pathname
    .split("/")
    .pop()
    .split("%20")
    .join(" ");

  // Search query
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("query");

  // Confirmation token
  let confirmationToken = decodeURIComponent(window.location.hash)
    .substring(1)
    .split("confirmation_token=")[1];

  // Invite token
  let inviteToken = decodeURIComponent(window.location.hash)
    .substring(1)
    .split("invite_token=")[1];

  // Recovery token
  let recoveryToken = decodeURIComponent(window.location.hash)
    .substring(1)
    .split("recovery_token=")[1];

  // FUnction to check which path it is
  const checkPath = () => {
    const path = window.location.pathname;
    if (confirmationToken) {
      setPath("confirm");
    } else if (inviteToken) {
      setPath("invite");
    } else if (recoveryToken) {
      setPath("recovery");
    } else if (path === "/search") {
      setPath("search");
    } else if (path === "/") {
      setPath("home");
    } else if (path === "/profile") {
      setPath("profile");
    } else if (path.slice(0, 5) === "/user") {
      setPath("user");
    }
  };

  // Fetch posts depending on the path
  const fetchPosts = async () => {
    try {
      let res;

      if (path === "home") {
        // Fetch all posts
        res = await adminClient.query(
          q.Map(
            q.Paginate(q.Reverse(q.Match(q.Index("all_posts"))), { size }),
            q.Lambda("X", q.Get(q.Var("X")))
          )
        );
      } else if (path === "search") {
        window.scrollTo(0, 0);
        // Search in posts
        res = await adminClient.query(
          q.Map(
            q.Paginate(
              q.Reverse(q.Match(q.Index("posts_by_words7"), q.Casefold(query))),
              {
                size,
              }
            ),
            q.Lambda("ref", q.Get(q.Var("ref")))
          )
        );
      } else if (path === "user") {
        window.scrollTo(0, 0);
        // Get arbitrary user's posts
        res = await adminClient.query(
          q.Map(
            q.Paginate(q.Reverse(q.Match(q.Index("posts_by_user"), userName)), {
              size,
            }),
            q.Lambda("X", q.Get(q.Var("X")))
          )
        );
      } else if (path === "profile" && state.user.handle) {
        window.scrollTo(0, 0);
        // Get own user's posts
        res = await adminClient.query(
          q.Map(
            q.Paginate(
              q.Reverse(q.Match(q.Index("posts_by_user"), state.user.handle)),
              {
                size,
              }
            ),
            q.Lambda("X", q.Get(q.Var("X")))
          )
        );
      }

      dispatch({ type: "SET_POSTS", payload: res });
    } catch (error) {
      console.log(error);
      setIsError(true);
    }
    setIsLoading(false);
  };

  // Confirm token or redirect to 'signup' when user is invited
  useEffect(() => {
    // If path is 'confirm'...
    if (path === "confirm") {
      auth
        .confirm(confirmationToken, true)
        .then((response) => {
          // 1. login user ...
          window.localStorage.setItem("gotrue.user", JSON.stringify(response));
          // 2. go to home page.
          window.location.replace("/");
        })
        .catch((error) => {
          console.log(error);
          if (error.message === "User not found") {
            setError("User not found or email already confirmed");
          }
          setIsError(true);
        });
      setIsLoading(false);
    }

    // Redirect to login page if the user came with invitation.
    else if (path === "invite") {
      window.location.replace(`/signup/#invite_token=${inviteToken}`);
    }

    // Redirect to reset password page if user is using password recovery.
    else if (path === "recovery") {
      window.location.replace(
        `/resetpassword/#recovery_token=${recoveryToken}`
      );
    }
  }, [path]);

  // Get posts
  useEffect(() => {
    setIsLoading(true);
    // Load posts only if there are none in store or path changes(user goes to profile from home etc.)
    // and user doesn't go back to home page from post (no need to load posts again).
    if (
      path !== undefined &&
      // If user didn't come from 'post' and (there are no posts in the store or path changed)
      state.path !== "post" &&
      (Object.keys(state.posts).length === 0 || state.path !== path)
    ) {
      fetchPosts();
    } else {
      setIsLoading(false);
    }

    // Set path in the store
    if (path) {
      dispatch({ type: "SET_PATH", payload: path });
    }
  }, [path, state.path, state.user.handle]);

  // Check path on page load
  useEffect(() => {
    checkPath();
  }, [props.location.pathname]);

  return (
    <Layout>
      <div id={homeStyles.container}>
        <div id={homeStyles.posts_container}>
          {/* Confirm email path */}
          {path === "confirm" &&
            (!error ? (
              <p className={homeStyles.posts_header}>Email confirmed</p>
            ) : (
              <p className="error_message">{error}</p>
            ))}

          {/* Home path */}
          {path === "home" &&
            // If user is logged in...
            (state.loggedIn ? (
              <NewPost />
            ) : (
              // If not logged in...
              <p className={homeStyles.posts_header}>
                <Link to="/login">
                  <strong>login </strong>
                </Link>
                or
                <Link to="/signup">
                  <strong> signup </strong>
                </Link>
                to create a post
              </p>
            ))}

          {/* Search path */}
          {path === "search" &&
            Object.keys(state.posts).length > 0 &&
            // Nothing was found
            (state.posts.data && state.posts.data.length === 0 ? (
              <p className={homeStyles.posts_header}>Nothing was found</p>
            ) : (
              // Something was found
              <p className={homeStyles.posts_header}>
                Search results for: {query}
              </p>
            ))}

          {/* Profile path */}
          {path === "profile" && state.loggedIn && state.posts.data && (
            <>
              {state.posts.data.length > 0 ? (
                <h2 className={homeStyles.posts_header}>My posts</h2>
              ) : (
                <h2 className={homeStyles.posts_header}>
                  You haven't posted yet
                </h2>
              )}
            </>
          )}

          {/* Other user's path */}
          {path === "user" &&
            // If not initial state of otherUser(undefined), which means it's not loaded yet...
            (state.otherUser !== undefined ? (
              <h2 className={homeStyles.posts_header}>
                {/* User's name from pathname */}
                {state.posts.data && state.posts.data.length === 0
                  ? `${userName} hasn't posted yet`
                  : `Posts by ${userName}`}
              </h2>
            ) : (
              <h2 className={homeStyles.posts_header}>
                This user doesn't exist
              </h2>
            ))}

          {/* All posts */}
          <PostsContainer />
        </div>

        {/* Don't show user's card if user is not logged in*/}
        {(state.loggedIn || path === "user") && <User />}
      </div>
    </Layout>
  );
}

export default WithLoader(WithError(Home), "Loading posts...");
