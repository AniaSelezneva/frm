import React, { useState, useContext, useEffect } from "react";
// store
import { store } from "../../utils/store";
// HOC
import WithError from "../../HOCs/WithError";
// Styles
import userCardStyles from "./styles/index.module.scss";

function AddInfo({ setIsAddInfoOpen, setIsError }) {
  const { state, dispatch } = useContext(store);
  const [location, setLocation] = useState(state.user.location);
  const [hobbies, setHobbies] = useState(state.user.hobbies);
  const [occupation, setOccupation] = useState(state.user.occupation);
  let isSubscribed = true;

  // Add info to db and dispatch 'add_info'
  const addInfoToDb = async () => {
    try {
      const res = await fetch("/api/addInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location,
          hobbies,
          occupation,
          userHandle: state.user.handle,
        }),
      });

      if (res.status >= 400) {
        setIsError(true);
      } else {
        if (isSubscribed) {
          dispatch({
            type: "ADD_INFO",
            payload: { location, hobbies, occupation },
          });

          setIsAddInfoOpen(false);
        }
      }
    } catch (error) {
      console.log(error);
      setIsError(true);
    }
  };

  // Remove a field from info
  const removeInfo = async (info) => {
    try {
      const res = await fetch("/api/removeInfoField", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Info-To-Remove": info,
          "User-Handle": state.user.handle,
        },
      });

      if (res.status >= 400) {
        setIsError(true);
      } else {
        if (info === "location") {
          setLocation(undefined);
        } else if (info === "hobbies") {
          setHobbies(undefined);
        } else if (info === "occupation") {
          setOccupation(undefined);
        }

        if (isSubscribed) {
          dispatch({
            type: "REMOVE_INFO",
            payload: info,
          });
        }
      }
    } catch (error) {
      console.log(error);
      setIsError(true);
    }
  };

  // Empty input field
  const emptyField = (name) => {
    const input = document.getElementById(name);
    input.setAttribute("placeholder", "");
  };

  // Unsubscribe
  useEffect(() => {
    return () => (isSubscribed = false);
  }, []);

  return (
    <form className={userCardStyles.form}>
      <label htmlFor="location">Location: </label>
      <div className={userCardStyles.input}>
        <input
          id="location"
          name="location"
          type="text"
          placeholder={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setIsError(false);
          }}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            removeInfo("location");
            emptyField("location");
          }}
        >
          x
        </button>
      </div>

      <label htmlFor="hobbies">Hobbies: </label>
      <div className={userCardStyles.input}>
        <input
          id="hobbies"
          name="hobbies"
          type="text"
          placeholder={hobbies}
          onChange={(e) => {
            setHobbies(e.target.value);
            setIsError(false);
          }}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            removeInfo("hobbies");
            emptyField("hobbies");
          }}
        >
          x
        </button>
      </div>

      <label htmlFor="occupation">Occupation: </label>
      <div className={userCardStyles.input}>
        <input
          id="occupation"
          name="occupation"
          type="text"
          placeholder={occupation}
          onChange={(e) => {
            setOccupation(e.target.value);
            setIsError(false);
          }}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            removeInfo("occupation");
            emptyField("occupation");
          }}
        >
          x
        </button>
      </div>

      <span className={userCardStyles.buttons_container}>
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            addInfoToDb();
          }}
        >
          submit
        </button>
        <button onClick={() => setIsAddInfoOpen(false)}>close</button>
      </span>
    </form>
  );
}

export default WithError(AddInfo);
