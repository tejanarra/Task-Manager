// Error Messages and Codes
// Centralized error responses for consistent API responses

const errors = {
  AUTH: {
    MISSING_FIELDS: {
      code: 'AUTH001',
      message: 'Required fields are missing.',
    },
    USER_NOT_FOUND: {
      code: 'AUTH002',
      message: 'Invalid email or password.'
    },
    USER_ALREADY_EXISTS: {
      code: 'AUTH003',
      message: 'User already exists with this email or username.',
    },
    INVALID_VERIFICATION_CODE: {
      code: 'AUTH004',
      message: 'Invalid or expired verification code.',
    },
    USER_NOT_VERIFIED: {
      code: 'AUTH005',
      message: 'User is not verified. Please verify your account before logging in.',
    },
    INVALID_CREDENTIALS: {
      code: 'AUTH006',
      message: 'Invalid email or password.',
    },
  },
  PASSWORD: {
    MISSING_EMAIL: {
      code: 'PWD001',
      message: 'Email is required.'
    },
    VERIFICATION_SENT: {
      code: 'PWD002',
      message: 'Verification code sent. Please check your inbox.',
    },
    PASSWORD_RESET_SUCCESS: {
      code: 'PWD003',
      message: 'Password successfully reset.',
    },
  },
  REGISTRATION: {
    MISSING_FIELDS: {
      code: 'REG001',
      message: 'First name, last name, email, and password are required.',
    },
    VERIFICATION_SENT: {
      code: 'REG002',
      message: 'A verification code has been sent to your email. Please verify to complete the registration.',
    },
    REGISTRATION_SUCCESS: {
      code: 'REG003',
      message: 'Registration successful. You can now log in.',
    },
    VERIFICATION_RESENT: {
      code: 'REG004',
      message: 'A new verification code has been sent to your email.',
    },
    MISSING_VERIFICATION_DATA: {
      code: 'REG005',
      message: 'Email and verification code are required to verify your registration.',
    },
  },
  CONTACT: {
    MISSING_FIELDS: {
      code: 'CNT001',
      message: 'All fields (name, email, subject, message) are required.',
    },
    MESSAGE_SENT: {
      code: 'CNT002',
      message: 'Your message has been sent successfully. We will get back to you soon.',
    },
  },
  SERVER: {
    ERROR: {
      code: 'SRV001',
      message: 'An unexpected server error occurred. Please try again later.',
    },
    EMAIL_SEND_FAILURE: {
      code: 'SRV002',
      message: 'Failed to send email. Please try again later.',
    },
  },
};

export default errors;
