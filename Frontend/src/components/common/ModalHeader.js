import React from "react";
import "./ModalHeader.css";

/**
 * Reusable modal header component
 * @param {string} title - Modal title
 * @param {function} onClose - Close handler
 * @param {string} className - Additional CSS classes
 */
const ModalHeader = ({ title, onClose, className = "" }) => {
  return (
    <div className={`modal-header-custom ${className}`}>
      <h5 className="modal-title-custom fw-bold">{title}</h5>
      {onClose && (
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};

export default ModalHeader;
