import React, { useContext } from "react";
// gotrue auth
import auth from "../../utils/auth";
// store
import { store } from "../../utils/store";
// Styles
import userCardStyles from "./styles/index.module.scss";

function Logout() {
  const { dispatch } = useContext(store);

  // Logout
  const logout = async () => {
    try {
      const user = auth.currentUser();
      user.logout();
      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <button
      id={userCardStyles.logout_button}
      onClick={() => {
        logout();
      }}
    >
      logout
    </button>
  );
}

export default Logout;
