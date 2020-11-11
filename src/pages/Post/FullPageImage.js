import React, { useEffect, useRef } from "react";
// Styles
import postStyles from "./styles/Post.module.scss";
// SVG
import closeButton from "./../../img/svgs/new/close-button.svg";

function FullPageImage({ url, toggleShow }) {
  const imageRef = useRef(null);
  const closeButtonRef = useRef(null);

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
        src={closeButton}
      />
    </div>
  );
}

export default FullPageImage;
