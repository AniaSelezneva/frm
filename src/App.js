import React, { useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
// Components
import GetInvitation from "./pages/GetInvitation/index";
import SignupWithInvitation from "./pages/Signup/SignupWithInvitation";
import Home from "./pages/Home/";
import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login/index";
import Post from "./pages/Post/index";
import RestorePassword from "./pages/RestorePassword/RestorePassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import PageNotFound from "./pages/404/PageNotFound";
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
      // ...change loggedIn property in state object.
      dispatch({ type: "LOG_IN" });
    }
  }, []);

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/search" component={Home} />
        <Route exact path="/signup" component={Signup}>
          {state.loggedIn && <Redirect to="/" />}
        </Route>
        {/* <Route exact path="/invite" component={GetInvitation}>
          {state.loggedIn && <Redirect to="/" />}
        </Route> */}
        <Route exact path="/login" component={Login}>
          {state.loggedIn && <Redirect to="/" />}
        </Route>

        <Route exact path="/restorepassword" component={RestorePassword}>
          {state.loggedIn && <Redirect to="/" />}
        </Route>

        <Route exact path="/resetpassword" component={ResetPassword}>
          {state.loggedIn && <Redirect to="/" />}
        </Route>

        <Route exact path="/post/:postId" component={Post} />
        <Route exact path="/user/:name" component={Home} />
        <Route exact path="/profile" component={Home}>
          {!state.loggedIn && <Redirect to="/login" />}
        </Route>
        <Route component={PageNotFound} />
      </Switch>
    </Router>
  );
}

export default App;
