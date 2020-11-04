import React, { useEffect } from "react";
// Styles
import postStyles from "./styles/Post.module.scss";

function FullPageImage({ url, toggleShow }) {
  useEffect(() => {
    const overlay = document.getElementById("image_full_page_overlay");
    if (overlay) {
      overlay.ontouchstart = () => {
        toggleShow(false);
      };

      overlay.onclick = () => {
        toggleShow(false);
      };
    }
  }, []);

  return (
    <div
      className={postStyles.image_full_page_overlay}
      id="image_full_page_overlay"
    >
      <img src={url} />
    </div>
  );
}

export default FullPageImage;
