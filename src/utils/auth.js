// GoTrue - user authentication library
import GoTrue from "gotrue-js";

const auth = new GoTrue({
  APIUrl: "https://redballoons.netlify.app/.netlify/identity",
  audience: "",
  setCookie: false,
});

export default auth;
