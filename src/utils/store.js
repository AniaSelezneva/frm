import React, { createContext, useReducer } from "react";

const initialState = {
  loggedIn: false,
  user: {
    email: null,
    handle: null,
    imageUrl: null,
    userDbRef: null,
    notifications: [],
    totalNotifications: null,
  },
  posts: [],
  post: null,
  query: "",
};
// store has Provider and Consumer components
const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case "LOG_IN":
        return { ...state, loggedIn: true };
      case "SET_USER": {
        return { ...state, user: action.payload };
      }
      case "CHANGE_IMAGE": {
        return { ...state, user: action.payload };
      }
      case "SET_REF": {
        return { ...state, user: { ...state.user, userDbRef: action.payload } };
      }
      case "SET_POSTS": {
        return { ...state, posts: action.payload };
      }
      case "SET_CURRENT_POST": {
        return { ...state, post: action.payload };
      }
      case "SET_NOTIFICATIONS": {
        return {
          ...state,
          user: { ...state.user, notifications: action.payload },
        };
      }
      case "SET_QUERY": {
        return {
          ...state,
          query: action.payload,
        };
      }
      case "REMOVE_NOTIFICATION": {
        const notifications = state.user.notifications.data;

        const index = notifications.findIndex(
          (notification) => notification.data.id === action.payload
        );

        if (index >= 0) {
          notifications.splice(index, 1);
        }

        return {
          ...state,
          user: {
            ...state.user,
            notifications: { ...state.user.notifications, data: notifications },
          },
        };
      }
      case "REMOVE_ALL_NOTIFICATIONS": {
        return {
          ...state,
          user: {
            ...state.user,
            totalNotifications: 0,
            notifications: { data: [] },
          },
        };
      }
      case "SET_COMMENTS": {
        return {
          ...state,
          post: { ...state.post, comments: action.payload },
        };
      }
      case "SET_POST_ID": {
        return {
          ...state,
          post: { ...state.post, postId: action.payload },
        };
      }
      case "LOGOUT": {
        return {
          ...state,
          loggedIn: false,
          user: {
            email: null,
            handle: null,
            imageUrl: null,
            userDbRef: null,
            notifications: [],
            totalNotifications: null,
          },
        };
      }
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };

// Provider sends state and dispatch to all the lower components.
// Lower components will access it through useContext(store).
// Store is created here.
