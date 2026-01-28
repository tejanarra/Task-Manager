import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <GoogleOAuthProvider
      clientId="620148635388-rv5ni5tvr2j02dgq8gbef3no1phv5753.apps.googleusercontent.com"
    >
      <App />
    </GoogleOAuthProvider>
  </Router>
);
