import React, { useContext } from "react";
// Store
import { store } from "../../utils/store";
// SVG
import kitty_ball from "../../img/svgs/kitty_ball.svg";
// Styled components
import styled from "styled-components";

const StyledKitty = styled(kitty_ball)`
  position: fixed;
  top: 50%;
  right: -7.4rem;
  z-index: 100;
  cursor: pointer;
  animation: slideleft 2s forwards;

  @keyframes slideleft {
    from {
      transform: translateX(100%) translateY(-50%) rotate(-90deg);
    }

    to {
      transform: translateX(0) translateY(-50%) rotate(-90deg);
    }
  }
`;

function LoginPromptImage() {
  const { state } = useContext(store);

  return (
    <>
      {/* Login prompt (image sliding left to ask the user to login) */}
      {state.showLoginPrompt && (
        <StyledKitty
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
