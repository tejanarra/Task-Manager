import React from "react";
import "./ProfileCard.css";

/**
 * Reusable profile card container
 * @param {string} title - Card title
 * @param {ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 */
const ProfileCard = ({ title, children, className = "" }) => {
  return (
    <div className="profile-container">
      <div className={`profile-card shadow rounded ${className}`}>
        {title && <h2 className="profile-title text-center mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default ProfileCard;
