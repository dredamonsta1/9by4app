import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import {RapperCloutButton} from '../RapperCloutButton';

const ClickableList = props => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Initialize the list with an array of objects containing strings and a count of 0
  useEffect(() => {
    // async function fetchData() {
    //   try {
    //     const response = await axios.get('https://ninebyfourapi.herokuapp.com/api', {method: 'GET'});
    //     setItems(response.data);
    //     setLoading(false);
    //     console.log(response.data);
    //   } catch (error) {
    //     setError(true);
    //     setLoading(false);
    //   }
    // }

    axios.get('https://ninebyfourapi.herokuapp.com/api', {method: 'GET'})
    .then((res) => {
      setItems(res.data);
      console.log(res.data);
      console.log(error);
      
    })
  }, [])
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
        {Object.keys(items).map((item, index, artist_id) => (
          <li key={item.artist_id} style={{ marginBottom: '10px' }}>
            <button onClick={() => handleClick(index)}>
              {item.name} Clout: {item.count} {item.genre} {item.album} {item.year}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClickableList;
