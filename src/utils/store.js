import React, { createContext, useReducer } from "react";

const initialState = { loggedIn: false, user: null };
// store has Provider and Consumer components
const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case "LOG_IN":
        return { ...state, loggedIn: true };
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
