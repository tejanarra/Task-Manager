import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ConfirmationModal from "./ConfirmationModal";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  const logoutClicked = () => {
    setShowLogoutModal(true);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <Link
          className="navbar-brand"
          to="/"
          style={{ fontFamily: "Poppins", fontWeight: "600" }}
        >
          Task Manager
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {!user ? (
              <>
                <li className="nav-item">
                  <Link
                    to="/login"
                    className="nav-link text-dark"
                    style={{ fontWeight: "500" }}
                  >
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/register"
                    className="nav-link text-dark"
                    style={{ fontWeight: "500" }}
                  >
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item d-flex align-items-center">
                  <span
                    className="nav-link text-dark"
                    style={{ fontWeight: "500" }}
                  >
                    {user.firstName.charAt(0).toUpperCase() +
                      user.firstName.slice(1) +
                      " " +
                      user.lastName.charAt(0).toUpperCase() +
                      user.lastName.slice(1)}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      logoutClicked();
                    }}
                    style={{ fontWeight: "500" }}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      <ConfirmationModal
        show={showLogoutModal}
        title="Logout"
        message="Are you sure you want to log out?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </nav>
  );
};

export default Navbar;
