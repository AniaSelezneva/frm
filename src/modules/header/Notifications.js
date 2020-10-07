import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
// store
import { store } from "../../utils/store";
// faunaDB
import { q, adminClient } from "../../utils/faunaDB";
// svgs
import bell from "../../img/svgs/bell.svg";
import activeBell from "../../img/svgs/bell-green.svg";
import arrow from "../../img/svgs/arrow.svg";
import remove from "../../img/svgs/remove.svg";
// withLoader hoc
import WithLoader from "../../HOCs/WithLoader";

function Notifications() {
  const { state, dispatch } = useContext(store);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [totalNotifications, setTotalNotifications] = useState();

  // Number of notifications
  const size = 10;

  // Set totalNotifications in the store.
  const countNotifications = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const total = await adminClient.query(
          q.Count(
            q.Match(q.Index("notifications_by_recepient"), state.user.handle)
          )
        );
        //dispatch({ type: "SET_TOTAL_NOTIFICATIONS", payload: total });

        setTotalNotifications(total);
        resolve("successfully counted");
      } catch (error) {
        console.log(error);
        setIsError(true);
        reject(error);
      }
    });
  };

  // Get all user's notifications to remove all of them.
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

  // Get a needed page with notifications.
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

  // Remove currently shown notifications.
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

  // Remove all notifications.
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

  const goToNextPage = async () => {
    try {
      // get user's notifications
      const response = await adminClient.query(
        q.Map(
          q.Paginate(
            q.Reverse(
              q.Match(q.Index("notifications_by_recepient"), state.user.handle)
            ),
            { size, after: state.user.notifications.after }
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

  const goToPrevPage = async () => {
    try {
      // get user's notifications
      const response = await adminClient.query(
        q.Map(
          q.Paginate(
            q.Reverse(
              q.Match(q.Index("notifications_by_recepient"), state.user.handle)
            ),
            { size, before: state.user.notifications.before }
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

  return (
    <>
      {totalNotifications !== undefined && !isError && (
        <>
          <div
            id="notifications_bell"
            tabIndex="0"
            onClick={() => {
              if (totalNotifications > 0) {
                if (notificationsOpen === false) {
                  setNotificationsOpen(true);
                } else {
                  setNotificationsOpen(false);
                }
              }
            }}
          >
            {totalNotifications === 0 ? (
              <img src={bell} />
            ) : (
              <>
                <img src={activeBell} />
                <p>{totalNotifications}</p>
              </>
            )}
          </div>

          {notificationsOpen &&
            totalNotifications !== undefined &&
            state.user.notifications !== undefined &&
            state.user.notifications !== null &&
            !isError && (
              <ul id="notifications_container">
                {state.user.notifications.data.map((notification) => (
                  <li key={notification.data.id}>
                    {notification.data.sender} {`${notification.data.type}ed `}
                    {notification.data.type === "comment" && "on "}
                    <Link to={`/post/${notification.data.postId}`}>
                      your post
                    </Link>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <button
                      tabIndex="0"
                      className="remove_notification_button"
                      onClick={() => {
                        removeNotification(
                          notification.ref,
                          notification.data.id
                        );
                      }}
                    >
                      <img src={remove} />
                    </button>
                  </li>
                ))}

                <div
                  id="mark_read_buttons_container"
                  className={totalNotifications <= 0 ? "disabled" : null}
                >
                  <button
                    id="mark_all_read"
                    tabIndex="0"
                    onClick={() => {
                      removeAllNotifications();
                    }}
                  >
                    mark all read
                  </button>
                </div>

                <div id="navigation_container">
                  <button
                    tabIndex="0"
                    id="prev_notifications"
                    onClick={() => {
                      goToPrevPage();
                    }}
                    className={
                      state.user.notifications.before === undefined ||
                      totalNotifications <= 0
                        ? "inactive"
                        : null
                    }
                  >
                    <img src={arrow} />
                  </button>
                  &nbsp;
                  <button
                    tabIndex="0"
                    id="next_notifications"
                    onClick={() => {
                      goToNextPage();
                    }}
                    className={
                      state.user.notifications.after === undefined ||
                      totalNotifications <= 0
                        ? "inactive"
                        : null
                    }
                  >
                    <img src={arrow} />
                  </button>
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
