import React, { useState, useEffect } from "react";
import axios from "axios";
// import {RapperCloutButton} from '../RapperCloutButton';

const ClickableList = (props) => {
  const [items, setItems] = useState([]); // To store the fetched data
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(false);
  // Initialize the list with an array of objects containing strings and a count of 0
  useEffect(() => {
    axios
      .get("https://ninebyfourapi.herokuapp.com/api", { method: "GET" })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [res.data];
        setItems(data);
        console.log(data);

        console.log(res.data);
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
    const newItems = [...items]; // Create a new array with updated count for the clicked item
    newItems[index].count += 1; // Increment the count of the clicked item
    console.log(newItems);
    newItems.sort((a, b) => b.count - a.count); // Sort items based on count in descending order
    setItems(newItems); // Update the state with the sorted list
  };

  return (
    <div>
      <h2>Pass Da Aux</h2>
      <ul>
        {items.map((item, index) => (
          <li key={item.artist_id} style={{ marginBottom: "10px" }}>
            <button onClick={() => handleClick(index)}>
              Clout: {item.count}
            </button>
            name: {item.name} state: {item.state} region: {item.region} label:{" "}
            genre: {item.genre} album: {item.album} year: {item.year}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClickableList;
