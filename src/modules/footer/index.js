import React, { useEffect, useRef, useState } from "react";
// SVG
import FooterKitty from "./img/footer_kitty.js";

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

  // Animate the cat svg only when it's visible.
  useEffect(() => {
    const cat = document.getElementById("footer_kitty");

    const moveOrStop = (shouldMove) => {
      const tongue = cat.getElementById("tongue");
      const eyes = cat.getElementsByTagName("ellipse");

      if (shouldMove) {
        tongue.style.animation = "showTongue 1s ease-out forwards";
        for (let i = 0; i < eyes.length; i++) {
          eyes[i].style.animation = "closeEyes 1s ease-out forwards";
        }
      } else {
        tongue.style.animation = "none";
        for (let i = 0; i < eyes.length; i++) {
          eyes[i].style.animation = "none";
        }
      }
    };

    if (cat) {
      moveOrStop(move);
    }

    // Hide tongue on hover.
    cat.onmouseover = () => {
      const tongue = cat.getElementById("tongue");
      tongue.style.animation = "hideTongue 1s ease-out forwards";
    };
  }, [move]);

  return (
    <div className="footer" ref={setFooter}>
      <FooterKitty />
    </div>
  );
}

export default Footer;
