import React, { useEffect, useRef, useState } from "react";
// SVG
import KittyBall from "../../img/svgs/kb.svg";
// Styled components
import styled, { keyframes } from "styled-components";

const blink = keyframes`
  0% {
      ry: 3.5;
      rx: 3.4;
    }

  100% {
    ry: 0.4;
    rx: 5;
  }
`;

const showTongue = keyframes`
  to {
    transform: translateY(5%);
  }
`;

const StyledKitty = styled(KittyBall)`
  /* Eyes */
  ellipse {
    animation: ${blink} 1s ease-out forwards;
  }
  .kb_svg__tongue {
    animation: ${showTongue} 1s ease-out forwards;
  }
`;

function Footer() {
  const [footer, setFooter] = useState();
  const [move, setMove] = useState(false);

  let timeoutId;

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const bottomElement = entries[0];
      // If footer is visible...
      if (bottomElement.isIntersecting) {
        // ... start moving the SVG.
        timeoutId = setTimeout(() => {
          setMove(true);
        }, 1000);
      } else {
        setMove(false);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    })
  );

  useEffect(() => {
    const currentObserver = observer.current;
    if (footer) {
      currentObserver.observe(footer);
    }

    return () => {
      if (footer) {
        currentObserver.unobserve(footer);
      }
    };
  }, [footer]);

  return (
    <div className="footer" ref={setFooter}>
      {move ? <StyledKitty /> : <KittyBall />}
    </div>
  );
}

export default Footer;
