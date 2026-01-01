// // src/index.jsx
// import React from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";
// import { Provider } from "react-redux";
// // Import the REAL store that has all your reducers
// import store from "./redux/store";
// import App from "./App";
// import * as serviceWorker from "./serviceWorker";

// const container = document.getElementById("root");
// const root = createRoot(container);

// root.render(
//   // root.render(
//   <Provider store={store}>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </Provider>
// );

// <React.StrictMode>
//   {" "}
//   {/* Added StrictMode to catch side effects early */}
//   <Provider store={store}>
//     <App />
//   </Provider>
// </React.StrictMode>
// );

// serviceWorker.unregister();

// ***********************New Code Below****************************** //

// src/index.jsx
// import React from "react";
// import { createRoot } from "react-dom/client";
// import { Provider } from "react-redux";
// import { BrowserRouter } from "react-router-dom"; // THIS WAS MISSING
// import store from "./redux/store";
// import App from "./App";
// import "./index.css";
// import * as serviceWorker from "./serviceWorker";

// const container = document.getElementById("root");
// if (!container) throw new Error("Failed to find the root element"); // High-level safety check

// const root = createRoot(container);

// root.render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <BrowserRouter>
//         <App />
//       </BrowserRouter>
//     </Provider>
//   </React.StrictMode>
// );

// serviceWorker.unregister();

// *************************************************************** //

import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "./redux/store";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
