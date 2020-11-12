import React, { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
// store
import { store } from "../../utils/store";
// faunaDB
import { q, adminClient } from "../../utils/faunaDB";
// svgs
import bellTransparent from "../../img/svgs/new/bell-transparent.svg";
import bellYellow from "../../img/svgs/new/bell-yellow.svg";
import arrow from "../../img/svgs/arrow.svg";
import remove from "../../img/svgs/remove.svg";

function Notifications() {
  const { state, dispatch } = useContext(store);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [totalNotifications, setTotalNotifications] = useState();

  // Number of notifications
  const size = 5;

  // Set totalNotifications in the store
  const countNotifications = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const total = await adminClient.query(
          q.Count(
            q.Match(q.Index("notifications_by_recepient"), state.user.handle)
          )
        );

        setTotalNotifications(total);
        resolve("Success");
      } catch (error) {
        console.log(error);
        setIsError(true);
        reject(error);
      }
    });
  };

  // Get all user's notifications to remove all of them
  const getAllNotifications = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const allNotifications = await adminClient.query(
          q.Paginate(
            q.Match(q.Index("notifications_by_recepient"), state.user.handle)
          )
        );

        resolve(allNotifications.data);
      } catch (error) {
        console.log(error);
        setIsError(true);
        reject(error);
      }
    });
  };

  // Get a needed page with notifications
  const getUserNotifications = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await adminClient.query(
          q.Map(
            q.Paginate(
              q.Reverse(
                q.Match(
                  q.Index("notifications_by_recepient"),
                  state.user.handle
                )
              ),
              { size }
            ),
            q.Lambda("X", q.Get(q.Var("X")))
          )
        );

        dispatch({ type: "SET_NOTIFICATIONS", payload: response });
        resolve("successfully loaded");
      } catch (error) {
        console.log(error);
        setIsError(true);
        reject(error);
      }
    });
  };

  // Remove one notification
  const removeNotification = async (ref, id) => {
    try {
      // Remove notification from db.
      await adminClient.query(q.Delete(ref));

      setTotalNotifications((prev) => prev - 1);

      // Remove notification from store.
      dispatch({
        type: "REMOVE_NOTIFICATION",
        payload: id,
      });
    } catch (error) {
      console.log(error);
      setIsError(true);
    }
  };

  // Remove all notifications
  const removeAllNotifications = async () => {
    try {
      // Get all user's notifications.
      const allNotifications = await getAllNotifications();
      //Remove all notifications from db.
      allNotifications.forEach(async (notificationRef) => {
        await adminClient.query(q.Delete(notificationRef));
      });

      // Remove all notifications from state.
      dispatch({
        type: "REMOVE_ALL_NOTIFICATIONS",
      });

      setTotalNotifications(0);

      // Close notifications.
      setNotificationsOpen(false);
    } catch (error) {
      console.log(error);
      setIsError(true);
    }
  };

  // Load new page with notifications
  const changePage = async (direction) => {
    let params;

    if (direction === "forward") {
      params = {
        size,
        after: state.user.notifications.after,
      };
    } else if (direction === "back") {
      params = {
        size,
        before: state.user.notifications.before,
      };
    }

    try {
      const response = await adminClient.query(
        q.Map(
          q.Paginate(
            q.Reverse(
              q.Match(q.Index("notifications_by_recepient"), state.user.handle)
            ),
            params
          ),
          q.Lambda("X", q.Get(q.Var("X")))
        )
      );

      dispatch({ type: "SET_NOTIFICATIONS", payload: response });
    } catch (error) {
      console.log(error);
      setIsError(true);
    }
  };

  // Count user's notifications, get user's notifications.
  useEffect(() => {
    const dealWithNotifications = async () => {
      await countNotifications();
      await getUserNotifications();
    };

    dealWithNotifications();
  }, [state.user.handle, window.location.pathname]);

  // Disable 'mark all notifications read' button.
  useEffect(() => {
    const markAllReadButton = document.getElementById("mark_all_read");
    if (totalNotifications <= 0 && markAllReadButton !== null) {
      markAllReadButton.setAttribute("disabled", "disabled");
    }
  }, [totalNotifications]);

  useEffect(() => {
    // Close notifications when body is clicked (exclude notifications container)
    document.body.addEventListener("click", (e) => {
      // Elements in the notifications container have data attribute to find them.
      if (!e.target.dataset.dontDetectClick) {
        setNotificationsOpen(false);
      }
    });
  }, [notificationsOpen]);

  return (
    <>
      {totalNotifications && !isError && (
        <>
          <input
            title="notifications"
            type="image"
            id="notifications_bell"
            src={totalNotifications === 0 ? bellTransparent : bellYellow}
            onClick={() => {
              if (totalNotifications > 0) {
                if (notificationsOpen === false) {
                  setNotificationsOpen(true);
                } else {
                  setNotificationsOpen(false);
                }
              }
            }}
          />
          {totalNotifications > 0 && (
            <p id="total_notifications">{totalNotifications}</p>
          )}

          {notificationsOpen &&
            totalNotifications &&
            state.user.notifications &&
            !isError && (
              <ul id="notifications_container" data-dont-detect-click="true">
                {state.user.notifications.data.map((notification) => (
                  <li key={notification.data.id} data-dont-detect-click="true">
                    <Link to={`/user/${notification.data.sender}`}>
                      {notification.data.sender}
                    </Link>
                    {notification.data.type === "like"
                      ? " liked "
                      : " commented on "}
                    <Link to={`/post/${notification.data.postId}`}>
                      your post
                    </Link>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <button
                      title="remove notification"
                      className="remove_notification_button"
                      data-dont-detect-click="true"
                      onClick={() => {
                        removeNotification(
                          notification.ref,
                          notification.data.id
                        );
                      }}
                    >
                      <img src={remove} data-dont-detect-click="true" />
                    </button>
                  </li>
                ))}

                <div
                  id="mark_read_buttons_container"
                  className={totalNotifications <= 0 ? "disabled" : null}
                  data-dont-detect-click="true"
                >
                  <button
                    id="mark_all_read"
                    tabIndex="0"
                    onClick={() => {
                      removeAllNotifications();
                    }}
                    data-dont-detect-click="true"
                  >
                    mark all read
                  </button>
                </div>

                <div id="navigation_container" data-dont-detect-click="true">
                  <input
                    type="image"
                    title="go to previous page"
                    tabIndex="0"
                    src={arrow}
                    data-dont-detect-click="true"
                    tabIndex={
                      !state.user.notifications.before ||
                      totalNotifications <= 0
                        ? "-1"
                        : "0"
                    }
                    id="prev_notifications"
                    onClick={() => {
                      changePage("back");
                    }}
                    className={
                      !state.user.notifications.before ||
                      totalNotifications <= 0
                        ? "inactive"
                        : null
                    }
                  />
                  &nbsp;
                  <input
                    type="image"
                    title="go to next page"
                    tabIndex="0"
                    data-dont-detect-click="true"
                    src={arrow}
                    tabIndex={
                      !state.user.notifications.after || totalNotifications <= 0
                        ? "-1"
                        : "0"
                    }
                    id="next_notifications"
                    onClick={() => {
                      changePage("forward");
                    }}
                    className={
                      state.user.notifications.after === undefined ||
                      totalNotifications <= 0
                        ? "inactive"
                        : null
                    }
                  />
                </div>
                <button
                  id="close_notifications"
                  onClick={() => {
                    setNotificationsOpen(false);
                  }}
                >
                  close
                </button>
              </ul>
            )}
        </>
      )}
    </>
  );
}

export default Notifications;
