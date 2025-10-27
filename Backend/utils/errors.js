const errors = {
  AUTH: {
    MISSING_FIELDS: {
      code: "AUTH001",
      message: "Required fields are missing.",
    },
    USER_NOT_FOUND: { code: "AUTH002", message: "Invalid email or password." },
    USER_ALREADY_EXISTS: {
      code: "AUTH003",
      message: "User already exists with this email.",
    },
    INVALID_VERIFICATION_CODE: {
      code: "AUTH004",
      message: "Invalid or expired verification code.",
    },
    USER_NOT_VERIFIED: {
      code: "AUTH005",
      message: "Email is not verified. Please verify to continue.",
    },
    INVALID_CREDENTIALS: {
      code: "AUTH006",
      message: "Invalid email or password.",
    },
  },
  PASSWORD: {
    MISSING_EMAIL: { code: "PWD001", message: "Email is required." },
    VERIFICATION_SENT: {
      code: "PWD002",
      message: "Verification code sent if account exists.",
    },
    PASSWORD_RESET_SUCCESS: {
      code: "PWD003",
      message: "Password reset successful.",
    },
  },
  REGISTRATION: {
    MISSING_FIELDS: {
      code: "REG001",
      message: "First, last name, email and password are required.",
    },
    VERIFICATION_SENT: {
      code: "REG002",
      message: "Verification code has been emailed.",
    },
    REGISTRATION_SUCCESS: {
      code: "REG003",
      message: "Account verified successfully.",
    },
    VERIFICATION_RESENT: {
      code: "REG004",
      message: "New verification code sent.",
    },
    MISSING_VERIFICATION_DATA: {
      code: "REG005",
      message: "Email & code required.",
    },
  },
  SERVER: {
    ERROR: {
      code: "SRV001",
      message: "Unexpected server error.",
    },
  },
};

export default errors;
