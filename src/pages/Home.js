import React, { useEffect, useState } from "react";
// withLoader hoc
import WithLoader from "../HOCs/WithLoader";
// faunaDB
import { q, adminClient } from "../utils/faunaDB";
// Components
import User from "../components/User";

function Home({ setIsLoading }) {
  const [posts, setPosts] = useState([]);

  // Fetch all posts.
  const getAllPosts = async () => {
    const res = await adminClient.query(
      q.Map(
        q.Paginate(q.Match(q.Index("all_posts"))),
        q.Lambda("X", q.Get(q.Var("X")))
      )
    );

    setPosts(res.data);
    setIsLoading(false);
  };

  const test = async () => {
    const res = await fetch("/.netlify/functions/");
    const data = await res.json();
    console.log(data);
  };

  useEffect(() => {
    test();
    getAllPosts();
  }, []);

  return (
    <div>
      {posts.map((post, index) => (
        <div key={index}>
          <p>{post.data.body}</p>
          <h6>{post.data.userHandle}</h6>
        </div>
      ))}
      <User />
    </div>
  );
}

export default WithLoader(Home, "wait...");
