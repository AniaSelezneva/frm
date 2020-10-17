import React from "react";
// Components
import Header from "../modules/header/";
import Footer from "../modules/footer/";
// Svg
import upArrow from "../img/svgs/up-arrow.svg";

function Layout(props) {
  const throttle = (callback, time) => {
    let timer;
    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }

      timer = window.setTimeout(function () {
        // Actual callback
        callback();
      }, time);
    };
  };

  const callback = () => {
    const distance = window.scrollY;
    const arrow = document.getElementById("up_arrow");
    //console.log(distance);
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
      ></img>
      <Footer />
    </>
  );
}

export default Layout;
