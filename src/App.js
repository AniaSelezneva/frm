import React from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
// Components
import Signup from "./components/Signup";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Switch>
        <Route to="/" component={Home} />
        <Route to="/signup" component={Signup} />
      </Switch>
    </Router>
  );
}

export default App;
