import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom"; // Keep HashRouter here
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <HashRouter>
    {" "}
    {/* Only use HashRouter here */}
    <App />
  </HashRouter>
);
