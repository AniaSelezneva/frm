import React, { useContext } from "react";
// Store
import { store } from "../../utils/store";
// SVG
import kitty_ball from "../../img/svgs/kitty_ball.svg";
// Styles
import loginPromptStyles from "./styles/loginPromptStyles.module.scss";

function LoginPrompt() {
  const { state } = useContext(store);
  return (
    <>
      {state.showLoginPrompt && (
        <img
          onClick={() => {
            window.location.href = "/login";
          }}
          src={kitty_ball}
          id={loginPromptStyles.image_ask_to_login}
          className="image_ask_to_login"
        />
      )}
    </>
  );
}

export default LoginPrompt;
