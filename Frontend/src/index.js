import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter as Router } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <GoogleOAuthProvider
      clientId="620148635388-2v1mc0ih3rl0rbqfo2i3af0dulr8ngnh.apps.googleusercontent.com"
      scope="openid profile email"
    >
      <App />
    </GoogleOAuthProvider>
  </Router>
);
