import React, { useContext, useEffect } from "react";
// Store
import { store } from "../../utils/store";
// SVG
import blueHeart from "../../img/svgs/new/blue-heart.svg";
import transparentHeart from "../../img/svgs/new/transparent-heart.svg";
// Styled components
import styled from "styled-components";

const StyledBlueHeart = styled(blueHeart)`
  border: none;
  min-width: 25px;
  max-width: 25px;
  scale: 1 !important;
  cursor: pointer;
`;

const StyledTransparentHeart = styled(transparentHeart)`
  border: none;
  min-width: 25px;
  max-width: 25px;
  scale: 1 !important;
  cursor: pointer;
`;

function LoginPromptTrigger({ likeCount }) {
  const { state, dispatch } = useContext(store);

  // Hide login prompt image (cat sliding to the right)
  const hide = () => {
    const image = document.getElementsByClassName("image_ask_to_login")[0];

    if (image) {
      image.style.animation = "slideright 2s forwards";

      setTimeout(() => {
        dispatch({
          type: "SET_SHOW_LOGIN_PROMPT",
          payload: false,
        });

        dispatch({
          type: "SET_WAIT_TO_SHOW_LOGIN_PROMPT",
          payload: false,
        });
      }, 1000);
    }
  };

  // Set timer to hide the image on the right (login prompt) and clean it on the unmount.
  useEffect(() => {
    let timer;
    if (state.showLoginPrompt) {
      timer = setTimeout(() => {
        hide();
      }, 4000);

      return () => {
        clearTimeout(timer);

        dispatch({
          type: "SET_WAIT_TO_SHOW_LOGIN_PROMPT",
          payload: false,
        });
      };
    }
  }, [state.showLoginPrompt]);

  const control_showing_login_prompt = () => {
    // 1. if login prompt is not shown and not waiting...
    if (!state.showLoginPrompt && !state.waitToShowLoginPrompt) {
      dispatch({
        type: "SET_SHOW_LOGIN_PROMPT",
        payload: true,
      });

      dispatch({
        type: "SET_WAIT_TO_SHOW_LOGIN_PROMPT",
        payload: true,
      });
    }

    // 2. if login prompt is shown and waiting
    else if (state.showLoginPrompt && state.waitToShowLoginPrompt) {
      hide();
    }
  };

  // Unmount
  useEffect(() => {
    return () => {
      dispatch({
        type: "SET_SHOW_LOGIN_PROMPT",
        payload: false,
      });
    };
  }, []);

  return (
    <>
      {/* Heart image (transparent or blue depending on amount of likes) */}
      {likeCount <= 0 ? (
        <StyledTransparentHeart
          onClick={async () => {
            // If not logged in and...
            if (!state.loggedIn) {
              control_showing_login_prompt();
            }
          }}
        />
      ) : (
        <StyledBlueHeart
          onClick={async () => {
            // If not logged in and...
            if (!state.loggedIn) {
              control_showing_login_prompt();
            }
          }}
        />
      )}
      {/* Number of likes if there are any */}
      {likeCount > 0 && <p>{likeCount}</p>}
    </>
  );
}

export default LoginPromptTrigger;
