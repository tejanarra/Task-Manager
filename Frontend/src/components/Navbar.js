import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user } = useAuth();

  const location = useLocation();

  const isOnProfilePage =
    location.pathname === "/profile-overview" ||
    location.pathname === "/edit-profile";

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
          <ul className="navbar-nav ms-auto d-flex align-items-center">
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
                <li className="nav-item icons d-flex align-items-center me-3">
                  <Link
                    to={isOnProfilePage ? "/" : "/profile-overview"}
                    className={`nav-link ${
                      isOnProfilePage ? "bi-list" : "bi-person-circle"
                    }`}
                    style={{
                      fontWeight: "500",
                      fontSize: "1.5rem",
                    }}
                  ></Link>
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
