import React, { useState, useEffect, lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./context/PrivateRoute";
import PublicRoute from "./context/PublicRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import "./App.css";

const LandingPage = lazy(() => import("./components/landingPage/LandingPage"));
const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const TaskList = lazy(() => import("./components/TaskList"));
const ProfileOverview = lazy(() => import("./components/ProfileOverview"));
const EditProfile = lazy(() => import("./components/EditProfile"));
const ChangePassword = lazy(() => import("./components/ChangePassword"));

function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.classList.add(savedTheme);
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
      <div className={`app-container ${theme}`}>
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <main className="main-content">
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Routes>
              <Route path="/" element={<LandingPage theme={theme} />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login theme={theme} />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register theme={theme} />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPassword theme={theme} />
                  </PublicRoute>
                }
              />

              <Route
                path="/tasks"
                element={
                  <PrivateRoute>
                    <TaskList theme={theme} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile-overview"
                element={
                  <PrivateRoute>
                    <ProfileOverview theme={theme} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/edit-profile"
                element={
                  <PrivateRoute>
                    <EditProfile theme={theme} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/change-password"
                element={
                  <PrivateRoute>
                    <ChangePassword theme={theme} />
                  </PrivateRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
        <Footer theme={theme} />
      </div>
    </AuthProvider>
  );
}

export default App;
