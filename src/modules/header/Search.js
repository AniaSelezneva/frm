import React, { useContext } from "react";
// store
import { store } from "../../utils/store";

function Search(props) {
  const { state, dispatch } = useContext(store);

  // const setPosts = async (searchWord, size) => {
  //   const payload = await adminClient.query(
  //     q.Map(
  //       q.Paginate(q.Reverse(q.Match(q.Index("posts_by_words7"), searchWord)), {
  //         size,
  //       }),
  //       q.Lambda("ref", q.Get(q.Var("ref")))
  //     )
  //   );

  //   dispatch({ type: "SET_POSTS", payload });

  //   setIsLoading(false);
  // };

  // useEffect(() => {
  //   setIsLoading(true);
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const search = urlParams.get("query");
  //   dispatch({ type: "SET_QUERY", payload: search });

  //   if (search !== null) {
  //     setPosts(search, 3);
  //   } else {
  //     setIsLoading(false);
  //   }

  // (async () => {
  //   // Fuzzy search
  //   const res = await adminClient.query(
  //     q.CreateIndex({
  //       name: "posts_by_words7",
  //       source: {
  //         // If your collections have the same property tht you want to access you can pass a list to the collection
  //         collection: [q.Collection("posts")],
  //         fields: {
  //           wordparts: q.Query(
  //             q.Lambda(
  //               "post",
  //               q.Distinct(
  //                 q.Union(
  //                   q.Let(
  //                     {
  //                       ngrams: q.Map(
  //                         // ngrams
  //                         [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  //                         q.Lambda(
  //                           "i",
  //                           q.NGram(
  //                             q.LowerCase(
  //                               q.Select(["data", "body"], q.Var("post"))
  //                             ),
  //                             q.Var("i"),
  //                             q.Var("i")
  //                           )
  //                         )
  //                       ),
  //                     },
  //                     q.Var("ngrams")
  //                   )
  //                 )
  //               )
  //             )
  //           ),
  //         },
  //       },

  //       // what to search
  //       terms: [
  //         {
  //           binding: "wordparts",
  //         },
  //       ],
  //     })
  //   );

  //   // // Search by whole word, problem is delimeter which is ' ' in my case, which means comas and stuff can be there
  //   // const res = await adminClient.query(
  //   //   q.CreateIndex({
  //   //     name: "posts_by_words4",
  //   //     source: {
  //   //       collection: q.Collection("posts"),
  //   //       // field that doesn't exist in the document, we created it....
  //   //       fields: {
  //   //         words: q.Query(
  //   //           q.Lambda(
  //   //             "post",
  //   //             // it returns that for every document
  //   //             // for every document body becomes an array of words
  //   //             q.StringSplit(q.Select(["data", "body"], q.Var("post")), " ")
  //   //           )
  //   //         ),
  //   //       },
  //   //     },
  //   //     // what to search
  //   //     terms: [{ binding: "words" }],
  //   //   })
  //   // );
  // })();

  //}, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // Redirect with query params.
        window.location.href = `/search/?query=${state.query}`;
      }}
    >
      <input
        type="text"
        placeholder="search in posts..."
        required
        minLength="3"
        onChange={(e) => {
          dispatch({ type: "SET_QUERY", payload: e.target.value });
        }}
      />
      &nbsp;
      <button type="submit">Search</button>
    </form>
  );
}

export default Search;