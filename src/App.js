import React, { useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
// Components
import GetInvitation from "./pages/GetInvitation/index";
import Home from "./pages/Home/Home";
import Signup from "./pages/Signup/SignupWithInvitation";
import Login from "./pages/Login/index";
import Post from "./pages/Post/index";
// Store
import { store } from "./utils/store";
// Styles
import "./styles/App.scss";
// auth
import auth from "./utils/auth";

function App() {
  const { state, dispatch } = useContext(store);

  // Check if user is signed in.
  useEffect(() => {
    // If he is...
    if (auth.currentUser() !== null && auth.currentUser() !== undefined) {
      // change loggedIn property in state object.
      dispatch({ type: "LOG_IN" });
    }
  }, []);

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/search/" component={Home} />
        <Route exact path="/signup" component={Signup} />
        <Route exact path="/invite" component={GetInvitation}>
          {state.loggedIn && <Redirect to="/" />}
        </Route>
        <Route exact path="/login" component={Login}>
          {state.loggedIn && <Redirect to="/" />}
        </Route>

        <Route exact path="/post/:postId" component={Post} />
        <Route exact path="/user/:name" component={Home} />
        <Route exact path="/profile" component={Home} />
      </Switch>
    </Router>
  );
}

export default App;
