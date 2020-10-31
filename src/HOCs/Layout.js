import React from "react";
// Components
import Header from "../modules/header/";
import Footer from "../modules/footer/";
// Svg
import upArrow from "../img/svgs/up-arrow.svg";

function Layout(props) {
  const throttle = (callback, timeout) => {
    let wait = true;
    return () => {
      if (!wait) {
        callback();
      }
      setTimeout(() => {
        wait = false;
      }, timeout);
    };
  };

  const callback = () => {
    const distance = window.scrollY;
    const arrow = document.getElementById("up_arrow");

    if (distance > 400) {
      arrow.removeAttribute("style");
    } else if (distance < 400) {
      arrow.setAttribute("style", `display: none`);
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

      <img
        className="up_arrow"
        id="up_arrow"
        src={upArrow}
        onClick={() => window.scrollTo(0, 0)}
        style={{ display: "none" }}
        tabIndex="0"
      ></img>
      <Footer />
    </>
  );
}

export default Layout;
