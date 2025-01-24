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
