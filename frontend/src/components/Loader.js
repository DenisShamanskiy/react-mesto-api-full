/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React from "react";
const Loader = React.memo(({ isLoading }) => {
  return (
    isLoading && (
      <div className="loader">
        <div className="loader__item"></div>
      </div>
    )
  );
});

export default Loader;
