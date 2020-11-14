import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
// Styles
import postsContainerStyles from "../styles/Posts_container.module.scss";
// Components
import PostInfo from "../../../modules/post_info/PostInfo";

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
      <div className={postsContainerStyles.post_main_body}>
        {post.data.imageUrl !== undefined && (
          <Link
            to={`/post/${post.data.postId}`}
            className={postsContainerStyles.image_link}
          >
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
