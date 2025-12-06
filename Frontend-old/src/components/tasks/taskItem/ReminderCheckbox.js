import "./Styles/ReminderCheckbox.css";

const ReminderCheckbox = ({
  value,
  label,
  checked,
  onChange,
  className = "",
  disabled = false,
}) => (
  <div className={`reminder-checkbox-wrapper ${className}`}>
    <label
      className={`reminder-checkbox-label ${checked ? "checked" : ""} ${
        disabled ? "disabled" : ""
      }`}
    >
      {/* ✅ FIXED: Removed duplicate form-check-input, using only custom checkbox */}
      <input
        type="checkbox"
        className="reminder-checkbox-input"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        aria-label={`Set reminder for ${label}`}
        aria-describedby={`reminder-${value}-desc`}
      />
      <div className="reminder-checkbox-custom"></div>
      <span className="reminder-checkbox-text" id={`reminder-${value}-desc`}>
        {label}
      </span>
    </label>
  </div>
);

export default ReminderCheckbox;
