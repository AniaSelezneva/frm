import React, { useContext } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
// Components
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Login from "./pages/Login";
// Store
import { store } from "./utils/store";

function App() {
  const { state, dispatch } = useContext(store);

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/signup" component={Signup}>
          {state.loggedIn && <Redirect to="/" />}
        </Route>
        <Route path="/login" component={Login}>
          {state.loggedIn && <Redirect to="/" />}
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
