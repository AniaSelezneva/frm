import React, { useEffect, useState, useContext } from "react";
// Components
import Post from "./Post";
import HomePagination from "./pagination/HomePagination";
import SearchPagination from "./pagination/SearchPagination";
import ProfilePagination from "./pagination/ProfilePagination";
// store
import { store } from "../../../utils/store";
// Styles
import postsContainerStyles from "../styles/Posts_container.module.scss";

// Index checks which url is that and sets proper pagination based on that.
function Index() {
  const { state, dispatch } = useContext(store);

  // State
  const [isSearch, setIsSearch] = useState();
  const [isProfile, setIsProfile] = useState();

  // Check if there are search params in url.
  const checkIfSearch = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get("query");
    if (search === null) {
      setIsSearch(false);
    } else {
      setIsSearch(true);
    }
  };

  // Check if it's user's profile url.
  const checkIfProfile = () => {
    if (
      window.location.pathname === "/profile" ||
      window.location.pathname === "/profile/"
    ) {
      setIsProfile(true);
    } else {
      setIsProfile(false);
    }
  };

  // Check what's in url => pagination is based on that.
  useEffect(() => {
    checkIfSearch();
    checkIfProfile();
  }, [window.location.pathname]);

  return (
    <div className={postsContainerStyles.posts}>
      {state.posts.data !== undefined &&
        state.posts.data.map((post, index) => <Post key={index} post={post} />)}
      <div className={postsContainerStyles.pagination_container}>
        {isSearch ? (
          <SearchPagination />
        ) : isProfile ? (
          state.loggedIn && <ProfilePagination />
        ) : (
          <HomePagination />
        )}
      </div>
    </div>
  );
}

export default Index;
