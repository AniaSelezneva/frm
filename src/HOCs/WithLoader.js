import React, { useState } from "react";

function WithLoader(ComponentToWrap, loadingMessage) {
  return function ComponentWithLoader(props) {
    const [isLoading, setIsLoading] = useState(true);
    return (
      <>
        {isLoading && <h1>{loadingMessage}</h1>}
        <ComponentToWrap {...props} setIsLoading={setIsLoading} />
      </>
    );
  };
}

export default WithLoader;
