import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/ConfirmationModal.css";

const ConfirmationModal = ({
  show,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  onConfirm,
  onCancel,
}) => {
  if (!show) return null;

  return (
    <div
      className="custom-modal-overlay d-flex align-items-center justify-content-center"
      tabIndex="-1"
      role="dialog"
      onClick={onCancel}
    >
      <div
        className="custom-modal-content"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="custom-modal-header">
          <h5 className="modal-title fw-bold">{title}</h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onCancel}
          ></button>
        </div>
        <div className="custom-modal-body">
          <p className="text-muted">{message}</p>
        </div>
        <div className="custom-modal-footer d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="button" className="btn btn-black" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
