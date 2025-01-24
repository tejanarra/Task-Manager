import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, uploadAvatar } from "../services/api";
import "../Styles/EditProfile.css";

const EditProfile = () => {
  const [profile, setProfile] = useState(null);
  const [newAvatar, setNewAvatar] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        setError("Failed to fetch profile data.");
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatar(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfile((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedProfile = { ...profile };

    try {
      if (newAvatar) {
        const formData = new FormData();
        formData.append("avatar", newAvatar);
        const uploadedAvatarUrl = await uploadAvatar(formData);
        updatedProfile.avatar = uploadedAvatarUrl;
      }

      await updateProfile(updatedProfile);
      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate("/profile-overview"), 2000);
    } catch (err) {
      setError("Failed to update profile.");
    }
  };

  if (error) {
    return (
      <div className="profile-container">
        <h2 className="profile-title">Edit Profile</h2>
        <p className="text-danger text-center">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="profile-card shadow rounded">
          <h2 className="profile-title text-center mb-4">Edit Profile</h2>
          <div className="skeleton-loader">
            <div className="skeleton-avatar mb-4"></div>
            <div className="skeleton-input mb-3"></div>
            <div className="skeleton-input mb-3"></div>
            <div className="skeleton-input mb-3"></div>
            <div className="skeleton-input mb-3"></div>
            <div className="row mt-4">
              <div className="col-12 col-md-6 mb-2 mb-md-0">
                <div className="skeleton-button"></div>
              </div>
              <div className="col-12 col-md-6">
                <div className="skeleton-button"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card shadow rounded">
        <h2 className="profile-title text-center mb-4">Edit Profile</h2>
        {success && <p className="text-success text-center">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="text-center mb-4">
            <label htmlFor="avatarUpload" className="profile-image-preview">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="rounded-circle"
                />
              ) : (
                <div className="placeholder-avatar">
                  {profile.firstName[0]?.toUpperCase() || ""}
                  {profile.lastName[0]?.toUpperCase() || ""}
                </div>
              )}
            </label>
            <input
              type="file"
              id="avatarUpload"
              accept="image/*"
              onChange={handleImageChange}
              className="d-none"
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="firstName" className="form-label">
              First Name
            </label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="lastName" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              className="form-control"
              id="lastName"
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="phoneNumber" className="form-label">
              Phone Number
            </label>
            <input
              type="text"
              className="form-control"
              id="phoneNumber"
              name="phoneNumber"
              value={profile.phoneNumber}
              onChange={handleChange}
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="dob" className="form-label">
              Date of Birth
            </label>
            <input
              type="date"
              className="form-control"
              id="dob"
              name="dob"
              value={profile.dob}
              onChange={handleChange}
            />
          </div>
          <div className="row mt-4">
            <div className="col-12 col-md-6 mb-2 mb-md-0">
              <button type="submit" className="btn btn-outline-success w-100">
                Save Changes
              </button>
            </div>
            <div className="col-12 col-md-6">
              <button
                type="button"
                className="btn btn-outline-danger w-100"
                onClick={() => navigate("/profile-overview")}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
