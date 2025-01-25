import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../Styles/Navbar.css";

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isOnProfile =
    location.pathname === "/profile-overview" ||
    location.pathname === "/edit-profile";

  const avatarLink = isOnProfile ? "/" : "/profile-overview";

  const avatarBorderStyle = isOnProfile ? "2px dashed #000" : "2px solid #000";

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

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <Link
          className="navbar-brand"
          to="/"
          style={{ fontFamily: "Poppins", fontWeight: 600 }}
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
          <ul className="navbar-nav ms-auto align-items-center">
            {!user ? (
              <>
                <li className="nav-item">
                  <Link
                    to="/login"
                    className={`nav-link ${
                      location.pathname === "/login" ? "active" : ""
                    }`}
                  >
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/register"
                    className={`nav-link ${
                      location.pathname === "/register" ? "active" : ""
                    }`}
                  >
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to={avatarLink} style={{ textDecoration: "none" }}>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        style={avatarStyle}
                      />
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
      </div>
    </nav>
  );
};

export default Navbar;
