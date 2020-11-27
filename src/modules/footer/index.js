import React, { useEffect, useRef, useState } from "react";
// SVG
import FooterKitty from "./img/footer_kitty.js";

function Footer() {
  const [footer, setFooter] = useState();
  const [eyesClosed, setEyesClosed] = useState(false);
  const [shouldWait, setShouldWait] = useState(false);

  let timeoutId;

  // Activate movement 1 second after the svg is detected by InsersectonObserver.
  const observer = useRef(
    new IntersectionObserver((entries) => {
      const bottomElement = entries[0];
      // If footer is visible...
      if (bottomElement.isIntersecting) {
        // ... start moving the SVG.
        timeoutId = setTimeout(() => {
          setEyesClosed(true);
        }, 1000);
      } else {
        setEyesClosed(false);
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

    // Function factory, returns show_tongue or hide_tongue function depending on the argument (string 'show' or 'hide').
    const tongueAction = (action) => {
      const tongue = cat.getElementById("tongue");

      // Show tongue.
      if (action === "show") {
        tongue.style.animation = "showTongue 1s ease-out forwards";
      }
      // Hide tongue.
      else if (action === "hide") {
        tongue.style.animation = "hideTongue 1s ease-out forwards";
      }
    };

    // Function factory, returns close_eyes or open_eyes function depending on the argument (string 'open' or 'close').
    const eyesAction = (action) => {
      const eyes = cat.getElementsByTagName("ellipse");

      // Close eyes.
      if (action === "close") {
        for (let i = 0; i < eyes.length; i++) {
          eyes[i].style.animation = "closeEyes 1s ease-out forwards";
        }
      }
      // Open eyes.
      else if (action === "open") {
        for (let i = 0; i < eyes.length; i++) {
          eyes[i].style.animation = "openEyes 1s ease-out forwards";
        }
      }
    };

    // Close eyes, show tongue.
    if (eyesClosed) {
      tongueAction("show");
      eyesAction("close");
      setShouldWait(true);
      setTimeout(() => {
        setShouldWait(false);
      }, 1000);
    }
    // Open eyes, hide tongue.
    else {
      tongueAction("hide");
      eyesAction("open");
      setShouldWait(true);
      setTimeout(() => {
        setShouldWait(false);
      }, 1000);
    }

    const handler = () => {
      if (!shouldWait) {
        if (eyesClosed) {
          tongueAction("hide");
          eyesAction("open");
          setShouldWait(true);
          setTimeout(() => {
            setShouldWait(false);
            setEyesClosed(false);
          }, 1000);
        } else if (!eyesClosed) {
          tongueAction("show");
          eyesAction("close");
          setShouldWait(true);
          setTimeout(() => {
            setShouldWait(false);
            setEyesClosed(true);
          }, 1000);
        }
      }
    };

    cat.onmouseenter = () => {
      handler();
    };

    cat.onclick = () => {
      handler();
    };
  }, [eyesClosed]);

  return (
    <div className="footer" ref={setFooter}>
      <FooterKitty />
    </div>
  );
}

export default Footer;
