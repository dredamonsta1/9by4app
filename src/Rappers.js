import React from 'react';
import './Rappers.css';
// import {Rappers} from './components/RapperList'
// import PropTypes from 'prop-types';




export const Rapper = (props) => {
    return (
      // Some other JSX
      <div className="fiveByFourList" style= {{display: "flex"}}>
        <picture style= {{flex: 3, margin: 30}}>IMG</picture>
        <h5 style= {{flex:3, margin: 30}}>{props.artist}</h5>
        <h5 style= {{flex:6, margin: 30}}>{props.clout}</h5>

        <button onClick={() => props.upClout(props.artist, true )} style={{flex: 3,
        borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
    borderBottomLeftRadius: 50,
  borderBottomRightRadius: 50,
margin: 30,
backgroundColor: '#babde6'}}>

Clout</button>


        <button disabled={props.clout===0}onClick={() => props.downClout(props.artist, false )} style={{flex: 3,
        borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
    borderBottomLeftRadius: 50,
  borderBottomRightRadius: 50,
margin: 30,
backgroundColor: '#998d76'}}>

Cap</button>
       
      </div>      
    )
  }

  



  export default Rapper;