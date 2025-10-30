import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../services/api";
import "../profile/ProfileOverview.css";
import "../profile/EditProfile.css";
import { useAuth } from "../../context/AuthContext";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = formData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess("Password changed successfully!");
      setError("");
      setTimeout(() => navigate("/profile-overview"), 2000);
    } catch (err) {
      console.error(
        "Password change error:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          "Failed to change password. Please try again."
      );
      setSuccess("");

      if (err && err.status === 403) {
        logout();
        navigate("/login");
      }
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card shadow rounded">
        <h2 className="profile-title text-center mb-4 bold-text">
          Change Password
        </h2>
        {success && <p className="text-success text-center">{success}</p>}
        {error && <p className="text-danger text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="currentPassword" className="form-label">
              Current Password
            </label>
            <input
              type="password"
              className="form-control"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <input
              type="password"
              className="form-control"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="confirmNewPassword" className="form-label">
              Confirm New Password
            </label>
            <input
              type="password"
              className="form-control"
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="row mt-4">
            <div className="col-12 col-md-6 mb-2 mb-md-0">
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={() => navigate("/profile-overview")}
              >
                Cancel
              </button>
            </div>
            <div className="col-12 col-md-6">
              <button type="submit" className="btn btn-dark w-100">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
