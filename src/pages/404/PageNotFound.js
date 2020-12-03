import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
// SVG
import PageNotFoundImg from "./img/PageNotFoundImg";

function PageNotFound() {
  // Ref to svg image.
  const svgRef = useRef(null);

  // Animate svg rotating.
  useEffect(() => {
    let start = 0,
      speed = 1;

    function step() {
      if (svgRef.current) {
        svgRef.current.style.rotate = `${start + 1 * speed}deg`;
        start += 1 * speed;

        if (start === 359) start = 0;

        svgRef.current.onmouseenter = () => {
          speed = 3;
        };

        svgRef.current.onmouseleave = () => {
          speed = 1;
        };

        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }, []);

  return (
    <div className="page_not_found">
      <span id="404_image">
        <p>4</p>
        <PageNotFoundImg svgRef={svgRef} />
        <p>4</p>
      </span>

      <p>This page doesn't exist</p>
      <Link to="/">Go to main page</Link>
    </div>
  );
}

export default PageNotFound;
