import React, { useState } from "react";

const WithLoader = (ComponentToWrap) => {
  return function ComponentWithLoader(props) {
    const [isLoading, setIsLoading] = useState(true);

    return (
      <>
        {isLoading && (
          <img
            src="./img/loading/loading_kitty.svg"
            alt="loading"
            id="loading_kitty"
          />
        )}
        <ComponentToWrap {...props} setIsLoading={setIsLoading} />
      </>
    );
  };
};

export default WithLoader;

// WithLoader returns a functional component ComponentWithLoader.
// ComponentWithLoader returns ComponentToWrap and passes
// setIsLoading to it, so ComponentToWrap can control it.
