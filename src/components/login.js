// import React from 'react';





// export const Greetings = (props) => {
//     const isLoggedIn = props.isLoggedIn;
//     if (isLoggedIn) {
//         return <UserGreeting />;
//     }
//     return <GuestGreeting/>;
// }






import React, { useState } from "react";
import { VoteItem } from "./components/VoteItem";


export const Vote = props => {
 const [frameWorks, setFrameWorks] = useState([
   {
     id: 1,
     name: "React",
     count: 0
   },
   {
     id: 2,
     name: "Angular",
     count: 0
   },
   {
     id: 3,
     name: "Ember",
     count: 0
   },
   {
     id: 4,
     name: "Vue",
     count: 0
   },
   {
     id: 5,
     name: "Svelte",
     count: 0
   }
 ]);




 function handleVote(text, voteUp) {
   setFrameWorks(
     frameWorks.map(frameWork => {
       let count = frameWork.count;
       if (frameWork.name === text) {
       if (voteUp) {
         count += 1;
       } else if (count > 0) {
         count -= 1;
         }
       }
       return { name: frameWork.name, count: count };
     })
   );
 }


 return (
   <>
     <h1>Vote Your Favorite JS Library </h1>

     <div style={{ display: "flex", flexDirection: "column" }}>
       {frameWorks.map(frameWork => {
         return (
           <VoteItem
             text={frameWork.name}
             count={frameWork.count}
             onUpVote={handleVote}
             onDownVote={handleVote}

             key={frameWork.name}
           />
         );
       })};
     </div>
   </>
 );
};
