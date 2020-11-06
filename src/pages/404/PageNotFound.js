import React from "react";
import { Link } from "react-router-dom";
// HOC
import Layout from "../../HOCs/Layout";

function PageNotFound() {
  return (
    <div className="page_not_found">
      <p>This page doesn't exist</p>
      <Link to="/">Go to main page</Link>
    </div>
  );
}

export default PageNotFound;
