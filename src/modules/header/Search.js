import React, { useEffect, useRef, useState } from "react";

function Search() {
  const [tooShort, setTooShort] = useState(false);
  const [query, setQuery] = useState("");
  const formRef = useRef();
  const inputRef = useRef();

  // *************** FUNCTIONS *******

  // Check if search input contains less that three symbols.
  const isTooShort = () => {
    if (query.trim().length < 3) {
      return true;
    } else {
      return false;
    }
  };

  // ***************** EFFECTS *********
  // Style input field on focus.
  useEffect(() => {
    const form = formRef.current;
    const input = inputRef.current;
    input.addEventListener("focus", () => {
      form.style.borderBottom = "2.7px solid #48c2d9ff";
    });

    input.addEventListener("blur", () => {
      form.style.borderBottom = "2.7px solid black";
    });
  }, []);

  // *************** HANDLERS ************

  // Handle search input submit.
  const handleSearch = () => {
    const isQueryTooShort = isTooShort();
    // If query is not too short...
    if (!isQueryTooShort) {
      window.location.href = `/search?query=${query}`;
    }
    // If query is too short...
    else {
      setTooShort(true);

      setTimeout(() => {
        const errorMsg = document.getElementById("query_too_short_message");
        if (errorMsg) {
          errorMsg.style.animationDuration = "0.6s";
          errorMsg.style.animationName = "slideupsearcherror";
        }

        setTimeout(() => {
          setTooShort(false);
        }, 500);
      }, 2000);
    }
  };

  // *********** RETURN ***************
  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <label htmlFor="query">Search in posts</label>
      <input
        type="text"
        placeholder="..."
        ref={inputRef}
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
        onClick={handleSearch}
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
