import React, { useState } from "react";
import close from "../img/svgs/remove.svg";

const WithError = (ComponentToWrap) => {
  return function ComponentWithError(props) {
    const [isError, setIsError] = useState(false);
    const errorMessage = "Error occured, please try again later";

    const closeError = () => {
      setIsError(false);
    };

    return (
      <>
        {isError && (
          <div className="with_error">
            <p>{errorMessage}</p>

            <button onClick={closeError}>
              <img src={close} />
            </button>
          </div>
        )}
        <ComponentToWrap {...props} setIsError={setIsError} />
      </>
    );
  };
};

export default WithError;
