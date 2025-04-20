import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
// import { Provider } from "mobx-react";
import store from "./store/store";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

const container = document.getElementById("root");
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <Provider store={store}>
    <App tab="home" />
  </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
