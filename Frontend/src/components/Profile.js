import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/Profile.css"; // Import custom CSS

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [avatar, setAvatar] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setBio(data.bio || "");
        setPhoneNumber(data.phoneNumber || "");
        setDob(data.dob || "");
      } catch (err) {
        setError("Failed to fetch profile data.");
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("phoneNumber", phoneNumber);
    formData.append("dob", dob);
    formData.append("bio", bio);

    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      await updateProfile(formData);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="profile-title mb-4" style={{ fontFamily: "Poppins", fontWeight: "600" }}>
        Your Profile
      </h2>

      {/* Error Alert */}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row justify-content-center">
        {/* Left Section: Avatar and Bio */}
        <div className="col-12 col-md-5 mb-4">
          <div className="card p-4 shadow-sm profile-card">
            {/* Avatar */}
            <div
              className="avatar-wrapper mb-4 text-center"
              onClick={() => document.getElementById("avatar-upload").click()}
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar || "/default-avatar.png"}
                  alt="User Avatar"
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName[0]}${profile.lastName[0]}`
                    : "N/A"}
                </div>
              )}
            </div>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />

            {/* Bio */}
            <div className="w-100">
              <label htmlFor="bio-textarea" className="form-label">
                Bio
              </label>
              <textarea
                id="bio-textarea"
                className="form-control"
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ resize: "none" }}
              />
            </div>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="col-12 col-md-5 mb-4">
          <div className="card p-4 shadow-sm profile-card">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={profile.email}
                  readOnly
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;