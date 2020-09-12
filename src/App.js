import React from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
// Components
import Signup from "./components/Signup";

function App() {
  return (
    <Router>
      <Switch>
        <Route to="/signup" component={Signup} />
      </Switch>
    </Router>
  );
}

export default App;
