import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Styles
import postsContainerStyles from "../styles/Posts_container.module.scss";
// Components
import PostInfo from "./PostInfo";

function Post({ post }) {
  const [body, setBody] = useState();

  // Limit length of the post body if it's too long.
  useEffect(() => {
    if (post.data.body.length > 49) {
      const cutString = post.data.body.substring(0, 50);
      setBody(`${cutString}...`);
    } else {
      setBody(post.data.body);
    }
  }, [post]);

  return (
    <div className={postsContainerStyles.post}>
      {post.data.imageUrl !== undefined && (
        <Link
          to={`/post/${post.data.postId}`}
          className={postsContainerStyles.image_container}
        >
          <img
            src={post.data.imageUrl}
            className={postsContainerStyles.post_image}
          />
        </Link>
      )}

      <div>
        <Link to={`/post/${post.data.postId}`}>
          <p>{body}</p>
        </Link>

        <PostInfo
          userImageUrl={post.data.userImageUrl}
          userHandle={post.data.userHandle}
          commentCount={post.data.commentCount}
        />
      </div>
    </div>
  );
}

export default Post;
