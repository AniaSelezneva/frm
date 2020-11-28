import React, { useContext } from "react";
// Store
import { store } from "../../utils/store";
// Style
import "./svgStyle.scss";

function LoginPromptImage() {
  const { state } = useContext(store);

  return (
    <>
      {/* Login prompt (image sliding left to ask the user to login) */}
      {state.showLoginPrompt && (
        <input
          type="image"
          src="/img/login_prompt/sliding_kitty.svg"
          alt="cat prompting to login"
          id="sliding_kitty"
          className="image_ask_to_login"
          onClick={() => {
            window.location.href = "/login";
          }}
        />
      )}
    </>
  );
}

export default LoginPromptImage;
