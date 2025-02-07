import React, { useState, useEffect } from "react";
import axios from "axios";
// import {RapperCloutButton} from '../RapperCloutButton';

const ClickableList = (props) => {
  const [items, setItems] = useState([]); // To store the fetched data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Initialize the list with an array of objects containing strings and a count of 0
  useEffect(() => {
    setLoading(true);
    fetch("https://ninebyfourapi.herokuapp.com/api")
      .then((res) => res.json())
      .then((data) => {
        const itemsWithCount = (Array.isArray(data) ? data : [data]).map(
          (item) => ({ count: item.count || 0, ...item })
        );
        setItems(itemsWithCount);
        setLoading(false);
        console.log(data);

        // axios
        //   .get("https://ninebyfourapi.herokuapp.com/api", { method: "GET" })
        //   .then((res) => {
        //     const data = Array.isArray(res.data) ? res.data : [res.data];
        //     setItems(data);
        // console.log(data);

        // console.log("User Agent:", navigator.userAgent);
        // console.log("Location:", window.location.href);

        // console.log(res.data);
      })
      .catch((error) => {
        console.error("fetching data:", error);
        setError(true);
        setLoading(false);
        if (error.res) {
          console.log("Error response:", error.res.data);
        } else if (error.req) {
          console.log("Request error:", error.req);
        } else {
          console.log("General error:", error.message);
        }
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data</p>;

  // Handle button click component
  const handleClick = (index) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, count: item.count + 1 } : item
    );
    //sort without mutating
    const sortedItems = [...newItems].sort((a, b) => b.count - a.count);
    setItems(sortedItems);
    // newItems[index].count += 1; // Increment the count of the clicked item
    // console.log(newItems);
    console.log(items);
    // newItems.sort((a, b) => b.count - a.count); // Sort items based on count in descending order
    // setItems(newItems); // Update the state with the sorted list
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
            name: {item.name || "N/A"}
            genre: {item.genre || "N/A"}
            state: {item.state || "N/A"}
            region: {item.region || "N/A"}
            label: {item.label || "N/A"}
            album: {item.album || "N/A"}
            year: {item.year || "N/A"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClickableList;
