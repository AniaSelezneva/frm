import React, { useContext, useEffect } from "react";
// Store
import { context } from "./utils/store";
import { store } from "../../../utils/store";
// FaunaDB
import { q, adminClient } from "../../../utils/faunaDB";

function Pagination() {
  const { state: globalState } = useContext(store);
  const { state, dispatch } = useContext(context);

  // ********************** FUNCTIONS *******************
  // Load new page with notifications
  const changePage = async (direction) => {
    dispatch({ type: "SET_IS_LOADING", payload: true });
    let params;

    if (direction === "forward") {
      params = {
        size: state.size,
        after: state.notifications.after,
      };
    } else if (direction === "back") {
      params = {
        size: state.size,
        before: state.notifications.before,
      };
    }

    try {
      const response = await adminClient.query(
        q.Map(
          q.Paginate(
            q.Reverse(
              q.Match(
                q.Index("notifications_by_recepient"),
                globalState.user.handle
              )
            ),
            params
          ),
          q.Lambda("X", q.Get(q.Var("X")))
        )
      );

      dispatch({ type: "SET_NOTIFICATIONS", payload: response.data });
      dispatch({ type: "SET_BEFORE", payload: response.before });
      dispatch({ type: "SET_AFTER", payload: response.after });

      dispatch({ type: "SET_IS_LOADING", payload: false });
    } catch (error) {
      console.log(error);
      dispatch({ type: "SET_IS_LOADING", payload: false });
    }
  };

  // Load new page with notifications when all notifications are
  // removed from the current page.
  const autoChangePage = async (direction) => {
    dispatch({ type: "SET_IS_LOADING", payload: true });
    let params;

    if (direction === "forward") {
      params = {
        size: state.size,
        after: state.notifications.after,
      };
    } else if (direction === "back") {
      params = {
        size: state.size,
        before: state.notifications.before,
      };
    }

    try {
      const response = await adminClient.query(
        q.Map(
          q.Paginate(
            q.Reverse(
              q.Match(
                q.Index("notifications_by_recepient"),
                globalState.user.handle
              )
            ),
            params
          ),
          q.Lambda("X", q.Get(q.Var("X")))
        )
      );

      dispatch({ type: "SET_NOTIFICATIONS", payload: response.data });

      if (!state.isFirst) {
        dispatch({ type: "SET_BEFORE", payload: response.before });
      }

      if (!state.isLast) {
        dispatch({ type: "SET_AFTER", payload: response.after });
      }

      dispatch({ type: "SET_IS_LOADING", payload: false });
    } catch (error) {
      console.log(error);
      dispatch({ type: "SET_IS_LOADING", payload: false });
    }
  };

  // ******************************* EFFECTS **************
  // Go to next or prev page when all the notifications on the current page are removed.
  useEffect(() => {
    if (state.totalCurrentPage !== undefined) {
      if (state.totalCurrentPage <= 0) {
        // First try to go forward.
        if (state.notifications.after) {
          autoChangePage("forward");
        } else if (state.notifications.before) {
          autoChangePage("back");
        }
      }
    }
  }, [state.totalCurrentPage]);

  // Check if page is first or last.
  useEffect(() => {
    if (state.notifications.before) {
      dispatch({ type: "SET_IS_FIRST_PAGE", payload: false });
    } else if (!state.notifications.before) {
      dispatch({ type: "SET_IS_FIRST_PAGE", payload: true });
    }

    if (state.notifications.after) {
      dispatch({ type: "SET_IS_LAST_PAGE", payload: false });
    } else if (!state.notifications.after) {
      dispatch({ type: "SET_IS_LAST_PAGE", payload: true });
    }
  }, [state.notifications]);

  // Disable next and prev buttons.
  useEffect(() => {
    const nextButton = document.getElementById("next_notifications");
    const prevButton = document.getElementById("prev_notifications");

    if (state.isLast) {
      nextButton.setAttribute("disabled", "true");
    } else if (!state.isLast) {
      nextButton.removeAttribute("disabled");
    }

    if (state.isFirst) {
      prevButton.setAttribute("disabled", "true");
    } else if (!state.isFirst) {
      prevButton.removeAttribute("disabled");
    }
  }, [state.isLast, state.isFirst]);

  // Close notifications when there are none left.
  useEffect(() => {
    if (state.total <= 0) {
      dispatch({ type: "SET_IS_OPEN", payload: false });
    }
  }, [state.total]);

  // ***************** RETURN *****************************
  return (
    <div id="navigation_container" data-dont-detect-click="true">
      <input
        type="image"
        src="/img/header/arrow.svg"
        tabIndex={!state.notifications.before ? "-1" : "0"}
        className={`notifications_arrow ${
          !state.notifications.before ? "inactive" : null
        }`}
        data-dont-detect-click="true"
        id="prev_notifications"
        onClick={() => {
          changePage("back");
        }}
      />
      &nbsp;
      <input
        type="image"
        src="/img/header/arrow.svg"
        className={`notifications_arrow ${
          !state.notifications.after ? "inactive" : null
        }`}
        data-dont-detect-click="true"
        tabIndex={!state.notifications.after ? "-1" : "0"}
        id="next_notifications"
        onClick={() => {
          changePage("forward");
        }}
      />
    </div>
  );
}

export default Pagination;
