import React, { useState, useContext, useEffect, useRef } from "react";
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

  // DOM elements
  const form = useRef(null);

  // Loading = false on component load.
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Upload image
  const uploadImage = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch("/api/getSignedURL", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: imageDbName,
          }),
        });

        const signedURL = await res.json();

        await fetch(signedURL, {
          method: "PUT",
          headers: {
            "Content-Type": "image/jpeg",
          },
          body: image,
        });

        resolve("success");
      } catch (error) {
        console.log(error);
        setError("Something went wrong, please try again later");
        reject(error);
      }
    });
  };

  // Set imageDbName when image is chosen in the browser
  useEffect(() => {
    if (image) {
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

  // Create post (bind image and post together in db)
  const submitPost = async () => {
    setIsLoading(true);

    // If image is chosen...
    if (image) {
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

      if (res.status >= 400) {
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

  // Submit post event handler
  const handleSubmit = (e) => {
    e.preventDefault();
    // If there is no image chosen...
    if (!image) {
      // post body must not be empty.
      if (body.trim().length > 0) {
        submitPost(e);
      } else {
        setError("Must not be empty");
      }
    }
    // If there is an image...
    else {
      // post body can be empty.
      submitPost(e);
    }
  };

  // Handle error message animation
  useEffect(() => {
    const errorMsg = document.getElementsByClassName("error_message")[0];
    if (error && errorMsg) {
      setTimeout(() => {
        errorMsg.style.animationDuration = "0.6s";
        errorMsg.style.animationName = `${homeStyles.slideuperror}`;
        document.getElementById("post_body").style.border = "2px solid black";

        setTimeout(() => {
          setError(undefined);
        }, 500);
      }, 2000);

      // Red border around the textarea
      document.getElementById("post_body").style.border = "2px solid red";
    }
  }, [error]);

  // Text is not required if there is an image.
  useEffect(() => {
    const postBody = document.getElementById("post_body");
    if (image) {
      postBody.removeAttribute("required");
    } else {
      postBody.setAttribute("required", "true");
    }
  }, [image]);

  // **************** RETURN *********************

  return (
    <form
      id={homeStyles.new_post}
      encType="multipart/form-data"
      ref={form}
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSubmit(e);
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
      {error && <p className="error_message">{error}</p>}

      <div className={homeStyles.new_post_buttons_container}>
        <div className={homeStyles.choose_image_container}>
          <label
            htmlFor="image"
            className="custom_file_upload"
            tabIndex="0"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const hiddenInput = document.getElementById("image");
                hiddenInput.click();
              }
            }}
          >
            Image:
            <span>{!imageName ? " choose an image" : ` ${imageName}`}</span>
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
