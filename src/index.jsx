import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "./redux/store";
import { injectStore } from "./utils/axiosInstance";
import App from "./App";
import styles from "./index.module.css";

const container = document.getElementById("root");
const root = createRoot(container);

injectStore(store);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
