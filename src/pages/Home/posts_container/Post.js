import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Styles
import postsContainerStyles from "../styles/Posts_container.module.scss";
// Components
import PostInfo from "../../../modules/post_info/PostInfo";

function Post({ post }) {
  const [body, setBody] = useState();

  let isSubscribed = true;

  // Limit length of the post body if it's too long.
  useEffect(() => {
    if (post.data.body.length > 49) {
      const cutString = post.data.body.substring(0, 50);
      if (isSubscribed) setBody(`${cutString}...`);
    } else {
      if (isSubscribed) setBody(post.data.body);
    }

    // Abort
    return () => {
      return () => (isSubscribed = false);
    };
  }, [post]);

  return (
    <div className={postsContainerStyles.post}>
      <div className={postsContainerStyles.post_main_body}>
        {post.data.imageUrl !== undefined && (
          <Link to={`/post/${post.data.postId}`}>
            <div className={postsContainerStyles.image_container}>
              <img
                alt="post image"
                src={post.data.imageUrl}
                className={postsContainerStyles.post_image}
                loading="lazy"
                width="200"
                height="200"
              />
            </div>
          </Link>
        )}

        <Link to={`/post/${post.data.postId}`}>
          <p>{body}</p>
        </Link>
      </div>

      <PostInfo post={post} />
    </div>
  );
}

export default Post;
