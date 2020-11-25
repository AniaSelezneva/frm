import React, { useEffect, useState } from "react";
// SVG
import Cat from "../img/svgs/kitty_ball_2.svg";
// Styled components
import styled, { keyframes } from "styled-components";

const rotate = keyframes`
from {
  transform: translate(-50%, -50%) rotate(0);
}
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
`;

const StyledCat = styled(Cat)`
  position: absolute;
  left: 40%;
  top: 50%;
  z-index: 500;
  scale: 0.6;
  animation: ${rotate} 2s infinite;
  background: transparent;
`;

const WithLoader = (ComponentToWrap) => {
  return function ComponentWithLoader(props) {
    const [isLoading, setIsLoading] = useState(true);

    return (
      <>
        {isLoading && <StyledCat />}
        <ComponentToWrap {...props} setIsLoading={setIsLoading} />
      </>
    );
  };
};

export default WithLoader;

// WithLoader returns a functional component ComponentWithLoader.
// ComponentWithLoader returns ComponentToWrap and passes
// setIsLoading to it, so ComponentToWrap can control it.
