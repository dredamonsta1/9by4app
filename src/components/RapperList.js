import React, {useState, useEffect} from 'react';
import {RapperCloutButton} from '../RapperCloutButton';


// const Rappers = props => {
//         const [artistNames, setArtistNames] = useState([
//             {
//                 id: 1,
//                 name: 'Jay-Z',
//                 clout: 0,
//             },
//             {
//                 id: 2,
//                 name: 'Drake',
//                 clout: 0,
//             },
//             {
//                 id: 3,
//                 name: 'J Cole',
//                 clout: 0,
//             },
//             {
//                 id: 4,
//                 name: 'Kendrik Lamar',
//                 clout: 0,
//             },
//             {
//                 id: 5,
//                 name: 'Young Thug',
//                 clout: 0,
//             },
//             {
//                 id: 6,
//                 name: 'Pusha T',
//                 clout: 0,
//             },
//             {
//                 id: 7,
//                 name: 'Cardi B',
//                 clout: 0,
//             },
//             {
//                 id: 8,
//                 name: 'Kanye West',
//                 clout: 0,
//             },
//             {
//                 id: 9,
//                 name: 'ScHoolboyQ',
//                 clout: 0
//             }
//         ]);

//         // useEffect(() => {
//         //     if (this.clout === this.clout) {
//         //         return artistNames
//         //     } else {
                
//         //     }
//         // })
    
//         function upClout(artist, topFifty, clout, id) {
//             console.log(artist);
//             // console.log(...artistNames)
//             // console.log(topFifty);
//             console.log(this.clout)
//             // console.log(this.id)
//             setArtistNames(
//                 artistNames.map((artistName, id) => {
//                     let clout = artistName.clout;
//                     if (artistName.name === artist) {
//                         if ( topFifty ) {
//                             clout++;
//                         } else if (clout > 0) {
//                             clout --;
//                         }
//                     }
//                     return {name: artistName.name, clout: clout};
//                 })
//             );
//         }
    
//         return ( 
//             <React.Fragment>
//             <div style={{ display: "flex", flexDirection: "column", color: "green" }} > 
//             {artistNames.map((artistName, id) => {
//                 return ( 
//                         <RapperCloutButton 
//                         key={id}
//                         artist={artistName.name}
//                         clout={artistName.clout}
//                         upClout={upClout}
//                         downClout={upClout}
//                         />
//                     );
//                 })}
//             </div> 
//          </React.Fragment>      
//     );
// };

// export default Rappers;

// ######################################################
// import React, { useState } from 'react';

const ClickableList = props => {
  // Initialize the list with an array of objects containing strings and a count of 0
  const [items, setItems] = useState([
    { id: "1", name: "Kendrick Lamar", genre: "Hip Hop", count: 0 },
    { id: "2", name: "Jay-Z", genre: "Hip Hop", count: 0 },
    { id: "3", name: "Drake", genre: "Hip Hop", count: 0 },
    { id: "4", name: "J Cole", genre: "Hip Hop", count: 0 },
    { id: "5", name: "Pusha T", genre: "Hip Hop", count: 0 },
    { id: "6", name: "Young Thug", genre: "Hip Hop", count: 0 },
    { id: "7", name: "ScHoolboyQ", genre: "Hip Hop", count: 0 },
    { id: "8", name: "Kanye West", genre: "Hip Hop", count: 0 },
    { id: "9", name: "Cardi B", genre: "Hip Hop", count: 0 }
  ]);

  // Handle button click
  console.log(items);
  const handleClick = (index) => {
    // Create a new array with updated count for the clicked item
    const newItems = [...items];
      newItems[index].count += 1;

    // Sort items based on count in descending order
    newItems.sort((a, b) => b.count - a.count);

    // Update the state with the sorted list
    setItems(newItems);
  };

  return (
    <div>
      <h2>Cvltvr</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index} style={{ marginBottom: '10px' }}>
            <button onClick={() => handleClick(index)}>
              {item.name} - Clicks: {item.count}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClickableList;
