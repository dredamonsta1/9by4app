// src/index.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
// Import the REAL store that has all your reducers
import store from "./redux/store";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    {" "}
    {/* Added StrictMode to catch side effects early */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

serviceWorker.unregister();
