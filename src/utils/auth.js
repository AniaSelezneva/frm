// GoTrue - user authentication library
import GoTrue from "gotrue-js";

const auth = new GoTrue({
  APIUrl: "https://p6b.netlify.app/.netlify/identity",
  audience: "",
  setCookie: false,
});

export default auth;
