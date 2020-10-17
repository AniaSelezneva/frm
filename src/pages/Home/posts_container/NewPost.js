import React, { useState, useContext, useEffect } from "react";
// uuid
import uuid from "react-uuid";
// Firebase
import firebase from "firebase/app";
import "firebase/storage";
// Config for firebase
import config from "../../../utils/config";
// Store
import { store } from "../../../utils/store";
import WithLoader from "../../../HOCs/WithLoader";
// Styles
import homeStyles from "../styles/Home.module.scss";

function NewPost({ setIsLoading }) {
  const { state } = useContext(store);
  const [body, setBody] = useState("");
  const [image, setImage] = useState();
  const [imageDbName, setImageDbName] = useState(); // image name created with uuid
  const [imageName, setImageName] = useState(); // image name from file system
  const [error, setError] = useState(undefined);

  // Loading = false on component load.
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Upload image.
  const uploadImage = () => {
    return new Promise(async (resolve, reject) => {
      try {
        firebase.initializeApp(config);

        // Root reference.
        var storageRef = firebase.storage().ref();
        // Reference to new file.
        var imageRef = storageRef.child(imageDbName);

        await imageRef.put(image);
        resolve("success");
      } catch (error) {
        console.log(error);
        setError("Something went wrong, please try again later");
        reject(error);
      }
    });
  };

  // Set imageDbName when image is chosen in the browser.
  useEffect(() => {
    if (image !== undefined && image !== null) {
      const imageExtension = image.name.split(".").pop();
      const imageName = `${uuid()}.${imageExtension}`;
      setImageDbName(imageName);
    }

    // Abort
    return () => {
      const controller = new AbortController();
      controller.abort();
    };
  }, [image]);

  // Create post (bind image and post in db together).
  const submitPost = async (e) => {
    setIsLoading(true);

    // If image is chosen...
    if (image !== null && image !== undefined) {
      // ... upload it.
      await uploadImage();
    }

    try {
      const res = await fetch("/api/addPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userHandle: state.user.handle,
          userImageUrl: state.user.imageUrl,
          body: body.trim(),
          imageUrl:
            image !== null && image !== undefined
              ? `https://firebasestorage.googleapis.com/v0/b/${process.env.REACT_APP_BUCKET}/o/${imageDbName}?alt=media`
              : undefined,
        }),
      });

      if (res.status === 404) {
        setError("Something went wrong, try again later");
      } else {
        window.location.reload();
      }
      setIsLoading(false);
    } catch (error) {
      setError("Something went wrong, try again later");
      setIsLoading(false);
    }
  };

  return (
    <form
      id={homeStyles.new_post}
      encType="multipart/form-data"
      onSubmit={(e) => {
        e.preventDefault();
        if (body.trim() !== "") {
          submitPost(e);
        } else {
          setError("Must not be empty");
          // Red border around the textarea.
          document.getElementById("post_body").style.border = "2px solid red";
        }
      }}
    >
      <textarea
        name="body"
        rows="5"
        id="post_body"
        required
        minLength="3"
        placeholder="type something here..."
        onChange={(e) => {
          setBody(e.target.value);
          setError(undefined);
        }}
      />
      {/* Show error message if there is an error */}
      {error !== undefined && <p className="error_message">{error}</p>}

      <div className={homeStyles.new_post_buttons_container}>
        <div className={homeStyles.choose_image_container}>
          <label htmlFor="image" className="custom_file_upload">
            Image:
            <span>
              {imageName === undefined ? " choose an image" : ` ${imageName}`}
            </span>
          </label>

          {/* Button to remove previously chosen image. */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setImageName(undefined);
              setImageDbName(undefined);
              setImage(undefined);
              setError(undefined);
              document.getElementById("post_body").style.border =
                "1px solid black";
            }}
          >
            remove
          </button>
        </div>

        <input
          id="image"
          type="file"
          name="image"
          accept="image/png, image/jpeg"
          onChange={(e) => {
            if (e.target.files[0] !== undefined) {
              setImageName(e.target.files[0].name);
              setImage(e.target.files[0]);
              setError(undefined);
              document.getElementById("post_body").style.border =
                "1px solid black";
            }
          }}
        />
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}

export default WithLoader(NewPost, "wait..");
