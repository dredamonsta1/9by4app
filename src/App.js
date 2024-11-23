import React from 'react';
import './App.css';
// import Rapper from './components/Rappers';
// import image from './image';
// import rappL
import Rappers from './components/RapperList';
import ClickableList from './components/RapperList';
import mainList from './components/mainList';


function App() {
  return (

        <>
    <div className = "App" >
    <header className = "App-header" >
        <h1 > WOT </h1>
        <mainList/>
        {/* {item.album} */}

    </header>

    
      <Rappers />
      <ClickableList />

    </div>
        </>
  );
}

export default App;