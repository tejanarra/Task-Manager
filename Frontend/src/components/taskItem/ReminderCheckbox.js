import React from "react";

const ReminderCheckbox = ({ checked, onChange, label }) => (
  <label className="reminder-checkbox-label d-inline-flex align-items-center">
    <input
      type="checkbox"
      className="form-check-input me-2"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span>{label}</span>
  </label>
);

export default ReminderCheckbox;
