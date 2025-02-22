import React from "react";
import "./App.css";
// import Rapper from './components/Rappers';
// import image from './image';
import RapperCloutButton from "./RapperCloutButton";
// import Rappers from "./components/RapperList";
import AuthForm from "./components/Signup/Signup";
import ClickableList from "./components/RapperList";
import MainList from "./components/MainList/MainList";
import UserProfile from "./components/userProfile/UserProfile";

function App() {
  return (
    <>
      <UserProfile />
      <div className="App">
        <header className="App-header">
          <h1> Pass Da Aux </h1>
          <MainList />
          <AuthForm />
        </header>

        {/* <Rappers /> */}
        {/* <ClickableList /> */}
        {/* <RapperCloutButton /> */}
      </div>
    </>
  );
}

export default App;
