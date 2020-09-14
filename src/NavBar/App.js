import React from 'react';
import './App.css';
// import Rapper from './components/Rappers';
// import image from './image';
// import style from './'
import { Rappers } from '../components/RapperList';


function App() {
  return (

    <div className = "App" >
    <header className = "App-header" >
    <h1>
    <span>9</span>
    <span>X</span>
    <span>4</span>
    
    </h1>

    </header>

    
    <Rappers/>

    </div>
  );
}

export default App;