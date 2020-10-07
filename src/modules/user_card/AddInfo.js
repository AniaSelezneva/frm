import React, { useState, useContext } from "react";
// store
import { store } from "../../utils/store";
// Styles
import userCardStyles from "./styles/index.module.scss";

function AddInfo({ setIsAddInfoOpen }) {
  const { state, dispatch } = useContext(store);
  const [location, setLocation] = useState(state.user.location);
  const [hobbies, setHobbies] = useState(state.user.hobbies);
  const [occupation, setOccupation] = useState(state.user.occupation);
  const [isError, setIsError] = useState(false);

  const addInfoToDb = async () => {
    try {
      await fetch("/api/addInfo", {
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

      window.location.reload();
    } catch (error) {
      console.log(error);
      setIsError(true);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        addInfoToDb();
      }}
      className={userCardStyles.form}
    >
      <label htmlFor="location">Location: </label>
      <input
        name="location"
        type="text"
        placeholder={location}
        onChange={(e) => {
          setLocation(e.target.value);
          setIsError(false);
        }}
      />

      <label htmlFor="hobbies">Hobbies: </label>
      <input
        name="hobbies"
        type="text"
        placeholder={hobbies}
        onChange={(e) => {
          setHobbies(e.target.value);
          setIsError(false);
        }}
      />

      <label htmlFor="occupation">Occupation: </label>
      <input
        name="occupation"
        type="text"
        placeholder={occupation}
        onChange={(e) => {
          setOccupation(e.target.value);
          setIsError(false);
        }}
      />
      <span className={userCardStyles.buttons_container}>
        <button type="submit">submit</button>
        <button onClick={() => setIsAddInfoOpen(false)}>close</button>
      </span>

      {isError && <p>Error occured, please try again later</p>}
    </form>
  );
}

export default AddInfo;
