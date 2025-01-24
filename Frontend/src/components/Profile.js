import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../services/api";
import { Camera } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/Profile.css";

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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
      setIsSaved(true);
      setIsEditing(false);
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setIsSaved(false); // Reset saved status when going back to edit mode
    }
  };

  return (
    <div className="profile-page container my-5">
      {/* Header Row */}
      <div className="row mb-4 align-items-center">
        <div className="col-6 col-md-8">
          <h2 className="profile-heading">Profile Settings</h2>
        </div>
        <div className="col-6 col-md-4 text-end">
          <button className="btn btn-outline-primary" onClick={toggleEditMode}>
            {isEditing ? "View Mode" : "Edit Mode"}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* Success Alert */}
      {isSaved && (
        <div className="alert alert-success mt-3">
          Profile updated successfully!
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="profile-form row g-4">
        {/* Left Column: Avatar & Bio */}
        <div className="left-container col-12 col-md-4">
          {/* Avatar */}
          <div className="avatar-upload-container mx-auto mb-3">
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleAvatarChange}
              disabled={!isEditing}
            />
            <label htmlFor="avatar-upload" className="avatar-upload-label">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="User Avatar"
                  className="avatar-img"
                />
              ) : (
                <div className="avatar-placeholder">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName[0]}${profile.lastName[0]}`
                    : "N/A"}
                </div>
              )}
              {/* Overlay Icon only in edit mode */}
              {isEditing && (
                <div className="upload-icon">
                  <Camera size={24} />
                </div>
              )}
            </label>
          </div>

          {/* Bio */}
          {isEditing ? (
            <textarea
              className="form-control bio-textarea"
              placeholder="Tell us about yourself..."
              rows="6"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            ></textarea>
          ) : (
            <div className="bio-view">{bio || "No bio available."}</div>
          )}
        </div>

        {/* Right Column: Fields */}
        <div className="col-12 col-md-8 d-flex flex-column">
          <div className="mb-3">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!isEditing}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={!isEditing}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={profile.email || ""}
              disabled={true}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-control"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              disabled={!isEditing}
            />
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="d-grid gap-2 mt-auto">
              <button
                type="submit"
                className="btn btn-outline-success"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Profile;
