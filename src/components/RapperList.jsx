import React, { useState, useEffect } from "react";
import axios from "axios";
// import {RapperCloutButton} from '../RapperCloutButton';

const ClickableList = (props) => {
  const [items, setItems] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(false);
  const [currentFetch, setCurrentFetch] = useState({
    artist_id: 0,
    name: "",
    genre: "",
    count: 0,
    state: "",
    region: "",
    label: "",
    mixtape: "",
    album: "",
    year: 0,
    certifications: "",
  });
  // Initialize the list with an array of objects containing strings and a count of 0
  useEffect(() => {
    axios
      .get("https://ninebyfourapi.herokuapp.com/api", { method: "GET" })
      .then((res) => {
        const {
          artist_id,
          name,
          genre,
          count,
          state,
          region,
          label,
          mixtape,
          album,
          year,
          certifications,
        } = res.data;
        setCurrentFetch({
          ...currentFetch,
          ...{
            artist_id,
            name,
            genre,
            count,
            state,
            region,
            label,
            mixtape,
            album,
            year,
            certifications,
          },
        });
        // console.log(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  // const [R, setR] = useState([
  //   { id: 1, artist_name: "Kendrick Lamar", aka: "KDot", genre: "Hip Hop", count: 0, state: "CA", region: "west", label: "TDE", album: "Mr. Moral & the Big Stepper", year: 2023, certifications:"platinum" },
  //   { id: 2, artist_name: "Jay-Z", genre: "Hip Hop", count: 0 },
  //   { id: 3, artist_name: "Drake", genre: "Hip Hop", count: 0 },
  //   { id: 4, artist_name: "J Cole", genre: "Hip Hop", count: 0 },
  //   { id: 5, artist_name: "Pusha T", genre: "Hip Hop", count: 0 },
  //   { id: 6, artist_name: "Young Thug", genre: "Hip Hop", count: 0 },
  //   { id: 7, artist_name: "ScHoolboyQ", genre: "Hip Hop", count: 0 },
  //   { id: 8, artist_name: "Kanye West", genre: "Hip Hop", count: 0 },
  //   { id: 9, artist_name: "Cardi B", genre: "Hip Hop", count: 0 }
  // ]);

  // Handle button click
  const handleClick = (index) => {
    // Create a new array with updated count for the clicked item
    const newItems = [...currentFetch];
    newItems[index].count += 1;

    console.log(newItems);
    // Sort items based on count in descending order
    newItems.sort((a, b) => b.count - a.count);

    // Update the state with the sorted list
    setItems(newItems);
  };

  return (
    <div>
      <h2>Pass Da Aux</h2>
      <ul>
        {Object.keys(currentFetch).map((newItems, index, artist_id) => (
          <li key={currentFetch.artist_id} style={{ marginBottom: "10px" }}>
            <button onClick={() => handleClick(index)}>
              {newItems.name} Clout: {newItems.count} {newItems.genre}{" "}
              {newItems.album} {newItems.year}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClickableList;
