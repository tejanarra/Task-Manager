import React from "react";
import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import TaskList from "./components/TaskList";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import ForgotPassword from "./components/ForgotPassword";
import ProfileOverview from "./components/ProfileOverview";
import EditProfile from "./components/EditProfile";
import ChangePassword from "./components/ChangePassword";
import "./App.css";

function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.body.classList.add("dark");
      }
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<TaskList theme={theme} />} />
            <Route path="/login" element={<Login theme={theme} />} />
            <Route
              path="/forgot-password"
              element={<ForgotPassword theme={theme} />}
            />
            <Route path="/register" element={<Register theme={theme} />} />
            <Route
              path="/profile-overview"
              element={<ProfileOverview theme={theme} />}
            />
            <Route
              path="/edit-profile"
              element={<EditProfile theme={theme} />}
            />
            <Route
              path="/change-password"
              element={<ChangePassword theme={theme} />}
            />
          </Routes>
        </main>
        <Footer theme={theme} />
      </div>
    </AuthProvider>
  );
}

export default App;
