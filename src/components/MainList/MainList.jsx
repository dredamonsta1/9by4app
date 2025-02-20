import React from "react";
import RapperList from "../RapperList";
import "./MainList.css";

const MainList = (props) => {
  return (
    <div className="rapper-list-container">
      {/* <h1> Pass Da Aux </h1> */}
      <RapperList />
    </div>
  );
};

export default MainList;
