import React, { useEffect, useState, useContext, useRef } from "react";
import { Link } from "react-router-dom";
// store
import { StateProvider, store } from "../../utils/store";
// Styles
import postsInfoStyles from "./styles/Post_info.module.scss";
// Day.js
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
// Svgs
import redHeart from "../../img/svgs/new/red-heart.svg";
import blueHeart from "../../img/svgs/new/blue-heart.svg";
import transparentHeart from "../../img/svgs/new/transparent-heart.svg";

dayjs.extend(relativeTime);

function PostInfo({ post }) {
  const { state, dispatch } = useContext(store);
  const [readyToLike, setReadyToLike] = useState(true);
  const [readyToUnlike, setReadyToUnlike] = useState(true);

  const [zeroLikes, setZeroLikes] = useState();

  const [time, setTime] = useState();
  const [isLiked, setIsLiked] = useState(false);

  let isSubscribed = undefined;
  const subscribed = useRef(true);

  // Set time of the post submission.
  useEffect(() => {
    const d = dayjs(post.data.createdAt).fromNow();
    setTime(d);
  }, [post]);

  // Check if this post is liked by the user.
  useEffect(() => {
    setIsLiked(false);
    if (state.user.likes && state.user.likes.length !== 0) {
      state.user.likes.forEach((like) => {
        if (like.data.postId === post.data.postId) {
          setIsLiked(true);
        }
      });
    }
  }, [
    state.user.likes,
    state.posts,
    window.location.pathname,
    post.data.postId,
  ]);

  // Like post
  const likePost = () => {
    dispatch({ type: "SET_PENDING_POST_LIKE", payload: post.data.postId });
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

        dispatch({
          type: "CHANGE_LIKE_COUNT",
          payload: { newLikeCount, postId: post.data.postId },
        });

        if (subscribed.current) {
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
    if (post.data.likeCount === 1) {
      setZeroLikes(true);
    }
    dispatch({ type: "SET_PENDING_POST_UNLIKE", payload: post.data.postId });
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
        dispatch({
          type: "UNLIKE_POST",
          payload: { postId: post.data.postId },
        });

        dispatch({
          type: "CHANGE_LIKE_COUNT",
          payload: { newLikeCount, postId: post.data.postId },
        });

        if (subscribed.current) {
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

  // Change subscribed Ref.
  useEffect(() => {
    return () => {
      subscribed.current = isSubscribed;
    };
  }, [isSubscribed]);

  // Unsubscribe on unmount.
  useEffect(() => {
    return () => {
      isSubscribed = false;
    };
  }, []);

  return (
    <div className={postsInfoStyles.post_info}>
      <Link to={`/user/${post.data.userHandle}`}>
        <img
          src={post.data.userImageUrl}
          className={postsInfoStyles.user_image}
          alt="user"
        />
        <p>{post.data.userHandle}</p>
      </Link>
      <p lang="en">{time}</p>
      <p>{post.data.commentCount} comments</p>
      <div className={postsInfoStyles.likes}>
        {isLiked ? (
          <input
            title="unlike post"
            type="image"
            tabIndex="0"
            alt="like"
            id={postsInfoStyles.red_heart}
            src={redHeart}
            onClick={async () => {
              isSubscribed = true;
              if (
                isLiked &&
                readyToUnlike &&
                state.pendingPostUnlike !== post.data.postId
              ) {
                setReadyToLike(false);
                try {
                  setIsLiked(false);
                  await unlikePost();

                  if (subscribed.current) setReadyToLike(true);
                } catch (error) {
                  if (subscribed.current) setReadyToLike(true);
                }
              }
            }}
          />
        ) : (
          <input
            title="like post"
            type="image"
            tabIndex="0"
            id={postsInfoStyles.blue_heart}
            alt="like"
            className={!state.loggedIn ? postsInfoStyles.inactive_like : null}
            src={
              post.data.likeCount === 0 || zeroLikes
                ? transparentHeart
                : blueHeart
            }
            onClick={async () => {
              isSubscribed = true;
              if (
                state.loggedIn &&
                readyToLike &&
                state.pendingPostLike !== post.data.postId
              ) {
                setReadyToUnlike(false);
                try {
                  if (!isLiked) {
                    setIsLiked(true);
                    await likePost();

                    if (subscribed.current) setReadyToUnlike(true);
                  }
                } catch (error) {
                  if (subscribed.current) setReadyToUnlike(true);
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
