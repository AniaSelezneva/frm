import React, { useState, useContext, useEffect } from "react";
// store
import { store } from "../../utils/store";
// faunaDB
import { q, adminClient } from "../../utils/faunaDB";
// HOCs
import WithError from "../../HOCs/WithError";
import WithLoader from "../../HOCs/WithLoader";
// firebase
import firebase from "firebase/app";
import "firebase/storage";
// config for firebase
import config from "../../utils/config";
// uuid
import uuid from "react-uuid";
// Styles
import userCardStyles from "./styles/index.module.scss";

function UploadImage({ setIsLoading, setIsError }) {
  const { state, dispatch } = useContext(store);
  const [image, setImage] = useState();
  const [imageFileName, setImageFileName] = useState(undefined);

  let imageUrl;

  // Upload avatar (bundler function)
  const uploadImage = async () => {
    setIsLoading(true);

    try {
      // Initialize only if not initialized previously.
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }

      const imageExtension = image.name.split(".").pop();

      const imageFileName = `${uuid()}.${imageExtension}`;

      // Root reference.
      var storageRef = firebase.storage().ref();
      // Reference to new file.
      var imageRef = storageRef.child(imageFileName);

      await imageRef.put(image);

      await updateUserImageUrl(imageFileName);

      await updateUserImageInPosts(imageFileName);

      await updateUserImageInComments(imageFileName);

      dispatch({ type: "CHANGE_AVATAR", payload: { imageUrl } });
    } catch (error) {
      console.log(error);
      setIsError(true);
    }
    setIsLoading(false);
  };

  // Update user image in user document in 'users' collection.
  const updateUserImageUrl = (img) => {
    imageUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.REACT_APP_BUCKET}/o/${img}?alt=media`;
    return new Promise(async (resolve, reject) => {
      try {
        await adminClient.query(
          q.Update(state.user.userDbRef, {
            data: {
              imageUrl,
            },
          })
        );

        resolve("Successfully updated image URL");
      } catch (error) {
        reject(error);
      }
    });
  };

  // Update user image in comments.
  const updateInComments = (allComments, img) => {
    const promises = [];

    allComments.data.forEach((commentRef) => {
      const promise = new Promise(async (resolve, reject) => {
        adminClient.query(
          q.Update(commentRef, {
            data: {
              userImageUrl: `https://firebasestorage.googleapis.com/v0/b/${process.env.REACT_APP_BUCKET}/o/${img}?alt=media`,
            },
          })
        );
        resolve("success");
      });
      promises.push(promise);
    });

    return promises;
  };
  const updateUserImageInComments = (img) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Refs
        const allComments = await adminClient.query(
          q.Paginate(
            q.Reverse(q.Match(q.Index("comments_by_user"), state.user.handle)),
            {
              size: 1000,
            }
          )
        );

        await Promise.all(updateInComments(allComments, img));

        resolve("Successfully updated image URL in comments");
      } catch (error) {
        reject(error);
      }
    });
  };

  // Update user image in post (userImageUrl).
  const updateInPosts = (allPosts, img) => {
    const promises = [];

    allPosts.data.forEach((postRef) => {
      const promise = new Promise(async (resolve, reject) => {
        adminClient.query(
          q.Update(postRef, {
            data: {
              userImageUrl: `https://firebasestorage.googleapis.com/v0/b/${process.env.REACT_APP_BUCKET}/o/${img}?alt=media`,
            },
          })
        );
        resolve("success");
      });
      promises.push(promise);
    });

    return promises;
  };
  const updateUserImageInPosts = (img) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Refs
        const allPosts = await adminClient.query(
          q.Paginate(
            q.Reverse(q.Match(q.Index("posts_by_user"), state.user.handle)),
            {
              size: 1000,
            }
          )
        );

        await Promise.all(updateInPosts(allPosts, img));

        resolve("Successfully updated image URL");
      } catch (error) {
        reject(error);
      }
    });
  };

  // Loading = false when page is loaded.
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      <form
        id={userCardStyles.upload_image_form}
        encType="multipart/form-data"
        onSubmit={(e) => {
          e.preventDefault();
          if (imageFileName === undefined) {
            const message = document.getElementsByClassName("choose_image")[0];
            message.style.color = "red";

            setTimeout(() => {
              message.style.color = "grey";
            }, 3000);
          } else {
            uploadImage();
          }
        }}
      >
        <label
          htmlFor="avatar"
          className="custom_file_upload"
          tabIndex="0"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const hiddenInput = document.getElementById("avatar");
              hiddenInput.click();
            }
          }}
        >
          New image:
          <br />
          {imageFileName !== "" &&
          imageFileName !== undefined &&
          imageFileName !== null ? (
            <span className="choose_image"> {imageFileName}</span>
          ) : (
            <span id={userCardStyles.choose_image} className="choose_image">
              choose an image
            </span>
          )}
        </label>

        {/* Hidden input */}
        <input
          type="file"
          id="avatar"
          name="avatar"
          accept="image/png, image/jpeg"
          onChange={(e) => {
            setImageFileName(e.target.files[0].name);
            setImage(e.target.files[0]);

            const message = document.getElementsByClassName("choose_image")[0];
            message.style.color = "grey";

            setIsError(false);
          }}
        />
        <button id={userCardStyles.change_image_button} type="submit">
          Change image
        </button>
      </form>
    </>
  );
}

export default WithLoader(WithError(UploadImage), "wait");
