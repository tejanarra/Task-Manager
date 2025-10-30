import "./FormInput.css";

/**
 * Reusable form input component
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {string} id - Input ID
 * @param {string} name - Input name
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether field is required
 * @param {string} className - Additional CSS classes
 * @param {string} label - Label text (optional)
 * @param {string} error - Error message (optional)
 * @param {boolean} disabled - Whether input is disabled
 * @param {Object} rest - Other HTML input attributes
 */
const FormInput = ({
  type = "text",
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  label,
  error,
  disabled = false,
  ...rest
}) => {
  return (
    <div className="form-input-wrapper mb-3">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`form-control py-2 ${error ? "is-invalid" : ""} ${className}`}
        {...rest}
      />
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};

export default FormInput;
