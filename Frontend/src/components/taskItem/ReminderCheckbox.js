import React from "react";

const ReminderCheckbox = ({ value, label, checked, onChange }) => (
  <div className="d-inline-block">
    <label className="reminder-checkbox-label d-inline-flex align-items-center">
      <input
        type="checkbox"
        className="form-check-input me-2"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  </div>
);

export default ReminderCheckbox;