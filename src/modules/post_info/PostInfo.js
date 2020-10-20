import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
// store
import { store } from "../../utils/store";
// Styles
import postsInfoStyles from "./styles/Post_info.module.scss";
// Day.js
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
// Svgs
import redHeart from "../../img/svgs/red-heart.svg";
import blueHeart from "../../img/svgs/blue-heart.svg";
import transparentHeart from "../../img/svgs/transparent-heart.svg";

dayjs.extend(relativeTime);

function PostInfo({ post }) {
  const { state, dispatch } = useContext(store);
  const [ready, setReady] = useState(true);

  const [time, setTime] = useState();
  const [isLiked, setIsLiked] = useState(false);

  let isSubscribed = true;

  // Set time of the post submission.
  useEffect(() => {
    const d = dayjs(post.data.createdAt).fromNow();
    setTime(d);
  }, [post]);

  // Check if this post is liked by the user.
  useEffect(() => {
    setIsLiked(false);
    if (
      state.user.likes !== undefined &&
      state.user.likes !== null &&
      state.user.likes.length !== 0
    ) {
      state.user.likes.forEach((like) => {
        if (like.data.postId === post.data.postId) {
          setIsLiked(true);
        }
      });
    }

    return () => (isSubscribed = false);
  }, [state.user.likes, state.posts, window.location.pathname]);

  // Like post
  const likePost = () => {
    setReady(false);
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch("/api/like", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userHandle: state.user.handle,
            postId: post.data.postId,
            recepient: post.data.userHandle,
          }),
        });

        const newLikeCount = post.data.likeCount + 1;
        const like = await res.json();

        if (isSubscribed) {
          if (like === "Already liked") {
            dispatch({
              type: "LIKE_POST",
              payload: {
                like: {
                  data: {
                    postId: post.data.postId,
                    userHandle: post.data.userHandle,
                  },
                },
                postId: post.data.postId,
              },
            });
          } else {
            dispatch({
              type: "LIKE_POST",
              payload: { like, postId: post.data.postId },
            });
          }

          dispatch({
            type: "CHANGE_LIKE_COUNT",
            payload: { newLikeCount, postId: post.data.postId },
          });

          if (res.status < 400) {
            resolve("success");
          } else if (res.status >= 400) {
            reject("Already liked");
          }
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  // Unlike post
  const unlikePost = () => {
    setReady(false);
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch("/api/unlike", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userHandle: state.user.handle,
            postId: post.data.postId,
            likeCount: post.data.likeCount - 1,
            recepient: post.data.userHandle,
          }),
        });

        const newLikeCount = post.data.likeCount - 1;

        if (isSubscribed) {
          dispatch({
            type: "UNLIKE_POST",
            payload: { postId: post.data.postId },
          });

          dispatch({
            type: "CHANGE_LIKE_COUNT",
            payload: { newLikeCount, postId: post.data.postId },
          });

          if (res.status < 400) {
            resolve("success");
          } else if (res.status >= 400) {
            reject("Post isn't liked");
          }
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  return (
    <div className={postsInfoStyles.post_info}>
      <Link to={`/user/${post.data.userHandle}`}>
        <img
          src={post.data.userImageUrl}
          className={postsInfoStyles.user_image}
          alt="user"
        />
        <h6>{post.data.userHandle}</h6>
      </Link>
      <p lang="en">{time}</p>
      <p>{post.data.commentCount} comments</p>
      <div className={postsInfoStyles.likes}>
        {isLiked ? (
          <img
            tabIndex="0"
            alt="like"
            id={postsInfoStyles.red_heart}
            src={redHeart}
            onClick={async () => {
              if (isLiked && ready) {
                try {
                  setIsLiked(false);
                  await unlikePost();

                  setReady(true);
                } catch (error) {
                  setReady(true);
                }
              }
            }}
            onKeyDown={async (e) => {
              if (e.key !== "Tab") {
                if (isLiked && ready) {
                  try {
                    setIsLiked(false);
                    await unlikePost();

                    setReady(true);
                  } catch (error) {
                    setReady(true);
                  }
                }
              }
            }}
          />
        ) : (
          <img
            tabIndex="0"
            id={postsInfoStyles.blue_heart}
            alt="like"
            className={!state.loggedIn ? postsInfoStyles.inactive_like : null}
            src={post.data.likeCount > 0 ? blueHeart : transparentHeart}
            onClick={async () => {
              if (state.loggedIn && ready) {
                try {
                  if (!isLiked) {
                    setIsLiked(true);
                    await likePost();

                    setReady(true);
                  }
                } catch (error) {
                  setReady(true);
                }
              }
            }}
            onKeyDown={async (e) => {
              if (e.key !== "Tab") {
                if (state.loggedIn && ready) {
                  try {
                    if (!isLiked) {
                      setIsLiked(true);
                      await likePost();

                      setReady(true);
                    }
                  } catch (error) {
                    setReady(true);
                  }
                }
              }
            }}
          />
        )}
        {post.data.likeCount > 0 && <p>{post.data.likeCount}</p>}
      </div>
    </div>
  );
}

export default PostInfo;
