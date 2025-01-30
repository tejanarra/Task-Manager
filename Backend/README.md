Task Manager Application

A comprehensive, production-ready Task Manager application built with Node.js, Express, Sequelize, PostgreSQL, and Cloudinary (for image uploads). It includes user authentication (JWT-based), email verification, password reset, profile management (including avatar image uploads), task creation & management with deadline reminders (via cron jobs), and a contact form.

This document outlines the installation, configuration, API usage (with request/response examples), error handling, and more.

Table of Contents
	1.	Features
	2.	Tech Stack
	3.	Project Structure
	4.	Prerequisites
	5.	Installation
	6.	Environment Variables
	7.	Database Setup
	8.	Running the Application
	9.	API Endpoints & Usage
	•	Authentication Routes
	•	Task Routes
	•	Profile Routes
	•	Protected Routes
	10.	Cron Jobs
	11.	Error Handling
	12.	Error / Success Codes
	13.	Example Request & Response
	14.	Code Explanation
	15.	Useful Commands
	16.	License

Features
	•	User Registration & Verification
Users must verify their email to activate the account.
	•	User Login
JWT-based authentication.
	•	Password Reset
Includes sending verification codes via email for resetting passwords.
	•	Profile Management
Users can update profile details and upload avatars/images (via Cloudinary).
	•	Task Management
Create, read, update, and delete tasks with priority-based ordering.
	•	Task Reminders
Scheduled email reminders for tasks nearing their deadlines (every minute check by cron).
	•	Contact Form
Users can send messages or inquiries to the admin/developer email.
	•	Cloudinary Integration
For storing user avatar images.
	•	PostgreSQL Database
ORM using Sequelize.

Tech Stack
	•	Node.js (JavaScript runtime)
	•	Express (Web framework)
	•	Sequelize (ORM for database interactions)
	•	PostgreSQL (Relational database)
	•	Cloudinary (Image hosting and transformations)
	•	Nodemailer (Email sending)
	•	JWT (Token-based authentication)
	•	Cron (Scheduled tasks)

Project Structure

├── config
│   ├── cloudinary.js         # Cloudinary configuration
│   ├── db.js                 # Sequelize DB configuration
│   └── config.js             # Centralized configuration & environment variables
├── controllers
│   ├── authController.js     # Handles auth-related logic (registration, login, etc.)
│   ├── profileController.js  # Handles profile retrieval & updates
│   └── taskController.js     # Handles task CRUD operations
├── middleware
│   └── authMiddleware.js     # JWT authentication middleware
├── models
│   ├── Task.js               # Task model (Sequelize)
│   └── User.js               # User model (Sequelize)
├── routes
│   ├── authRoutes.js         # Authentication routes
│   ├── profileRoutes.js      # Profile routes
│   └── taskRoutes.js         # Task routes
├── utils
│   ├── cronJobs.js           # Sets up & runs scheduled tasks
│   ├── errors.js             # Centralized error codes & messages
│   └── mailer.js             # Nodemailer email logic
├── .env                      # Environment variables file (not committed)
├── package.json
├── README.md
└── server.js                 # Main server entry point

Prerequisites
	1.	Node.js (v14+ recommended)
	2.	npm or yarn (Package manager)
	3.	PostgreSQL (Database installed locally or accessible remotely)
	4.	Cloudinary account (for storing images)
	5.	Email account for sending emails (e.g., Gmail credentials)

Installation
	1.	Clone the repository:

git clone https://github.com/tejanarra/Task-Manager.git
cd backend


	2.	Install dependencies:

npm install

or

yarn install

Environment Variables

Create a file named .env in the project root (same level as server.js), and populate it with:

# Server
PORT=5001

# Database
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=1h  # e.g., "2h", "7d"

# Email (Nodemailer)
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

# Contact Form Receiver Email
CONTACT_FORM_RECEIVER_EMAIL=admin@example.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

	Warning: Never commit your .env to a public repository.

Database Setup
	1.	Create a PostgreSQL database named whatever is in DB_NAME. For example:

createdb your_database_name


	2.	Update your .env with the correct database credentials.
	3.	The application uses Sequelize to automatically create or synchronize tables on server startup. If needed, you can use migrations separately or rely on sequelize.sync().

Running the Application
	1.	Start the server:

npm start

or

yarn start


	2.	Access logs:
You should see in the console:
	•	Database synced successfully. if everything is correct.
	•	Server is running on port 5001 (or your specified port).
	3.	Verify:
Go to http://localhost:5001/ (or your deployed URL) to confirm the server is working.

API Endpoints & Usage

All endpoints begin with the prefix /api. Below you’ll find the primary routes grouped by functionality.

	For protected routes, include a valid JWT in the Authorization header as Bearer <token>.

Authentication Routes
	1.	Register
Endpoint: POST /api/auth/register
Description: Registers a new user. A verification code is sent to the provided email.
Request Body:

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}

Response (Success, 200):

{
  "code": "REG002",
  "message": "A verification code has been sent to your email..."
}

Example Error (400):

{
  "code": "REG001",
  "message": "First name, last name, email, and password are required."
}


	2.	Resend Verification Email
Endpoint: POST /api/auth/resend-verification
Request Body:

{
  "email": "john.doe@example.com"
}

Response (Success, 200):

{
  "code": "REG004",
  "message": "A new verification code has been sent to your email."
}


	3.	Verify Registration
Endpoint: POST /api/auth/verify-registration
Description: Confirms user email by matching a code. After success, user is verified.
Request Body:

{
  "email": "john.doe@example.com",
  "verificationCode": "123456"
}

Response (Success, 200):

{
  "code": "REG006",
  "message": "Registration successful. You can now log in.",
  "token": "<JWT token>",
  "userInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  }
}

Example Error (400):

{
  "code": "AUTH004",
  "message": "Invalid or expired verification code."
}


	4.	Login
Endpoint: POST /api/auth/login
Description: Logs in a user and returns a JWT token.
Request Body:

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}

Response (Success, 200):

{
  "code": "AUTH008",
  "message": "Login successful.",
  "token": "<JWT token>",
  "userInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "avatar": null
  }
}

Example Error (400):

{
  "code": "AUTH006",
  "message": "Invalid email or password."
}


	5.	Forgot Password
Endpoint: POST /api/auth/forgot-password
Description: Sends a password reset verification code to the user’s email.
Request Body:

{
  "email": "john.doe@example.com"
}

Response (Success, 200):

{
  "code": "PWD002",
  "message": "Verification code sent. Please check your inbox."
}


	6.	Verify Code & Reset Password
Endpoint: POST /api/auth/verify-code
Description: Verifies the code sent to the user’s email and updates the password.
Request Body:

{
  "email": "john.doe@example.com",
  "verificationCode": "123456",
  "newPassword": "NewSecurePassword"
}

Response (Success, 200):

{
  "code": "PWD005",
  "message": "Password successfully reset. You can now log in..."
}

Example Error (400):

{
  "code": "AUTH004",
  "message": "Invalid or expired verification code."
}


	7.	Contact Form
Endpoint: POST /api/auth/contact
Description: Sends an email to the admin from a contact form.
Request Body:

{
  "yourName": "John Doe",
  "yourEmail": "john.doe@example.com",
  "subject": "Inquiry",
  "message": "Hello, I have a question..."
}

Response (Success, 200):

{
  "code": "CNT004",
  "message": "Your message has been sent successfully. We will get back..."
}

Example Error (400):

{
  "code": "CNT003",
  "message": "All fields (name, email, subject, message) are required."
}


	8.	Change Password
Endpoint: POST /api/auth/change-password
Protected (requires Authorization header with Bearer token)
Request Body:

{
  "currentPassword": "SecurePassword123",
  "newPassword": "AnotherSecurePassword"
}

Response (Success, 200):

{
  "code": "PWD004",
  "message": "Password updated successfully."
}

Example Error (400):

{
  "code": "PWD003",
  "message": "Current password is incorrect."
}

Task Routes

	All Task routes require an authenticated user. Provide the token in the Authorization header as Bearer <token>.

	1.	Create Task
Endpoint: POST /api/tasks
Request Body:

{
  "title": "My Task",
  "description": "Some details about the task",
  "status": "not-started",
  "deadline": "2025-01-31T23:59:59.999Z"
}

Response (Success, 201):

{
  "id": 1,
  "title": "My Task",
  "description": "Some details about the task",
  "status": "not-started",
  "userId": 123,
  "priority": 1,
  "deadline": "2025-01-31T23:59:59.999Z",
  "reminderSent": false,
  "updatedAt": "2025-01-29T12:00:00.000Z",
  "createdAt": "2025-01-29T12:00:00.000Z"
}

Example Error (400):

{
  "message": "Missing required fields (title, description, status)"
}


	2.	Get All Tasks
Endpoint: GET /api/tasks
Response (Success, 200):

[
  {
    "id": 1,
    "title": "My Task",
    "description": "Some details about the task",
    "status": "not-started",
    "userId": 123,
    "priority": 1,
    "deadline": "2025-01-31T23:59:59.999Z",
    "reminderSent": false,
    "createdAt": "2025-01-29T12:00:00.000Z",
    "updatedAt": "2025-01-29T12:00:00.000Z"
  },
  {
    "id": 2,
    ...
  }
]


	3.	Get Task By ID
Endpoint: GET /api/tasks/:taskId
Example: GET /api/tasks/1
Response (Success, 200):

{
  "id": 1,
  "title": "My Task",
  "description": "Some details about the task",
  "status": "not-started",
  ...
}

Example Error (404):

{
  "message": "Task not found"
}


	4.	Update Task
Endpoint: PUT /api/tasks/:taskId
Request Body (only include fields to update):

{
  "title": "Updated Task Title",
  "description": "Updated details",
  "status": "in-progress",
  "deadline": "2025-02-01T10:00:00.000Z"
}

Response (Success, 200):

{
  "id": 1,
  "title": "Updated Task Title",
  "description": "Updated details",
  "status": "in-progress",
  "deadline": "2025-02-01T10:00:00.000Z",
  "reminderSent": false,
  ...
}


	5.	Delete Task
Endpoint: DELETE /api/tasks/:taskId
Response (Success, 200):

{
  "message": "Task deleted successfully and priorities updated."
}

Example Error (404):

{
  "message": "Task not found"
}


	6.	Update Task Priority
Endpoint: PUT /api/tasks/:taskId/priority
Request Body:

{
  "priority": 2
}

Response (Success, 200):

{
  "id": 1,
  "title": "Updated Task Title",
  "description": "Updated details",
  "status": "in-progress",
  "priority": 2,
  ...
}

Example Error (400):

{
  "message": "Priority must be a positive integer"
}

Profile Routes

	All Profile routes require an authenticated user (JWT token in the Authorization header).

	1.	Get Profile
Endpoint: GET /api/profile
Response (Success, 200):

{
  "id": 123,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": null,
  "dob": null,
  "isVerified": true,
  "bio": null,
  "avatar": null,
  ...
}

Example Error (404):

{
  "message": "User not found"
}


	2.	Update Profile
Endpoint: PUT /api/profile
Content-Type: multipart/form-data (if uploading avatar)
Form Fields (example):

firstName: "John"
lastName: "Doe"
phoneNumber: "+1234567890"
dob: "1990-01-01"
bio: "Hello world!"
avatar: <Image file>

Response (Success, 200):

{
  "message": "Profile updated successfully",
  "user": {
    "id": 123,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "dob": "1990-01-01",
    "isVerified": true,
    "bio": "Hello world!",
    "avatar": "https://res.cloudinary.com/.../avatar.jpg"
    ...
  }
}

Protected Routes

Any route that needs a valid token will check the header:

Authorization: Bearer <token>

If the token is missing or invalid, you’ll receive:

{
  "message": "Invalid or expired token"
}

or

{
  "message": "No token provided"
}

Cron Jobs

The application uses node-cron to schedule a job every minute (* * * * *) that:
	1.	Fetches tasks with future deadlines.
	2.	Determines if the deadline is within the next hour and reminderSent is false.
	3.	Sends a reminder email to the user and updates reminderSent to true.

Adjust the cron expression in utils/cronJobs.js to suit your needs.

Error Handling

All errors and success codes are maintained in utils/errors.js. When an error or notable success occurs, the server returns a structured JSON response like:

{
  "code": "AUTH001",
  "message": "Required fields are missing."
}

In some scenarios, the controller may return a simpler structure (like { "message": "Error detail" }). This can be tailored as needed.

Error / Success Codes

Here’s a list of error / success codes defined, their messages, and potential reasons.

AUTH

Code	Message	Potential Reasons
AUTH001	“Required fields are missing.”	- Request missing required fields (e.g., email/password).
AUTH002	“Invalid email or password.”	- User not found or password mismatch.
AUTH003	“User already exists with this email or username.”	- Attempt to register a user with an existing email/username.
AUTH004	“Invalid or expired verification code.”	- The verification code is wrong or has expired (past 10-minute window).
AUTH005	“User is not verified. Please verify your account…”	- User trying to log in but has not completed email verification.
AUTH006	“Invalid email or password.”	- Generic invalid credentials message (same as AUTH002).

PASSWORD

Code	Message	Potential Reasons
PWD001	“Email is required.”	- The request body for password-related action did not include an email.
PWD002	“Verification code sent. Please check your inbox.”	- Success for initiating password reset; code was emailed.
PWD003	“Password successfully reset.”	- Success after verifying code and resetting password.

REGISTRATION

Code	Message	Potential Reasons
REG001	“First name, last name, email, and password are required.”	- Missing necessary fields during registration.
REG002	“A verification code has been sent to your email…”	- Success after registration; the code was emailed to the user for verification.
REG003	“Registration successful. You can now log in.”	- Success after user enters correct verification code.
REG004	“A new verification code has been sent to your email.”	- Success after user requests a new code.
REG005	“Email and verification code are required to verify your registration.”	- Missing data in the request body (email or verification code).

CONTACT

Code	Message	Potential Reasons
CNT001	“All fields (name, email, subject, message) are required.”	- Missing one or more required fields in the contact form request.
CNT002	“Your message has been sent successfully. We will get back to you soon.”	- Success for sending the contact message.

SERVER

Code	Message	Potential Reasons
SRV001	“An unexpected server error occurred. Please try again later.”	- General internal server error (DB issue, uncaught exception, etc.).
SRV002	“Failed to send email. Please try again later.”	- Email service not available, invalid credentials, or a temporary network problem.

Example Request & Response

Example: Register and Verify Flow
	1.	Register

POST /api/auth/register
Content-Type: application/json

{
  "firstName": "Alice",
  "lastName": "Smith",
  "email": "alice.smith@example.com",
  "password": "SuperSecret123"
}

Response:

{
  "code": "REG002",
  "message": "A verification code has been sent to your email. Please verify..."
}


	2.	Check your email for a code, e.g. 123456, and verify:

POST /api/auth/verify-registration
Content-Type: application/json

{
  "email": "alice.smith@example.com",
  "verificationCode": "123456"
}

Response:

{
  "code": "REG006",
  "message": "Registration successful. You can now log in.",
  "token": "<JWT token>",
  "userInfo": {
    "firstName": "Alice",
    "lastName": "Smith",
    "email": "alice.smith@example.com"
  }
}

Code Explanation

server.js
	•	Initializes Express, sets up CORS, parses JSON.
	•	Mounts routes: /api/auth, /api/tasks, /api/profile.
	•	Syncs Sequelize with the database.
	•	Starts listening on PORT.

models/User.js
	•	Defines a User model with fields like firstName, lastName, email, password, etc.
	•	Pre-save hook to hash password with bcrypt.

models/Task.js
	•	Defines a Task model with fields like title, description, status, priority, and deadline.
	•	reminderSent to track if a reminder email has been sent.

controllers/authController.js
	•	registerUser: Handles registration & sends verification code.
	•	verifyRegistrationCode: Verifies the user’s email.
	•	loginUser: Authenticates user & returns JWT.
	•	forgotPassword: Sends a verification code for password reset.
	•	verifyVerificationCode: Resets the password after verifying code.
	•	resendVerificationEmail: Resends email verification code.
	•	sendContactFormEmail: Sends a contact form message to admin.
	•	changePassword: Changes password when user is logged in.

controllers/taskController.js
	•	createTask: Creates a new task (priority handling included).
	•	getTasks: Retrieves all tasks for the logged-in user.
	•	getTaskById: Retrieves a single task by ID.
	•	updateTask: Updates task fields.
	•	deleteTask: Deletes a task & adjusts priority ordering.
	•	updateTaskPriority: Reorders tasks based on the new priority.

controllers/profileController.js
	•	getProfile: Retrieves the current user’s profile (excluding password).
	•	updateProfile: Updates user info, including avatar upload to Cloudinary.

middleware/authMiddleware.js
	•	Checks for JWT in the Authorization header.
	•	Decodes & verifies the token.
	•	Attaches req.userId for subsequent controllers.

utils/cronJobs.js
	•	Scheduled to run every minute, checks tasks that are nearing their deadline.
	•	Sends reminder emails & marks them as reminderSent.

utils/mailer.js
	•	Configures Nodemailer using .env email settings.
	•	Provides sendEmail function to send messages.

utils/errors.js
	•	Central repository for all error/success codes and messages.

config/db.js
	•	Initializes Sequelize with PostgreSQL credentials.

Useful Commands
	•	Start the server in production:

npm start


	•	Start the server in development (with nodemon auto-reload):

npm run dev


	•	Install dependencies:

npm install


	•	Run tests (if a test suite is configured):

npm test

License

This project is licensed under the MIT License. You are free to use, modify, and distribute this software under the terms of the license.

Thank you for using the Task Manager Application!
For inquiries or feature requests, please open an issue or submit a pull request. Contributions are welcome.