import React from 'react';
import './App.css';
// import Rapper from './components/Rappers';
// import image from './image';
// import rappL
import Rappers from './components/RapperList';
import ClickableList from './components/RapperList';
// import MainList from './components/MainList';


function App() {
  return (

        <>
    <div className = "App" >
    <header className = "App-header" >
        <h1 > Pass Da Aux </h1>
        {/* <MainList/> */}
        {/* {item.album} */}

    </header>

    
      <Rappers />
      <ClickableList />

    </div>
        </>
  );
}

export default App;