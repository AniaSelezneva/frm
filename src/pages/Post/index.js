import React, { useEffect, useContext, useState } from "react";
// FaunaDB
import { q, adminClient } from "../../utils/faunaDB";
// WithLoader hoc
import WithLoader from "../../HOCs/WithLoader";
// Styles
import postStyles from "./styles/Post.module.scss";
// Components
import Layout from "../../HOCs/Layout";
import User from "../../modules/user_card/index";
import Comments from "./comments_container";
import FullPageImage from "./FullPageImage";
// Store
import { store } from "../../utils/store";
import PostInfo from "../../modules/post_info/PostInfo";

function Post(props) {
  const { state, dispatch } = useContext(store);
  const { postId } = props.match.params;
  const { setIsLoading } = props;

  const [showModal, setShowModal] = useState(undefined);
  const [showFullPageImage, setShowFullPageImage] = useState(undefined);

  // Fetch post.
  const getPost = () => {
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

  // Get comments.
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

  // Delete post.
  const deletePost = async () => {
    const promises = [];
    // delete comments
    state.post.comments.data.forEach((comment) => {
      promises.push(adminClient.query(q.Delete(comment.ref)));
    });

    // delete notifications associated with this post
    const notifications = await adminClient.query(
      q.Map(
        q.Paginate(
          q.Match(q.Index("notifications_by_postid"), state.post.data.postId)
        ),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );
    notifications.data.forEach((notification) => {
      promises.push(adminClient.query(q.Delete(notification.ref)));
    });

    // await for comments and notifications to be deleted

    await Promise.all(promises);
    // delete post itself
    await adminClient.query(q.Delete(state.post.ref));
    setShowModal(false);
    window.history.back();
  };

  // Show delete post modal.
  const appendModal = () => {
    const modalOverlay = document.createElement("div");
    modalOverlay.setAttribute("class", `${postStyles.modal_container}`);
    modalOverlay.setAttribute("id", `modal`);
    modalOverlay.addEventListener("click", () => {
      setShowModal(false);
    });

    const modalWindow = document.createElement("div");
    modalWindow.setAttribute("class", `${postStyles.modal_window}`);
    modalWindow.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    const text = document.createElement("p");
    text.innerHTML = "Are you sure you want to remove the post permanently?";

    const buttonContainer = document.createElement("div");
    buttonContainer.setAttribute("class", `${postStyles.button_container}`);

    const yesButton = document.createElement("button");
    yesButton.innerHTML = "yes";
    yesButton.addEventListener("click", () => {
      deletePost();
    });

    const noButton = document.createElement("button");
    noButton.innerHTML = "no";
    noButton.addEventListener("click", () => {
      setShowModal(false);
    });

    buttonContainer.appendChild(yesButton);
    buttonContainer.appendChild(noButton);

    modalWindow.appendChild(text);
    modalWindow.appendChild(buttonContainer);
    modalOverlay.appendChild(modalWindow);

    const root = document.getElementById("root");
    root.appendChild(modalOverlay);
  };

  // Hide modal window.
  const hideModal = () => {
    document
      .getElementById("root")
      .removeChild(document.getElementById("modal"));
  };

  // Show or hide modal.
  useEffect(() => {
    if (showModal !== undefined) {
      if (showModal) {
        appendModal();
      } else {
        hideModal();
      }
    }
  }, [showModal]);

  // Get post with comments.
  useEffect(() => {
    (async () => {
      try {
        await getPost();
        await getComments();
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    })();

    // Cancel async tasks.
    return () => {
      const controller = new AbortController();
      controller.abort();
    };
  }, [window.location.pathname]);

  // Add event listener to post image to show modal with image of original size.
  useEffect(() => {
    const image = document.getElementById("post_image");
    if (image) {
      let timeoutId;

      image.onclick = () => {
        if (timeoutId) clearTimeout(timeoutId);
        setShowFullPageImage(true);
      };

      // Do it with delay.
      image.onmouseenter = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setShowFullPageImage(true);
        }, 300);
      };

      // Don't do it if mouse leaves.
      // Hide it when the mouse leaves.
      image.onmouseleave = () => {
        //setShowFullPageImage(false);
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
        <User path="post" />
      </div>

      {/* Full Page Image */}
      {showFullPageImage && state.post.data.imageUrl ? (
        <FullPageImage
          url={state.post.data.imageUrl}
          toggleShow={setShowFullPageImage}
        />
      ) : null}
    </Layout>
  );
}

export default WithLoader(Post, "wait...");
