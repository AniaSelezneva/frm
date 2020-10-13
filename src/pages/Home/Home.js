import React, { useEffect, useContext, useState } from "react";
import { Link } from "react-router-dom";
// withLoader hoc
import WithLoader from "../../HOCs/WithLoader";
// faunaDB
import { q, adminClient } from "../../utils/faunaDB";
// store
import { store } from "../../utils/store";
// Components
import User from "../../modules/user_card";
import Layout from "../../HOCs/Layout";
import PostsContainer from "./posts_container/PostsContainer";
import NewPost from "./posts_container/NewPost";
// Styles
import homeStyles from "./styles/Home.module.scss";
// auth
import auth from "../../utils/auth";

// HOME PAGE
function Home({ setIsLoading }) {
  const { state, dispatch } = useContext(store);
  const [path, setPath] = useState();
  const [error, setError] = useState(undefined);
  // Number of posts per page
  const size = 5;

  // User name for any user's route
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

  // Check which route it is.
  const checkPath = () => {
    if (confirmationToken !== undefined) {
      setPath("confirm");
    } else if (inviteToken !== undefined) {
      setPath("invite");
    } else if (
      window.location.pathname === "/search" ||
      window.location.pathname === "/search/"
    ) {
      setPath("search");
    } else if (window.location.pathname === "/") {
      setPath("home");
    } else if (
      window.location.pathname === "/profile" ||
      window.location.pathname === "/profile/"
    ) {
      setPath("profile");
    } else if (window.location.pathname.slice(0, 5) === "/user") {
      setPath("user");
    }
  };

  // Fetch all posts.
  const getAllPosts = async () => {
    try {
      const res = await adminClient.query(
        q.Map(
          q.Paginate(q.Reverse(q.Match(q.Index("all_posts"))), { size }),
          q.Lambda("X", q.Get(q.Var("X")))
        )
      );

      dispatch({ type: "SET_POSTS", payload: res });

      setIsLoading(false);
    } catch (error) {
      setError("Something went wrong, please try again later");
      setIsLoading(false);
    }
  };

  // Fetch logged in user's posts.
  const getOwnPosts = async () => {
    try {
      const res = await adminClient.query(
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

      dispatch({ type: "SET_POSTS", payload: res });
      setIsLoading(false);
    } catch (error) {
      setError("Something went wrong, please try again later");
      setIsLoading(false);
    }
  };

  // Search in posts.
  const searchInPosts = async () => {
    try {
      const res = await adminClient.query(
        q.Map(
          q.Paginate(
            q.Reverse(q.Match(q.Index("posts_by_words7"), q.Casefold(query))),
            {
              size: 2,
            }
          ),
          q.Lambda("ref", q.Get(q.Var("ref")))
        )
      );

      dispatch({ type: "SET_POSTS", payload: res });
      dispatch({ type: "SET_QUERY", payload: query });
      setIsLoading(false);
    } catch (error) {
      setError("Something went wrong, please try again later");
      setIsLoading(false);
    }
  };

  // Get other user's posts.
  const getUserPosts = async () => {
    const res = await adminClient.query(
      q.Map(
        q.Paginate(q.Reverse(q.Match(q.Index("posts_by_user"), userName)), {
          size,
        }),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );

    dispatch({ type: "SET_POSTS", payload: res });
  };

  // Apply classes to body and root to change background image on home page.
  useEffect(() => {
    // Don't use background if window is small.
    if (window.innerWidth > 1055) {
      const body = document.getElementsByTagName("body")[0];
      body.setAttribute("id", `home_background`);

      const root = document.getElementById("root");
      root.setAttribute("class", `home_root_background`);
    }
  }, []);

  // Confirm token or redirect to 'signup' when user is invited.
  useEffect(() => {
    if (path === "confirm") {
      auth
        .confirm(confirmationToken, true)
        .then((response) => {
          window.localStorage.setItem("gotrue.user", JSON.stringify(response));
          window.location.replace("/");
        })
        .catch((error) => {
          console.log(error);
          if (error.message === "User not found") {
            setError("User not found or email already confirmed");
          }
        });
    }

    // Redirect to login page if the user came with invitation.
    if (path === "invite") {
      window.location.replace(`/signup/#invite_token=${inviteToken}`);
    }
  }, [path]);

  // Get posts.
  useEffect(() => {
    setIsLoading(true);
    if (path === "home") {
      getAllPosts();
    } else if (path === "search") {
      searchInPosts();
    } else if (path === "user") {
      getUserPosts();
    } else if (
      path === "profile" &&
      state.user.handle !== null &&
      state.user.handle !== undefined
    ) {
      getOwnPosts();
    }
    setIsLoading(false);
  }, [path, state.user.handle]);

  // Check path on page load.
  useEffect(() => {
    checkPath();
  }, [window.location.pathname]);

  return (
    <Layout>
      <div id={homeStyles.container}>
        <div id={homeStyles.posts_container}>
          {/* Confirm email path */}
          {path === "confirm" &&
            (error === undefined ? (
              <p className={homeStyles.posts_header}>Email confirmed</p>
            ) : (
              <p className="error_message">{error}</p>
            ))}

          {/* Home path */}
          {path === "home" &&
            // If logged in...
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
          {path === "search" && (
            <p className={homeStyles.posts_header}>
              Search results for: {query}
            </p>
          )}

          {/* Profile path */}
          {path === "profile" && state.loggedIn && (
            <>
              {state.posts.data !== undefined && state.posts.data.length > 0 ? (
                <h2 className={homeStyles.posts_header}>My posts</h2>
              ) : (
                <h2 className={homeStyles.posts_header}>
                  You haven't posted yet
                </h2>
              )}
            </>
          )}

          {/* Other user's path */}
          {path === "user" && (
            <h2 className={homeStyles.posts_header}>
              {/* User's name from pathname */}
              {userName}
            </h2>
          )}

          {/* All posts */}
          <PostsContainer path={path} />
        </div>

        {/* Don't show user's card on the right if it's 'confirm' or 'invite' path */}
        {path !== "confirm" && path !== "invite" && (
          <User path={path} handle={userName} />
        )}
      </div>
    </Layout>
  );
}

export default WithLoader(Home, "wait...");
