import React from "react";
// Store
import { StateProvider } from "./utils/store";
// Components
import Bell from "./bell";

function Notifications() {
  // ****************** RETURN ********************
  return (
    <StateProvider>
      <Bell />
    </StateProvider>
  );
}

export default Notifications;
