"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = ({ theme, toggleTheme }) => {
  const { user } = useAuth();
  const pathname = usePathname();

  const isOnProfile =
    pathname === "/profile-overview" ||
    pathname === "/edit-profile";

  const avatarLink = isOnProfile ? "/tasks" : "/profile-overview";
  const isHome = pathname === "/tasks";

  const avatarBorderStyle = isOnProfile
    ? theme === "dark"
      ? "2px dashed #fff"
      : "2px dashed #000"
    : theme === "dark"
    ? "2px solid #fff"
    : "2px solid #000";

  const avatarStyle = {
    width: "35px",
    height: "35px",
    objectFit: "cover",
    borderRadius: "50%",
    border: avatarBorderStyle,
    marginLeft: "0.75rem",
  };

  const placeholderStyle = {
    ...avatarStyle,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6c757d",
    color: "#fff",
    fontWeight: "bold",
  };

  const navbarClasses = `navbar ${
    theme === "dark" ? "navbar-dark bg-black" : "navbar-light bg-light"
  } shadow-sm`;

  return (
    <nav className={navbarClasses}>
      <div className="container-fluid flex-row justify-content-between align-items-center">
        <Link
          className="navbar-brand"
          href="/"
          style={{ fontFamily: "Poppins", fontWeight: 600 }}
        >
          Task Manager
        </Link>

        <ul className="navbar-nav gap-1 d-flex flex-row align-items-center justify-content-between">
          <li className="nav-item">
            <button
              onClick={toggleTheme}
              className="btn"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? (
                <i className="bi bi-sun-fill text-light"></i>
              ) : (
                <i className="bi bi-moon-fill"></i>
              )}
            </button>
          </li>
          {!user ? (
            <>
              <li className="nav-item me-1">
                <Link
                  href="/login"
                  className={`nav-link ${
                    pathname === "/login" ? "active" : ""
                  }`}
                >
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  href="/register"
                  className={`nav-link ${
                    pathname === "/register" ? "active" : ""
                  }`}
                >
                  Register
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link href="/tasks" className="btn" aria-label="Home">
                  <i
                    className={`bi ${isHome ? "bi-house-fill" : "bi-house"} ${
                      theme === "dark" ? "text-light" : "text-dark"
                    }`}
                    style={{ fontSize: "1.5rem" }}
                  ></i>
                </Link>
              </li>
              <li className="nav-item">
                <Link href={avatarLink} style={{ textDecoration: "none" }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" style={avatarStyle} />
                  ) : (
                    <div style={placeholderStyle}>
                      {user.firstName?.[0]?.toUpperCase()}
                      {user.lastName?.[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
