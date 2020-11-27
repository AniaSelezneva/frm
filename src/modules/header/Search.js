import React, { useEffect, useState } from "react";

function Search() {
  const [tooShort, setTooShort] = useState(false);
  const [query, setQuery] = useState();

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

  // Style input field on focus.
  useEffect(() => {
    const form = document.getElementById("search_form");
    const input = document.getElementById("query");
    input.addEventListener("focus", () => {
      form.style.borderBottom = "2.7px solid #48c2d9ff";
    });

    input.addEventListener("blur", () => {
      form.style.borderBottom = "2.7px solid black";
    });
  }, []);

  // Check if search input contains less that three symbols.
  const isTooShort = () => {
    const query = document.getElementById("query").value;
    if (query.trim().length < 3) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <form
      id="search_form"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <label htmlFor="query">Search in posts</label>
      <input
        type="text"
        placeholder="..."
        id="query"
        onChange={(e) => {
          setQuery(e.target.value.trim());
          setTooShort(false);
        }}
      />
      <input
        type="image"
        id="search_icon"
        src="/img/header/search.svg"
        alt="search icon"
        onClick={() => {
          const isQueryTooShort = isTooShort();
          if (!isQueryTooShort) {
            window.location.href = `/search?query=${query}`;
          } else {
            setTooShort(true);

            setTimeout(() => {
              const errorMsg = document.getElementById(
                "query_too_short_message"
              );
              if (errorMsg) {
                errorMsg.style.animationDuration = "0.6s";
                errorMsg.style.animationName = "slideupsearcherror";
              }

              setTimeout(() => {
                setTooShort(false);
              }, 500);
            }, 2000);
          }
        }}
      />
      {tooShort && (
        <p id="query_too_short_message">
          Must be at least three characters long
        </p>
      )}
    </form>
  );
}

export default Search;
