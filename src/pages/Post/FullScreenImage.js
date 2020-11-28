import React, { useEffect, useRef } from "react";
// Styles
import postStyles from "./styles/Post.module.scss";

function FullScreenImage({ url, toggleShow }) {
  const imageRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Toggle show/hide full page image.
  useEffect(() => {
    const overlay = document.getElementById("image_full_screen_overlay");
    if (overlay) {
      overlay.onclick = () => {
        toggleShow(false);
      };

      // Don't close full page image when image itself is clicked.
      imageRef.current.onclick = (e) => {
        e.stopPropagation();
      };

      closeButtonRef.current.onclick = () => {
        toggleShow(false);
      };

      // Exit full screen mode when 'Escape' is clicked.
      document.onkeydown = (e) => {
        if (e.key === `Escape`) {
          toggleShow(false);
        }
      };
    }
  }, []);

  // Remove scroll from body.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    // Show scroll when full page image is closed.
    return () => {
      document.body.style.overflow = "scroll";
    };
  }, []);

  return (
    // Container
    <div
      id="image_full_screen_overlay"
      className={postStyles.image_full_screen_overlay}
    >
      {/* Image itself */}
      <img src={url} id={postStyles.full_screen_image} ref={imageRef} />
      {/* Exit full screen */}
      <input
        type="image"
        src="/img/close-button.svg"
        alt="exit full screen"
        id={postStyles.close_button}
        ref={closeButtonRef}
      />
    </div>
  );
}

export default FullScreenImage;
