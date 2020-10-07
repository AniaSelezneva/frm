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
import AllPosts from "./posts_container";
import NewPost from "./posts_container/NewPost";
// Styles
import homeStyles from "./styles/Home.module.scss";

// HOME PAGE
function Home(props) {
  const { setIsLoading } = props;
  const { state, dispatch } = useContext(store);
  const [path, setPath] = useState();

  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("query");

  // Number of posts per page
  const size = 5;

  // Check which route it is.
  const checkPath = () => {
    if (
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
    } else if (window.location.pathname.slice(0, 6)) {
      setPath("user");
    }
  };

  // Check path on page load.
  useEffect(() => {
    checkPath();
  }, [window.location.pathname]);

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
    } else {
      setIsLoading(false);
    }
  }, [path, state.user.handle]);

  // Fetch all posts.
  const getAllPosts = async () => {
    const res = await adminClient.query(
      q.Map(
        q.Paginate(q.Reverse(q.Match(q.Index("all_posts"))), { size }),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );

    dispatch({ type: "SET_POSTS", payload: res });

    setIsLoading(false);
  };

  // Fetch logged in user's posts.
  const getOwnPosts = async () => {
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
  };

  // Search in posts.
  const searchInPosts = async () => {
    const res = await adminClient.query(
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

    dispatch({ type: "SET_POSTS", payload: res });

    dispatch({ type: "SET_QUERY", payload: query });

    setIsLoading(false);
  };

  // Get other user's posts.
  const getUserPosts = async () => {
    const res = await adminClient.query(
      q.Map(
        q.Paginate(
          q.Reverse(
            q.Match(
              q.Index("posts_by_user"),
              window.location.pathname.split("/").pop()
            )
          ),
          {
            size,
          }
        ),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );

    dispatch({ type: "SET_POSTS", payload: res });
    setIsLoading(false);
  };

  // Apply class to body to change background image on home page.
  // Apply class to root not to have this background image in the middle of the page.
  useEffect(() => {
    // Don't use background if window is small.
    if (window.innerWidth > 1055) {
      const body = document.getElementsByTagName("body")[0];
      body.setAttribute("id", `${homeStyles.home_background}`);

      const root = document.getElementById("root");
      root.setAttribute("class", `${homeStyles.home_root_background}`);
    }
  }, []);

  return (
    <Layout>
      <div id={homeStyles.container}>
        <div id={homeStyles.posts_container}>
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
              <NewPost />
              <h2 className={homeStyles.posts_header}>My posts</h2>
            </>
          )}

          {/* Other user's path */}
          {path === "user" && (
            <h2 className={homeStyles.posts_header}>
              {/* User's name from pathname */}
              {window.location.pathname.split("/")[2]}
            </h2>
          )}

          <AllPosts />
        </div>
        <User path={path} handle={window.location.pathname.split("/")[2]} />
      </div>
    </Layout>
  );
}

export default WithLoader(Home, "wait...");
