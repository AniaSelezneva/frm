import React, { useEffect, useState } from "react";

const WithLoader = (ComponentToWrap, loadingMessage) => {
  return function ComponentWithLoader(props) {
    const [isLoading, setIsLoading] = useState(true);

    const letters = loadingMessage.split("");

    const markup = [];

    letters.forEach((letter, index) => {
      markup.push(<span key={index}>{letter}</span>);
    });

    useEffect(() => {
      const container = document.getElementById("loading_message");
      let count = 0;
      let isFirst = true;
      let color = `${
        "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
      }`;

      container.style.border = `15px solid ${color}`;

      const lettersCollection = container.childNodes;

      setInterval(() => {
        // Change color of the border after the first color changing.
        if (!isFirst && count === 0) {
          container.style.border = `15px solid ${color}`;
        }

        lettersCollection[count].style.color = color;
        count++;

        if (count === lettersCollection.length) {
          color = `${
            "#" +
            (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)
          }`;
          count = 0;
          isFirst = false;
        }
      }, 1000);
    }, []);

    return (
      <>
        {isLoading && <div id="loading_message">{markup}</div>}
        <ComponentToWrap {...props} setIsLoading={setIsLoading} />
      </>
    );
  };
};

export default WithLoader;

// WithLoader returns a functional component ComponentWithLoader.
// ComponentWithLoader returns ComponentToWrap and passes
// setIsLoading to it, so ComponentToWrap can control it.
