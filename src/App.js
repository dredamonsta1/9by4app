import React from 'react';
import './App.css';
// import Rapper from './components/Rappers';
// import image from './image';
// import style from './'
import  NavBar  from './components/NavBar/NavBar';
import { Rappers } from './components/RapperList';


function App() {
  return (

    <div className = "app" >
 

    <NavBar/>
    <Rappers/>

    </div>
  );
}

export default App;