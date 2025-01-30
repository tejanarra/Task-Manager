Below is a professional, single-file README in standard Markdown formatting, suitable for rendering properly on GitHub. It contains all the details—features, setup instructions, environment variables, database configuration, usage examples, error codes, and more. Copy the entire content into a README.md file in your repository.

Task Manager Application

A production-ready Task Manager application built with Node.js, Express, Sequelize, PostgreSQL, and Cloudinary. It includes:
	•	User authentication (JWT-based)
	•	Email verification
	•	Password resets
	•	Profile management (with avatar uploads to Cloudinary)
	•	Task management (CRUD, priorities, deadline reminders)
	•	Cron-based email reminders for tasks nearing their deadline
	•	Contact form submission

Table of Contents
	•	Features
	•	Tech Stack
	•	Project Structure
	•	Prerequisites
	•	Installation
	•	Environment Variables
	•	Database Setup
	•	Running the Application
	•	API Endpoints & Usage
	•	Authentication Routes
	•	Task Routes
	•	Profile Routes
	•	Protected Routes
	•	Cron Jobs
	•	Error Handling
	•	Error / Success Codes
	•	Example Request & Response
	•	Code Explanation
	•	Useful Commands
	•	License

Features
	1.	User Registration & Verification
	•	Users verify their email by entering a verification code.
	2.	JWT Authentication
	•	Login returns a JWT token.
	3.	Password Reset
	•	Users can reset their password by verifying a code sent to their email.
	4.	Profile Management
	•	Update personal info and upload an avatar using Cloudinary.
	5.	Task Management
	•	Create, read, update, delete tasks with priority ordering.
	6.	Deadline Reminders
	•	Automatic email reminders for tasks nearing their deadline, powered by a cron job.
	7.	Contact Form
	•	Users can submit a contact form, which sends an email to an admin inbox.
	8.	Cloudinary Integration
	•	Store and manage user avatar images in the cloud.
	9.	PostgreSQL Database
	•	With Sequelize ORM for data modeling.

Tech Stack
	•	Node.js - JavaScript runtime
	•	Express - Web framework
	•	Sequelize - ORM for PostgreSQL
	•	PostgreSQL - Relational database
	•	Cloudinary - Image hosting & transformations
	•	Nodemailer - Email sending library
	•	JWT - Token-based authentication
	•	Cron - Scheduled tasks

Project Structure

├── config
│   ├── cloudinary.js         # Cloudinary configuration
│   ├── db.js                 # Sequelize DB configuration
│   └── config.js             # Centralized config (reads from .env)
├── controllers
│   ├── authController.js     # Registration, login, password reset, etc.
│   ├── profileController.js  # Profile fetch & update
│   └── taskController.js     # Task CRUD logic
├── middleware
│   └── authMiddleware.js     # JWT verification middleware
├── models
│   ├── Task.js               # Task model
│   └── User.js               # User model
├── routes
│   ├── authRoutes.js         # Auth routes
│   ├── profileRoutes.js      # Profile routes
│   └── taskRoutes.js         # Task routes
├── utils
│   ├── cronJobs.js           # Scheduled tasks (e.g., reminders)
│   ├── errors.js             # Central error/success messages & codes
│   └── mailer.js             # Nodemailer sending logic
├── .env                      # Environment variable file (ignored in git)
├── package.json
├── README.md
└── server.js                 # Main entry point

Prerequisites
	•	Node.js (v14 or later)
	•	npm or yarn
	•	PostgreSQL (running locally or remotely)
	•	Cloudinary account (for avatar/image storage)
	•	An email account (e.g. Gmail) for sending emails (Nodemailer)

Installation
	1.	Clone the repository:

git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name


	2.	Install dependencies:

npm install

or

yarn install



Environment Variables

Create a .env file in the project root, containing:

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
JWT_EXPIRATION=1h  # e.g., "2h", "7d", etc.

# Email (Nodemailer)
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

# Contact Form Receiver Email
CONTACT_FORM_RECEIVER_EMAIL=admin@example.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

	Note: Never commit .env to public repos.

Database Setup
	1.	Create a PostgreSQL database:

createdb your_database_name


	2.	Ensure your .env points to the correct database credentials.
	3.	The app uses Sequelize to auto-sync the models. On server start, tables will be created if they don’t exist.

Running the Application
	1.	Start the server:

npm start

or

yarn start


	2.	Validate:
	•	You should see logs like Database synced successfully. and Server is running on port 5001.

API Endpoints & Usage

All routes are prefixed with /api. Below are the key endpoints, their usage, and example requests/responses.

Authentication Routes
	1.	Register
POST /api/auth/register
	•	Body:

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}


	•	Response (200 on success):

{
  "code": "REG002",
  "message": "A verification code has been sent to your email..."
}


	•	Error (400 if missing fields):

{
  "code": "REG001",
  "message": "First name, last name, email, and password are required."
}


	2.	Resend Verification Email
POST /api/auth/resend-verification
	•	Body:

{ "email": "john.doe@example.com" }


	•	Response (200 on success):

{
  "code": "REG004",
  "message": "A new verification code has been sent to your email."
}


	3.	Verify Registration
POST /api/auth/verify-registration
	•	Body:

{
  "email": "john.doe@example.com",
  "verificationCode": "123456"
}


	•	Response (200 on success):

{
  "code": "REG006",
  "message": "Registration successful. You can now log in.",
  "token": "<JWT Token>",
  "userInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  }
}


	•	Error (400 if code is invalid/expired):

{
  "code": "AUTH004",
  "message": "Invalid or expired verification code."
}


	4.	Login
POST /api/auth/login
	•	Body:

{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}


	•	Response (200 on success):

{
  "code": "AUTH008",
  "message": "Login successful.",
  "token": "<JWT Token>",
  "userInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "avatar": null
  }
}


	•	Error (400 if credentials invalid):

{
  "code": "AUTH006",
  "message": "Invalid email or password."
}


	5.	Forgot Password
POST /api/auth/forgot-password
	•	Body:

{ "email": "john.doe@example.com" }


	•	Response (200 on success):

{
  "code": "PWD002",
  "message": "Verification code sent. Please check your inbox."
}


	6.	Verify Code & Reset Password
POST /api/auth/verify-code
	•	Body:

{
  "email": "john.doe@example.com",
  "verificationCode": "123456",
  "newPassword": "NewSecure123"
}


	•	Response (200 on success):

{
  "code": "PWD005",
  "message": "Password successfully reset. You can now log in..."
}


	7.	Contact Form
POST /api/auth/contact
	•	Body:

{
  "yourName": "John Doe",
  "yourEmail": "john.doe@example.com",
  "subject": "General Inquiry",
  "message": "Hello, I'd like to know more..."
}


	•	Response (200 on success):

{
  "code": "CNT004",
  "message": "Your message has been sent successfully. We will get back..."
}


	8.	Change Password
POST /api/auth/change-password (Protected)
	•	Headers: Authorization: Bearer <JWT Token>
	•	Body:

{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecure123"
}


	•	Response (200 on success):

{
  "code": "PWD004",
  "message": "Password updated successfully."
}



Task Routes

	All Task routes require a valid JWT.

	1.	Create Task
POST /api/tasks
	•	Body:

{
  "title": "My Task",
  "description": "Task details",
  "status": "not-started",
  "deadline": "2025-01-31T23:59:59.999Z"
}


	•	Response (201 on success):

{
  "id": 1,
  "title": "My Task",
  "description": "Task details",
  "status": "not-started",
  "userId": 123,
  "priority": 1,
  "deadline": "2025-01-31T23:59:59.999Z",
  "reminderSent": false,
  "createdAt": "...",
  "updatedAt": "..."
}


	2.	Get All Tasks
GET /api/tasks
	•	Response (200 on success):

[
  {
    "id": 1,
    "title": "My Task",
    "description": "Task details",
    "status": "not-started",
    ...
  },
  ...
]


	3.	Get Task By ID
GET /api/tasks/:taskId
	•	Response (200 on success):

{
  "id": 1,
  "title": "My Task",
  "description": "Task details",
  ...
}


	4.	Update Task
PUT /api/tasks/:taskId
	•	Body:

{
  "title": "Updated Title",
  "status": "in-progress",
  "deadline": "2025-02-01T10:00:00.000Z"
}


	•	Response (200 on success):

{
  "id": 1,
  "title": "Updated Title",
  "description": "Task details",
  "status": "in-progress",
  "deadline": "2025-02-01T10:00:00.000Z",
  "reminderSent": false,
  ...
}


	5.	Delete Task
DELETE /api/tasks/:taskId
	•	Response (200 on success):

{
  "message": "Task deleted successfully and priorities updated."
}


	6.	Update Task Priority
PUT /api/tasks/:taskId/priority
	•	Body:

{ "priority": 2 }


	•	Response (200 on success):

{
  "id": 1,
  "title": "Updated Title",
  "priority": 2,
  ...
}



Profile Routes

	All Profile routes require a valid JWT.

	1.	Get Profile
GET /api/profile
	•	Response (200 on success):

{
  "id": 123,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  ...
}


	2.	Update Profile
PUT /api/profile
	•	Content-Type: multipart/form-data (if uploading an avatar)
	•	Fields:
	•	firstName (optional)
	•	lastName (optional)
	•	phoneNumber (optional)
	•	dob (optional)
	•	bio (optional)
	•	avatar (optional, image file)
	•	Response (200 on success):

{
  "message": "Profile updated successfully",
  "user": {
    "id": 123,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "avatar": "https://res.cloudinary.com/...",
    ...
  }
}



Protected Routes

For protected routes, the request must include:

Authorization: Bearer <Your JWT Token>

If missing or invalid, you might see:

{ "message": "No token provided" }

or

{ "message": "Invalid or expired token" }

Cron Jobs
	•	Defined in utils/cronJobs.js.
	•	Runs every minute (* * * * *).
	•	Finds tasks whose deadlines are within the next hour and sends reminder emails if reminderSent === false.
	•	Updates reminderSent to true to prevent duplicate reminders.

Error Handling

All error codes and messages are in utils/errors.js. The server typically responds with a JSON object like:

{
  "code": "AUTH001",
  "message": "Required fields are missing."
}

or simpler forms like:

{
  "message": "Server error during task creation"
}

Error / Success Codes

AUTH

Code	Message	Potential Reasons
AUTH001	“Required fields are missing.”	Missing email or password fields, etc.
AUTH002	“Invalid email or password.”	User not found or incorrect password.
AUTH003	“User already exists…”	Duplicate registration attempt with same email/username.
AUTH004	“Invalid or expired verification code.”	Wrong or expired email verification code.
AUTH005	“User is not verified…”	Attempt to log in without verifying email.
AUTH006	“Invalid email or password.”	Generic invalid credentials message.

PASSWORD

Code	Message	Potential Reasons
PWD001	“Email is required.”	Missing email for password reset request.
PWD002	“Verification code sent…”	Success for starting password reset.
PWD003	“Password successfully reset.”	Success after verifying code & updating password.

REGISTRATION

Code	Message	Potential Reasons
REG001	“First name, last name, email, and password are required.”	Missing fields in registration.
REG002	“A verification code has been sent to your email. Please verify…”	Success after new user registration.
REG003	“Registration successful. You can now log in.”	Success after verifying code.
REG004	“A new verification code has been sent to your email.”	Success upon re-requesting verification code.
REG005	“Email and verification code are required to verify your registration.”	Missing either email or verification code in request.

CONTACT

Code	Message	Potential Reasons
CNT001	“All fields (name, email, subject, message) are required.”	Missing required fields for contact form submission.
CNT002	“Your message has been sent successfully. We will get back to you soon.”	Success for sending contact message.

SERVER

Code	Message	Potential Reasons
SRV001	“An unexpected server error occurred. Please try again later.”	General internal error, DB issues, etc.
SRV002	“Failed to send email. Please try again later.”	Email service not working, invalid credentials, etc.

Example Request & Response

Register > Verify > Login (Typical Flow)
	1.	Register

POST /api/auth/register
{
  "firstName": "Alice",
  "lastName": "Smith",
  "email": "alice@example.com",
  "password": "Secret123"
}

Response:

{
  "code": "REG002",
  "message": "A verification code has been sent..."
}


	2.	Verify Registration (using the code from email)

POST /api/auth/verify-registration
{
  "email": "alice@example.com",
  "verificationCode": "123456"
}

Response:

{
  "code": "REG006",
  "message": "Registration successful. You can now log in.",
  "token": "<JWT>",
  "userInfo": { ... }
}


	3.	Login

POST /api/auth/login
{
  "email": "alice@example.com",
  "password": "Secret123"
}

Response:

{
  "code": "AUTH008",
  "message": "Login successful.",
  "token": "<JWT>",
  "userInfo": { ... }
}



Code Explanation
	•	server.js
	•	Bootstraps Express, sets up routes, initializes DB sync, and starts listening.
	•	models/User.js
	•	Defines the User schema (fields like firstName, lastName, etc.).
	•	Hashes the password before creation.
	•	models/Task.js
	•	Defines the Task schema (fields like title, status, deadline, etc.).
	•	Includes a reminderSent flag.
	•	controllers/authController.js
	•	Contains logic for register, login, email verification, password resets, etc.
	•	controllers/taskController.js
	•	Handles task creation, retrieval, updating, deletion, and priority reordering.
	•	controllers/profileController.js
	•	Lets a user fetch/update profile info (including avatar upload via Cloudinary).
	•	middleware/authMiddleware.js
	•	Verifies JWT in Authorization: Bearer <token>.
	•	utils/cronJobs.js
	•	Runs a cron job every minute to check tasks nearing their deadlines and sends reminders.
	•	utils/mailer.js
	•	Configures Nodemailer to send emails using environment credentials.
	•	utils/errors.js
	•	Central repository for error and success message definitions.

Useful Commands
	•	Start (production mode):

npm start


	•	Start (development mode with nodemon):

npm run dev


	•	Install dependencies:

npm install


	•	Run tests (if configured):

npm test



License

This project is licensed under the MIT License.
Feel free to modify and distribute under these terms.

Thank you for using the Task Manager Application!
Please open an issue or submit a pull request for questions or contributions.