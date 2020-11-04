import React, { useContext } from "react";
import { Link } from "react-router-dom";
// store
import { store } from "../../utils/store";
// components
import Notifications from "./Notifications";
import Search from "./Search";

// HEADER COMPONENT
function Header() {
  const { state, dispatch } = useContext(store);

  // Check if the location pathname is 'login', 'signup' or 'invite'
  const isLoginOrSignup = () => {
    if (
      window.location.pathname === "/signup" ||
      window.location.pathname === "/signup/" ||
      window.location.pathname === "/login" ||
      window.location.pathname === "/login/" ||
      window.location.pathname === "/invite/" ||
      window.location.pathname === "/invite" ||
      window.location.pathname === "/restore" ||
      window.location.pathname === "/restore/" ||
      window.location.pathname === "/resetpassword" ||
      window.location.pathname === "/resetpassword/"
    )
      return true;
    else {
      return false;
    }
  };

  return (
    <>
      <ul className="header">
        {!isLoginOrSignup() && (
          <li>
            <Search />
          </li>
        )}

        <ul id="header_links_container">
          <li>
            <Link
              to="/"
              className={window.location.pathname === "/" ? "active" : null}
            >
              Home
            </Link>
          </li>
          {/* If user is logged in... */}
          {state.loggedIn ? (
            <>
              {" "}
              <li>
                {/* ... link to profile... */}
                <Link
                  to="/profile"
                  // Add style to 'active' header link (underline).
                  className={
                    window.location.pathname === "/profile" ||
                    window.location.pathname === "/profile/"
                      ? "active"
                      : null
                  }
                >
                  My posts
                </Link>
              </li>
              {/* ... and show notifications. */}
              <li id="with_dropdown">
                <Notifications />
              </li>
            </>
          ) : (
            // If user is not logged in...
            // ... links to signup and login.
            <>
              <li>
                <Link
                  to="/login"
                  className={
                    window.location.pathname === "/login" ||
                    window.location.pathname === "/login/"
                      ? "active"
                      : null
                  }
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className={
                    window.location.pathname === "/signup" ||
                    window.location.pathname === "/signup/"
                      ? "active"
                      : null
                  }
                >
                  Signup
                </Link>
              </li>
            </>
          )}
        </ul>
      </ul>
      {/* Border on the bottom of the header only on signup and login pages. */}
      {isLoginOrSignup() && <div id="header_bottom_border" />}
    </>
  );
}

export default Header;
