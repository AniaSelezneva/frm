import React, { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
// faunaDB
import { q, adminClient } from "../../utils/faunaDB";
// withLoader hoc
import WithLoader from "../../HOCs/WithLoader";
// styles
import postStyles from "./styles/Post.module.scss";
// components
import Layout from "../../HOCs/Layout";
import User from "../../modules/user_card/index";
import Comments from "./comments_container";
// store
import { store } from "../../utils/store";

function Post(props) {
  const { state, dispatch } = useContext(store);
  const { postId } = props.match.params;
  const { setIsLoading } = props;

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

  // Apply class to body to change background image on home page.
  // Apply class to root to have background only on home page.
  useEffect(() => {
    // Don't use background if window is small.
    if (window.innerWidth > 1055) {
      const body = document.getElementsByTagName("body")[0];
      body.setAttribute("id", `home_background`);

      const root = document.getElementById("root");
      root.setAttribute("class", `home_root_background`);
    }
  }, []);

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
  }, [window.location.pathname]);

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
    window.location.replace("/");
  };

  return (
    <Layout>
      <div className={postStyles.container}>
        <div className={postStyles.content}>
          {state.post !== null && (
            <div className={postStyles.post}>
              <div className={postStyles.post_main_body}>
                {state.post.data.imageUrl !== null &&
                  state.post.data.imageUrl !== undefined && (
                    <img
                      src={state.post.data.imageUrl}
                      width="200"
                      className={postStyles.post_image}
                    />
                  )}

                <p>{state.post.data.body}</p>
              </div>
              <div className={postStyles.post_info}>
                <Link to={`/user/${state.post.data.userHandle}`}>
                  <img
                    src={state.post.data.userImageUrl}
                    width="50"
                    className={postStyles.user_image}
                  />
                  <h6>{state.post.data.userHandle}</h6>
                </Link>
                <p>{state.post.data.commentCount} comments</p>
              </div>
            </div>
          )}
          {state.post !== null &&
            state.post.data.userHandle === state.user.handle && (
              <button
                onClick={() => {
                  deletePost();
                }}
              >
                delete post
              </button>
            )}
          <Comments />
        </div>
        <User path="post" />
      </div>
    </Layout>
  );
}

export default WithLoader(Post, "wait...");
