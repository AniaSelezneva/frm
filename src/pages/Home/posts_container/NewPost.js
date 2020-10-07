import React, { useState, useContext, useEffect } from "react";
// uuid
import uuid from "react-uuid";
// firebase
import firebase from "firebase";
// config for firebase
import config from "../../../utils/config";
// store
import { store } from "../../../utils/store";
import WithLoader from "../../../HOCs/WithLoader";
// Styles
import homeStyles from "../styles/Home.module.scss";

function NewPost({ setIsLoading }) {
  const { state, dispatch } = useContext(store);
  const [body, setBody] = useState("");
  const [image, setImage] = useState();
  const [imageName, setImageName] = useState();
  const [error, setError] = useState(undefined);
  const [imageFileName, setImageFileName] = useState();

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
        var imageRef = storageRef.child(imageName);

        await imageRef.put(image);
        resolve("success");
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  // Set imageName when image is chosen in the browser.
  useEffect(() => {
    if (image !== undefined && image !== null) {
      const imageExtension = image.name.split(".").pop();

      const imageFileName = `${uuid()}.${imageExtension}`;

      setImageName(imageFileName);
    }
  }, [image]);

  // Make post (bind image and post in db together).
  const submitPost = async (e) => {
    setIsLoading(true);

    if (image !== null && image !== undefined) {
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
              ? `https://firebasestorage.googleapis.com/v0/b/${process.env.REACT_APP_BUCKET}/o/${imageName}?alt=media`
              : undefined,
        }),
      });

      if (res.status === 404) {
        setError("Something went wrong, try again later");
      }

      setIsLoading(false);
      window.location.reload();
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
          // Red border
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

      {error !== undefined && <p className="error_message">{error}</p>}
      <div className={homeStyles.new_post_buttons_container}>
        <div className={homeStyles.choose_image_container}>
          <label htmlFor="image" className="custom_file_upload">
            Image:
            <span>
              {imageFileName === undefined
                ? " choose an image"
                : ` ${imageFileName}`}
            </span>
          </label>

          <button
            onClick={(e) => {
              e.preventDefault();
              // Remove previously chosen image.
              setImageFileName(undefined);
              setImageName(undefined);
              setImage(undefined);
              document.getElementById("post_body").style.border =
                "1px solid black";
              setError(undefined);
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
              setImageFileName(e.target.files[0].name);
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
