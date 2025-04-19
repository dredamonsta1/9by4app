import React from "react";
import "./App.css";
// import Rapper from './components/Rappers';
// import image from './image';
// import Rappers from "./components/RapperList";
import AuthForm from "./components/Signup/Signup";
// import ClickableList from "./components/RapperList";
import MainList from "./components/MainList/MainList";
import UserProfile from "./components/userProfile/UserProfile";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
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
      </BrowserRouter>
    </>
  );
}

export default App;
