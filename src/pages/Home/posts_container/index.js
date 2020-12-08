import React, { useState, useContext } from "react";
// Components
import Post from "./Post";
import LoadMore from "./LoadMore";
// Store
import { store } from "../../../utils/store";
// Styles
import postsContainerStyles from "../styles/Posts_container.module.scss";

function PostsContainer() {
  const { state } = useContext(store);
  const [loading, setLoading] = useState(false);

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
            <LoadMore setLoading={setLoading} />
          )}
        </div>
      )}
    </div>
  );
}

export default PostsContainer;
