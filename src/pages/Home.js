import React, { useEffect } from "react";
// GoTrue - user authentication library
import GoTrue from "gotrue-js";

const auth = new GoTrue({
  APIUrl: "https://forum-wtchs.netlify.app/.netlify/identity",
  audience: "",
  setCookie: false,
});

function Home() {
  useEffect(() => {
    console.log(auth.currentUser());
  }, []);

  return <div>Home</div>;
}

export default Home;
