import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../services/api";
import { resizeImage } from "../utils/imageUtils";
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
        if (!data) throw new Error("Received no data");
        // No need to convert avatar data here as it's now a URL
        setProfile(data);
      } catch (err) {
        setError(
          `Failed to fetch profile data: ${err.message || err.toString()}`
        );
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (profile) {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      resizeImage(file, 800, 800, (resizedBlob) => {
        const resizedFile = new File([resizedBlob], file.name, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        setNewAvatar(resizedFile);
        const reader = new FileReader();
        reader.onload = () => {
          if (profile) {
            setProfile((prev) => ({ ...prev, avatar: reader.result }));
          }
        };
        reader.readAsDataURL(resizedFile);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profile) {
      setError("No profile data available.");
      return;
    }

    const formData = new FormData();
    if (newAvatar) {
      formData.append("avatar", newAvatar);
    }

    formData.append("firstName", profile.firstName);
    formData.append("lastName", profile.lastName);
    formData.append("phoneNumber", profile.phoneNumber);
    formData.append("dob", profile.dob);
    formData.append("bio", profile.bio || "");

    try {
      const response = await updateProfile(formData);
      setProfile(response.user);
      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate("/profile-overview"), 1000);
    } catch (err) {
      setError("Failed to update profile.");
      console.error(err);
    }
  };

  if (!profile && !error) {
    return (
      <div className="profile-container">
        <div>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <h2 className="profile-title">Edit Profile</h2>
        <p className="text-danger text-center">{error}</p>
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
                  type="text"
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
