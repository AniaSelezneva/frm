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

  return (
    <>
      <ul className="header">
        {window.location.pathname === "/signup" ||
        window.location.pathname === "/login" ||
        window.location.pathname === "/signup/" ||
        window.location.pathname === "/login/" ? null : (
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

          {state.loggedIn ? (
            <li>
              <Link
                to="/profile"
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
          ) : (
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

          {state.loggedIn && (
            <li id="with_dropdown">
              <Notifications />
            </li>
          )}
        </ul>
      </ul>
      {window.location.pathname === "/signup" ||
      window.location.pathname === "/signup/" ||
      window.location.pathname === "/login" ||
      window.location.pathname === "/login/" ? (
        <div id="header_bottom_border" />
      ) : null}
    </>
  );
}

export default Header;
