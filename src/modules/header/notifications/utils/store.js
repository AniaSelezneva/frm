import React, { createContext, useReducer } from "react";

const context = createContext(undefined);
const { Provider } = context;

const initialState = {
  size: 5,
  notifications: { data: [], before: undefined, after: undefined },
  total: undefined,
  totalCurrentPage: undefined,
  isError: undefined,
  isOpen: undefined,
  isLoading: undefined,
  isLast: undefined,
  isFirst: undefined,
};

function StateProvider({ children }) {
  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_NOTIFICATIONS":
        return {
          ...state,
          notifications: { ...state.notifications, data: action.payload },
        };

      case "SET_AFTER":
        return {
          ...state,
          notifications: { ...state.notifications, after: action.payload },
        };

      case "SET_BEFORE":
        return {
          ...state,
          notifications: { ...state.notifications, before: action.payload },
        };

      case "REMOVE_NOTIFICATION":
        const id = action.payload;
        let data = state.notifications.data;
        const index = data.findIndex(
          (notification) => notification.data.id === id
        );
        if (index >= 0) {
          data.splice(index, 1);
        }
        return { ...state, notifications: { ...state.notifications, data } };

      case "SET_TOTAL":
        return { ...state, total: action.payload };

      case "SET_TOTAL_CURRENT_PAGE":
        return { ...state, totalCurrentPage: action.payload };

      case "SET_IS_ERROR":
        return { ...state, isError: action.payload };

      case "SET_IS_OPEN":
        return { ...state, isOpen: action.payload };

      case "SET_IS_LOADING":
        return { ...state, isLoading: action.payload };

      case "REMOVE_ALL":
        return { ...state, notifications: {} };

      // Remove before (to disable arrow).
      case "REMOVE_BEFORE":
        return {
          ...state,
          notifications: { ...state.notifications, before: undefined },
        };
      // Remove after (to disable arrow).
      case "REMOVE_AFTER":
        return {
          ...state,
          notifications: { ...state.notifications, after: undefined },
        };

      case "SET_IS_LAST_PAGE":
        return {
          ...state,
          isLast: action.payload,
        };

      case "SET_IS_FIRST_PAGE":
        return {
          ...state,
          isFirst: action.payload,
        };
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
}

export { context, StateProvider };
