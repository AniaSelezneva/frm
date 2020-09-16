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

  const test = () => {
    return new Promise(async (resolve, reject) => {
      const res = await fetch("/.netlify/functions/yes");
      console.log(res);
      resolve(res);
    });
  };

  useEffect(() => {
    const smth = async () => {
      await test();
      await getAllPosts();
    };

    smth();
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
