import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../../services/api";
import Cropper from "react-easy-crop";
import { useAuth } from "../../context/AuthContext";
import "./EditProfile.css";

const EditProfile = () => {
  const [profile, setProfile] = useState(null);
  const [newAvatar, setNewAvatar] = useState(null);
  const [newAvatarUrl, setNewAvatarUrl] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
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

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  };

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
      const url = URL.createObjectURL(file);
      setNewAvatarUrl(url);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profile) {
      setError("No profile data available.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    if (newAvatar && croppedAreaPixels) {
      try {
        const croppedBlob = await getCroppedImg(
          newAvatarUrl,
          croppedAreaPixels,
          rotation
        );
        const croppedFile = new File([croppedBlob], newAvatar.name, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        formData.append("avatar", croppedFile);
        await appendProfileData(formData);
      } catch (error) {
        setError("Failed to crop image: " + error.message);
        setIsLoading(false);
      }
    } else {
      await appendProfileData(formData);
    }
  };

  const appendProfileData = async (formData) => {
    formData.append("firstName", profile.firstName);
    formData.append("lastName", profile.lastName);
    formData.append("phoneNumber", profile.phoneNumber);
    formData.append("dob", profile.dob);
    formData.append("bio", profile.bio || "");
    formData.append("timezone", profile.timezone || "UTC");

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
          {newAvatar ? (
            <div className="crop-container mb-4">
              <div className="crop-area" style={{ position: "relative", height: "400px" }}>
                <Cropper
                  image={newAvatarUrl}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="image-controls mb-4 mt-3">
                <div className="control-group">
                  <label htmlFor="zoomRange">Zoom:</label>
                  <input
                    type="range"
                    id="zoomRange"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
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
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-secondary mt-2"
                  onClick={() => {
                    setNewAvatar(null);
                    setNewAvatarUrl(null);
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                    setRotation(0);
                  }}
                >
                  Cancel Crop
                </button>
              </div>
            </div>
          ) : (
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

          {/* Timezone Selector */}
          <div className="form-group mb-3">
            <label htmlFor="timezone" className="form-label">
              <i className="bi bi-globe me-2"></i>
              Timezone
            </label>
            <select
              className="form-control"
              id="timezone"
              name="timezone"
              value={profile.timezone || "UTC"}
              onChange={handleChange}
            >
              <optgroup label="Common Timezones">
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              </optgroup>
              <optgroup label="Americas">
                <option value="America/Anchorage">Alaska</option>
                <option value="America/Phoenix">Arizona</option>
                <option value="America/Toronto">Toronto</option>
                <option value="America/Vancouver">Vancouver</option>
                <option value="America/Sao_Paulo">São Paulo</option>
                <option value="America/Buenos_Aires">Buenos Aires</option>
                <option value="America/Mexico_City">Mexico City</option>
              </optgroup>
              <optgroup label="Europe & Africa">
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Europe/Berlin">Berlin</option>
                <option value="Europe/Rome">Rome</option>
                <option value="Europe/Madrid">Madrid</option>
                <option value="Europe/Moscow">Moscow</option>
                <option value="Africa/Cairo">Cairo</option>
                <option value="Africa/Johannesburg">Johannesburg</option>
              </optgroup>
              <optgroup label="Asia">
                <option value="Asia/Dubai">Dubai</option>
                <option value="Asia/Kolkata">India (Kolkata)</option>
                <option value="Asia/Bangkok">Bangkok</option>
                <option value="Asia/Singapore">Singapore</option>
                <option value="Asia/Shanghai">China (Shanghai)</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Asia/Seoul">Seoul</option>
                <option value="Asia/Hong_Kong">Hong Kong</option>
              </optgroup>
              <optgroup label="Australia & Pacific">
                <option value="Australia/Sydney">Sydney</option>
                <option value="Australia/Melbourne">Melbourne</option>
                <option value="Australia/Perth">Perth</option>
                <option value="Pacific/Auckland">Auckland</option>
                <option value="Pacific/Fiji">Fiji</option>
              </optgroup>
            </select>
            <small className="form-text text-muted">
              Your timezone is used for task deadline reminders via email
            </small>
          </div>
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
