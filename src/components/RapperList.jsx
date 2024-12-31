import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import {RapperCloutButton} from '../RapperCloutButton';



const ClickableList = props => {
  const [items, setItems] = useState([]);
  // Initialize the list with an array of objects containing strings and a count of 0
  useEffect(() => {

    axios.get('https://ninebyfourapi.herokuapp.com/api', {method: 'GET'})
    .then((res) => {
      console.log(res.data);
      setItems(res.data);
      
    })
  }, [])
  const [R, setR] = useState([
    { id: 1, artist_name: "Kendrick Lamar", aka: "KDot", genre: "Hip Hop", count: 0, state: "CA", region: "west", label: "TDE", album: "Mr. Moral & the Big Stepper", year: 2023, certifications:"platinum" },
    { id: 2, artist_name: "Jay-Z", genre: "Hip Hop", count: 0 },
    { id: 3, artist_name: "Drake", genre: "Hip Hop", count: 0 },
    { id: 4, artist_name: "J Cole", genre: "Hip Hop", count: 0 },
    { id: 5, artist_name: "Pusha T", genre: "Hip Hop", count: 0 },
    { id: 6, artist_name: "Young Thug", genre: "Hip Hop", count: 0 },
    { id: 7, artist_name: "ScHoolboyQ", genre: "Hip Hop", count: 0 },
    { id: 8, artist_name: "Kanye West", genre: "Hip Hop", count: 0 },
    { id: 9, artist_name: "Cardi B", genre: "Hip Hop", count: 0 }
  ]);

  // Handle button click
  const handleClick = (index) => {
      // Create a new array with updated count for the clicked item
      const newItems = [...items];
      newItems[index].count += 1;
      
      console.log(items);
    // Sort items based on count in descending order
    newItems.sort((a, b) => b.count - a.count);

    // Update the state with the sorted list
    setItems(newItems);
  };

  return (
    <div>
      <h2>Pass Da Aux</h2>
      <ul>
        {items.map((item, index, id) => (
          <li key={item.id} style={{ marginBottom: '10px' }}>
            <button onClick={() => handleClick(index)}>
              {item.artist_name} - Clout: {item.count} {item.genre} {item.album}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClickableList;
