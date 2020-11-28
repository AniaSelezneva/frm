import React, { useEffect, useContext, useState } from "react";
// FaunaDB
import { q, adminClient } from "../../utils/faunaDB";
// WithLoader hoc
import WithLoader from "../../HOCs/WithLoader";
import WithError from "../../HOCs/WithError";
// Styles
import postStyles from "./styles/Post.module.scss";
// Components
import Layout from "../../HOCs/Layout";
import User from "../../modules/user_card/index";
import Comments from "./comments_container";
import FullScreenImage from "./FullScreenImage";
import DeletePostModal from "./DeletePostModal";
import PostInfo from "../../modules/post_info/PostInfo";
// Store
import { store } from "../../utils/store";

function Post(props) {
  const { state, dispatch } = useContext(store);
  const { postId } = props.match.params;
  const { setIsLoading, setIsError } = props;

  const [showModal, setShowModal] = useState(undefined);
  const [showFullPageImage, setShowFullPageImage] = useState(undefined);

  // Fetch post
  const fetchPost = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await adminClient.query(
          q.Get(q.Match(q.Index("posts_by_id"), postId))
        );

        dispatch({ type: "SET_CURRENT_POST", payload: res });

        resolve("success");
      } catch (error) {
        console.log(error);
        // If there is no such post...
        if (error.message === "instance not found") {
          // ... go to home page.
          window.location.replace("/");
        }
        reject(error);
      }
    });
  };

  // Set path in the store
  useEffect(() => {
    dispatch({ type: "SET_PATH", payload: "post" });
  }, []);

  // Get comments
  const getComments = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await adminClient.query(
          q.Map(
            q.Paginate(
              q.Reverse(q.Match(q.Index("comments_by_postId"), postId)),
              { size: 5 }
            ),
            q.Lambda("X", q.Get(q.Var("X")))
          )
        );

        dispatch({ type: "SET_COMMENTS", payload: res });
        resolve("success");
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  // Get post with comments
  useEffect(() => {
    (async () => {
      try {
        await fetchPost();
        await getComments();
      } catch (error) {
        console.log(error);
        setIsError(true);
      }
      setIsLoading(false);
    })();

    // Cancel async tasks.
    return () => {
      const controller = new AbortController();
      controller.abort();
    };
  }, [window.location.pathname]);

  // Add event listener to post image to show full page image
  useEffect(() => {
    const image = document.getElementById("post_image");
    if (image) {
      let timeoutId;

      image.onclick = () => {
        if (timeoutId) clearTimeout(timeoutId);
        setShowFullPageImage(true);
      };

      // Do it with delay
      image.onmouseenter = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setShowFullPageImage(true);
        }, 400);
      };

      // Don't do it if mouse leaves
      image.onmouseleave = () => {
        clearTimeout(timeoutId);
      };
    }
  }, [state.post]);

  return (
    <Layout>
      <div className={postStyles.container}>
        <div className={postStyles.content}>
          {state.post !== null && (
            <div className={postStyles.post}>
              <div className={postStyles.post_main_body}>
                {state.post.data.imageUrl && (
                  <img
                    src={state.post.data.imageUrl}
                    width="200"
                    className={postStyles.post_image}
                    id="post_image"
                  />
                )}

                <p>{state.post.data.body}</p>
              </div>
              <PostInfo post={state.post} />
            </div>
          )}
          {state.post !== null &&
            state.post.data.userHandle === state.user.handle && (
              <button
                onClick={() => {
                  setShowModal(true);
                }}
              >
                delete post
              </button>
            )}
          <Comments />
        </div>
        {state.loggedIn && <User />}
      </div>

      {/* Full Page Image */}
      {showFullPageImage && state.post.data.imageUrl ? (
        <FullScreenImage
          url={state.post.data.imageUrl}
          toggleShow={setShowFullPageImage}
        />
      ) : null}

      {/* Delete post modal window */}
      {showModal && (
        <DeletePostModal setShowModal={setShowModal} postId={postId} />
      )}
    </Layout>
  );
}

export default WithLoader(WithError(Post), "Loading comments...");
