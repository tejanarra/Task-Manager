import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/api";
import "../Styles/ProfileOverview.css";
import { useAuth } from "../context/AuthContext";
import ConfirmationModal from "./ConfirmationModal";
import { convertDateToWords } from "../utils/dateUtils";

const ProfileOverview = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  const logoutClicked = () => {
    setShowLogoutModal(true);
  };

  function arrayBufferToBase64(buffer) {
    var binary = "";
    var bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return window.btoa(binary);
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        if (data.avatar && data.avatar.data) {
          const base64Avatar = arrayBufferToBase64(data.avatar.data);
          data.avatar = `data:image/jpeg;base64,${base64Avatar}`;
        }
        setProfile(data);
      } catch (err) {
        setError("Failed to fetch profile data.");
        console.log(err);
      }
    };

    fetchProfile();
  }, []);

  const renderSkeletonLoader = () => (
    <div className="profile-container">
      <div className="profile-card shadow rounded">
        <h2 className="profile-title text-center mb-4">Profile Overview</h2>
        <div className="skeleton-loader">
          <div className="skeleton-avatar mb-4"></div>
          <div className="skeleton-line mb-3"></div>
          <div className="skeleton-line mb-3"></div>
          <hr />
          <div className="skeleton-detail-row mb-3"></div>
          <div className="skeleton-detail-row mb-3"></div>
          <div className="skeleton-detail-row"></div>
          <div className="row mt-4">
            <div className="col-12 col-md-6 mb-2 mb-md-0">
              <div className="skeleton-button"></div>
            </div>
            <div className="col-12 col-md-6">
              <div className="skeleton-button"></div>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-12">
              <div className="skeleton-button-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="profile-container">
        <h2 className="profile-title">Profile Overview</h2>
        <p className="text-danger text-center">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return renderSkeletonLoader();
  }

  return (
    <div className="profile-container">
      <div className="profile-card shadow rounded">
        <h2 className="profile-title text-center mb-4">Profile Overview</h2>
        <div className="text-center">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt="Profile"
              className="rounded-circle profile-image"
            />
          ) : (
            <div className="initials-circle">
              <span className="initials-text">
                {`${profile.firstName?.[0] || ""}${
                  profile.lastName?.[0] || ""
                }`.toUpperCase()}
              </span>
            </div>
          )}
          <h3 className="mt-3">{`${profile.firstName} ${profile.lastName}`}</h3>
          <p className="text-muted">{profile.bio || "No bio available"}</p>
        </div>
        <hr />
        <div className="profile-details mt-4">
          <div className="detail-row">
            <strong className="detail-label">Email:</strong>
            <span className="detail-value">{profile.email}</span>
          </div>
          <div className="detail-row">
            <strong className="detail-label">Phone:</strong>
            <span className="detail-value">
              {profile.phoneNumber || "Not provided"}
            </span>
          </div>
          <div className="detail-row">
            <strong className="detail-label">Date of Birth:</strong>
            <span className="detail-value">
              {profile.dob ? convertDateToWords(profile.dob) : "Not provided"}
            </span>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12 col-md-6 mb-2 mb-md-0">
            <button
              className="btn btn-secondary w-100"
              onClick={() => navigate("/change-password")}
            >
              Change Password
            </button>
          </div>
          <div className="col-12 col-md-6">
            <button
              className="btn btn-black w-100"
              onClick={() => navigate("/edit-profile")}
            >
              Edit Profile
            </button>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12">
            <button
              className="btn btn-outline-danger w-100 btn-lg"
              onClick={() => {
                logoutClicked();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <ConfirmationModal
        show={showLogoutModal}
        title="Logout"
        message="Are you sure you want to log out?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
};

export default ProfileOverview;
