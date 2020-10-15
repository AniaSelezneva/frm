import React, { useState } from "react";

const WithLoader = (ComponentToWrap, loadingMessage) => {
  return function ComponentWithLoader(props) {
    const [isLoading, setIsLoading] = useState(true);
    return (
      <>
        {isLoading && <h1 id="loading_message">{loadingMessage}</h1>}
        <ComponentToWrap {...props} setIsLoading={setIsLoading} />
      </>
    );
  };
};

export default WithLoader;

// WithLoader returns a functional component ComponentWithLoader.
// ComponentWithLoader returns ComponentToWrap and passes
// setIsLoading to it, so ComponentToWrap can control it.
