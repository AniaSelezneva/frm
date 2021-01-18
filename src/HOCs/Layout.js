import React, { useRef, useContext } from "react";
// Components
import Header from "../modules/header/";
import Footer from "../modules/footer/";
import LoginPromptImage from "../modules/login_prompt/LoginPromptImage";

// Store
import { store } from "../utils/store";

function Layout(props) {
  const wait = useRef(false);
  const { state } = useContext(store);

  const throttle = (callback, timeout) => {
    return () => {
      // 3. Don't do anything if waiting.
      if (wait.current) {
        return;
      }

      // 1. Execute callback
      callback();

      // 2. Wait
      wait.current = true;

      // 4. Stop waiting
      setTimeout(() => {
        wait.current = false;
      }, timeout);
    };
  };

  const callback = () => {
    const distance = window.scrollY;
    const arrow = document.getElementById("up_arrow");

    if (distance > 600) {
      arrow.style.display = "block";
    } else if (distance < 600) {
      arrow.style.display = "none";
    }
  };

  // Hide/show 'goUp' arrow.
  window.addEventListener("scroll", throttle(callback, 1000));

  return (
    <>
      <div className="content">
        <Header />
        {props.children}
      </div>
      <input
        alt="arrow pointing up"
        type="image"
        src="/img/up-arrow.svg"
        tabIndex="0"
        className="up_arrow"
        id="up_arrow"
        style={{ display: "none" }}
        onClick={() => window.scrollTo(0, 0)}
      />

      {/* Login prompt image (appears when trying to like without being logged in) */}
      {!state.loggedIn && <LoginPromptImage />}
      <Footer />
    </>
  );
}

export default Layout;
