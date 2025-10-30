import "./Styles/ReminderCheckbox.css";

const ReminderCheckbox = ({
  value,
  label,
  checked,
  onChange,
  className = "",
  disabled = false,
}) => (
  <div className={`d-inline-block ${className}`}>
    <label
      className={`reminder-checkbox-label d-inline-flex align-items-center ${
        disabled ? "disabled" : ""
      }`}
    >
      <input
        type="checkbox"
        className="form-check-input me-2"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        aria-label={`Set reminder for ${label}`}
        aria-describedby={`reminder-${value}-desc`}
      />
      <span id={`reminder-${value}-desc`}>{label}</span>
    </label>
  </div>
);

export default ReminderCheckbox;
