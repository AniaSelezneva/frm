import React, { useContext } from "react";
import { Link } from "react-router-dom";
// Store
import { store } from "../../utils/store";
// Components
import Notifications from "./Notifications";
import Search from "./Search";

function Header() {
  const { state } = useContext(store);

  // Check if search should be shown
  const shouldShowSearch = () => {
    const path = window.location.pathname.split("/")[1];
    if (
      path !== "signup" &&
      path !== "login" &&
      path !== "restore" &&
      path !== "resetpassword"
    )
      return true;
    else {
      return false;
    }
  };

  return (
    <>
      <ul className="header">
        {shouldShowSearch() && (
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
              <li>
                {/* 1. Link to profile (own posts)... */}
                <Link
                  to="/profile"
                  // 2. Add style to 'active' header link (add underline)...
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
              {/* 3. Show notifications. */}
              <li id="with_dropdown">
                <Notifications />
              </li>
            </>
          ) : (
            // If user is not logged in...
            <>
              {/* ... Add links to signup and login. */}
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
      {!shouldShowSearch() && <div id="header_bottom_border" />}
    </>
  );
}

export default Header;
