import React, { useEffect, useRef, useState } from "react";
// SVG
import FooterKitty from "./img/footer_kitty.js";
// Style
import "./styles/style.scss";

function Footer() {
  const footer = useRef();
  const [eyesClosed, setEyesClosed] = useState(false);
  const [shouldWait, setShouldWait] = useState(false);
  let subscribed = true;
  let timeoutId;

  // Set the observer to activate movement
  // 1 second after the svg is detected by InsersectonObserver.
  const observer = useRef(
    new IntersectionObserver((entries) => {
      const bottomElement = entries[0];
      // If footer is visible...
      if (bottomElement.isIntersecting) {
        subscribed = true;
        // ... start moving the SVG.
        timeoutId = setTimeout(() => {
          if (subscribed) {
            setEyesClosed(true);
          }
        }, 1000);
      } else {
        setEyesClosed(false);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    })
  );

  // Start observing.
  useEffect(() => {
    const currentObserver = observer.current;
    if (footer.current) {
      currentObserver.observe(footer.current);
    }

    return () => {
      if (footer.current) {
        currentObserver.unobserve(footer.current);
      }
    };
  }, [footer]);

  // Animate the cat svg only when it's visible and when it's clicked or hovered.
  useEffect(() => {
    const cat = document.getElementById("footer_kitty");
    const tongue = cat.getElementById("tongue");
    const eyes = cat.getElementsByTagName("ellipse");

    // Show tongue or hide tongue depending on the argument (string 'show' or 'hide').
    const tongueAction = (action) => {
      // Show tongue.
      if (action === "show") {
        tongue.style.animation = "showTongue 1s ease-out forwards";
      }
      // Hide tongue.
      else if (action === "hide") {
        tongue.style.animation = "hideTongue 1s ease-out forwards";
      }
    };

    // Close eyes or open eyes  depending on the argument (string 'open' or 'close').
    const eyesAction = (action) => {
      // Close eyes.
      if (action === "close") {
        for (let i = 0; i < eyes.length; i++) {
          eyes[i].style.animation = "closeEyes 0.5s ease-out forwards";
        }
      }
      // Open eyes.
      else if (action === "open") {
        for (let i = 0; i < eyes.length; i++) {
          eyes[i].style.animation = "openEyes 0.5s ease-out forwards";
        }
      }
    };

    // Close eyes, show tongue.
    if (eyesClosed) {
      tongueAction("show");
      eyesAction("close");
      setShouldWait(true);

      setTimeout(() => {
        if (subscribed) setShouldWait(false);
      }, 1000);
    }
    // Open eyes, hide tongue.
    else {
      tongue.style.animation = "none";
      for (let i = 0; i < eyes.length; i++) {
        eyes[i].style.animation = "none";
        eyes[i].style.animation = "none";
      }
      if (subscribed) setShouldWait(false);
    }

    const handler = () => {
      if (!shouldWait) {
        if (eyesClosed) {
          tongueAction("hide");
          eyesAction("open");
          setShouldWait(true);
          setTimeout(() => {
            if (subscribed) {
              setShouldWait(false);
              setEyesClosed(false);
            }
          }, 1000);
        } else if (!eyesClosed) {
          tongueAction("show");
          eyesAction("close");
          setShouldWait(true);
          setTimeout(() => {
            if (subscribed) {
              setShouldWait(false);
              setEyesClosed(true);
            }
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

    return () => {
      subscribed = false;
    };
  }, [eyesClosed]);

  // Unsubscribe.
  useEffect(() => {
    return () => {
      subscribed = false;
    };
  }, []);

  return (
    <div className="footer" ref={footer}>
      <FooterKitty />
    </div>
  );
}

export default Footer;
