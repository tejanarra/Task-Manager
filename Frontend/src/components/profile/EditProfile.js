import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../../services/api";
import AvatarEditor from "react-avatar-editor";
import { useAuth } from "../../context/AuthContext";
import "./EditProfile.css";
import { AlertBanner, LoadingButton, ProfileCard } from "../common";
import { useApiError, useLoading, useAuthCheck } from "../../hooks";
import { SUCCESS_MESSAGES, AVATAR_CONFIG } from "../../constants/appConstants";

const EditProfile = () => {
  const [profile, setProfile] = useState(null);
  const [newAvatar, setNewAvatar] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        if (!data) throw new Error("Received no data");
        setProfile(data);
      } catch (err) {
        setError(
          `Failed to fetch profile data: ${err.message || err.toString()}`
        );
        if (err && err.status === 403) {
          logout();
          navigate("/login");
        }
      }
    };

    fetchProfile();
  }, [logout, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (profile) {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatar(file);
      setScale(1);
      setRotate(0);
    }
  };

  const handleScaleChange = (e) => {
    const scaleValue = parseFloat(e.target.value);
    setScale(scaleValue);
  };

  const handleRotateChange = (e) => {
    const rotateValue = parseInt(e.target.value, 10);
    setRotate(rotateValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profile) {
      setError("No profile data available.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    if (newAvatar && editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      canvas.toBlob(async (blob) => {
        const croppedFile = new File([blob], newAvatar.name, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        formData.append("avatar", croppedFile);
        appendProfileData(formData);
      }, "image/jpeg");
    } else {
      appendProfileData(formData);
    }
  };

  const appendProfileData = async (formData) => {
    formData.append("firstName", profile.firstName);
    formData.append("lastName", profile.lastName);
    formData.append("phoneNumber", profile.phoneNumber);
    formData.append("dob", profile.dob);
    formData.append("bio", profile.bio || "");

    try {
      const response = await updateProfile(formData);
      setProfile(response.user);
      setSuccess("Profile updated successfully!");
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      userInfo.avatar = response.user.avatar;
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      setTimeout(() => navigate("/profile-overview"), 2000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => navigate("/profile-overview"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile && !error) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading profile...</div>
        {navigate("/login")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container flex-column">
        <h2 className="profile-title">Edit Profile</h2>
        {error && <div className="alert alert-danger">{error}</div>}
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card shadow rounded">
        <h2 className="profile-title text-center mb-4">Edit Profile</h2>
        {isLoading && <div className="loading-overlay">Updating...</div>}
        <form onSubmit={handleSubmit}>
          <div className="text-center mb-4">
            <label htmlFor="avatarUpload" className="profile-image-preview">
              {newAvatar ? (
                <AvatarEditor
                  ref={editorRef}
                  image={newAvatar}
                  width={250}
                  height={250}
                  border={25}
                  borderRadius={125}
                  color={[255, 255, 255, 0.6]}
                  scale={scale}
                  rotate={rotate}
                  className="avatar-editor"
                />
              ) : profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="rounded-circle profile-image"
                />
              ) : (
                <div className="placeholder-avatar">
                  {profile ? (
                    <>
                      {profile.firstName && profile.firstName[0]
                        ? profile.firstName[0].toUpperCase()
                        : ""}
                      {profile.lastName && profile.lastName[0]
                        ? profile.lastName[0].toUpperCase()
                        : ""}
                    </>
                  ) : null}
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
          {newAvatar && (
            <div className="image-controls mb-4">
              <div className="control-group">
                <label htmlFor="zoomRange">Zoom:</label>
                <input
                  type="range"
                  id="zoomRange"
                  min="1"
                  max="2"
                  step="0.01"
                  value={scale}
                  onChange={handleScaleChange}
                />
              </div>
              <div className="control-group">
                <label htmlFor="rotateRange">Rotate:</label>
                <input
                  type="range"
                  id="rotateRange"
                  min="0"
                  max="360"
                  step="1"
                  value={rotate}
                  onChange={handleRotateChange}
                />
              </div>
            </div>
          )}
          {Object.entries({
            firstName: "First Name",
            lastName: "Last Name",
            phoneNumber: "Phone Number",
            dob: "Date of Birth",
            bio: "Bio",
          }).map(([key, label]) => (
            <div key={key} className="form-group mb-3">
              <label htmlFor={key} className="form-label">
                {label}
              </label>
              {key === "bio" ? (
                <textarea
                  className="form-control"
                  id={key}
                  name={key}
                  value={profile[key] || ""}
                  onChange={handleChange}
                  placeholder={`Enter your ${label.toLowerCase()}...`}
                  rows="4"
                />
              ) : (
                <input
                  type={key === "dob" ? "date" : "text"}
                  className="form-control"
                  id={key}
                  name={key}
                  value={profile[key] || ""}
                  onChange={handleChange}
                  placeholder={`Enter your ${label.toLowerCase()}...`}
                  required={key !== "bio" && key !== "phoneNumber"}
                />
              )}
            </div>
          ))}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="row mt-4">
            <div className="col-12 col-md-6 mb-2 mb-md-0">
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={() => navigate("/profile-overview")}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
            <div className="col-12 col-md-6">
              <button
                type="submit"
                className="btn sign-in-btn w-100"
                disabled={isLoading}
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
