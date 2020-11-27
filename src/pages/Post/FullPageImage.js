import React, { useEffect, useRef } from "react";
// Styles
import postStyles from "./styles/Post.module.scss";

function FullPageImage({ url, toggleShow }) {
  const imageRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Toggle show/hide full page image.
  useEffect(() => {
    const overlay = document.getElementById("image_full_page_overlay");
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
    <div
      className={postStyles.image_full_page_overlay}
      id="image_full_page_overlay"
    >
      <img ref={imageRef} src={url} id={postStyles.full_page_image} />
      <input
        ref={closeButtonRef}
        type="image"
        id={postStyles.close_button}
        src="/img/close-button.svg"
      />
    </div>
  );
}

export default FullPageImage;
