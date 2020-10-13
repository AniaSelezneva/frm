import React, { useContext, useEffect } from "react";
// Components
import Post from "./Post";
import HomePagination from "./pagination/HomePagination";
import SearchPagination from "./pagination/SearchPagination";
import ProfilePagination from "./pagination/ProfilePagination";
// store
import { store } from "../../../utils/store";
// Styles
import postsContainerStyles from "../styles/Posts_container.module.scss";

function PostsContainer({ path, setReady }) {
  const { state } = useContext(store);

  return (
    <div className={postsContainerStyles.posts}>
      {state.posts.data !== undefined &&
        state.posts.data.length > 0 &&
        state.posts.data.map((post, index) => <Post key={index} post={post} />)}
      <div className={postsContainerStyles.pagination_container}>
        {path === "search" ? (
          <SearchPagination setReady={setReady} />
        ) : path === "profile" ? (
          state.loggedIn && <ProfilePagination />
        ) : (
          <HomePagination />
        )}
      </div>
    </div>
  );
}

export default PostsContainer;
