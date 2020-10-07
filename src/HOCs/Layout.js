import React from "react";
// Components
import Header from "../modules/header/";
import Footer from "../modules/footer/";

function Layout(props) {
  return (
    <>
      <div className="content">
        <Header />
        {props.children}
      </div>

      <Footer />
    </>
  );
}

export default Layout;
