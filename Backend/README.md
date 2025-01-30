# Task Manager Application

A production-ready Task Manager application built with **Node.js**, **Express**, **Sequelize**, **PostgreSQL**, and **Cloudinary**. This app provides an easy-to-use platform to manage tasks with features such as user authentication, task management, profile management, and email reminders for deadlines.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints & Usage](#api-endpoints--usage)
  - [Authentication Routes](#authentication-routes)
  - [Task Routes](#task-routes)
  - [Profile Routes](#profile-routes)
  - [Protected Routes](#protected-routes)
  - [Cron Jobs](#cron-jobs)
- [Error Handling](#error-handling)
- [Error / Success Codes](#error--success-codes)
- [Example Request & Response](#example-request--response)
- [Code Explanation](#code-explanation)
- [Useful Commands](#useful-commands)
- [License](#license)

---

## Features
1. **User Registration & Verification**  
   Users can register, and a verification code is sent to their email to confirm their email address.

2. **JWT Authentication**  
   Login returns a JWT token for secure authentication on subsequent requests.

3. **Password Reset**  
   Users can reset their password by verifying a code sent to their email.

4. **Profile Management**  
   Users can update their personal information and upload an avatar using Cloudinary.

5. **Task Management**  
   Users can perform CRUD operations on tasks, including priority setting and deadline reminders.

6. **Deadline Reminders**  
   Cron jobs send email reminders for tasks nearing their deadline.

7. **Contact Form**  
   Users can submit a contact form that sends an email to the admin inbox.

8. **Cloudinary Integration**  
   User avatars are stored and managed via Cloudinary.

9. **PostgreSQL Database**  
   The application uses a PostgreSQL database with Sequelize ORM for data modeling.

---

## Tech Stack
- **Node.js** – JavaScript runtime for backend logic
- **Express** – Web framework for creating APIs
- **Sequelize** – ORM for PostgreSQL database interaction
- **PostgreSQL** – Relational database
- **Cloudinary** – Image hosting & transformations for user avatars
- **Nodemailer** – Email sending library
- **JWT** – Token-based authentication
- **Cron** – Scheduled tasks for reminders

---

## Project Structure
```
├── config
│   ├── cloudinary.js         # Cloudinary configuration
│   ├── db.js                 # Sequelize DB configuration
│   └── config.js             # Centralized config (reads from .env)
├── controllers
│   ├── authController.js     # Auth logic (register, login, etc.)
│   ├── profileController.js  # Profile fetch & update logic
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
│   └── mailer.js             # Email sending logic
├── .env                      # Environment variables (ignored in git)
├── package.json              # Project dependencies
├── README.md                 # Documentation
└── server.js                 # Main entry point for the app
```

---

## Prerequisites
- **Node.js** (v14 or later)
- **npm** or **yarn**
- **PostgreSQL** (running locally or remotely)
- **Cloudinary** account (for avatar/image storage)
- An email account (e.g., Gmail) for **Nodemailer**

---

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

---

## Environment Variables

Create a `.env` file in the project root containing the following:

```
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
```

**Note**: Never commit `.env` to public repositories.

---

## Database Setup
1. Create a PostgreSQL database:
    ```bash
    createdb your_database_name
    ```

2. Ensure your `.env` file points to the correct database credentials.

3. Sequelize will auto-sync the models on server start, creating the necessary tables.

---

## Running the Application
1. Start the server:
    ```bash
    npm start
    # or
    yarn start
    ```

2. Validate:
   You should see logs like `Database synced successfully.` and `Server is running on port 5001`.

---

## API Endpoints & Usage

All routes are prefixed with `/api`. Below are the key endpoints, usage, and example requests/responses.

### Authentication Routes

#### 1. Register
- **POST /api/auth/register**
    - **Body**:
    ```json
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "password": "SecurePass123"
    }
    ```
    - **Response**:
    ```json
    {
      "code": "REG002",
      "message": "A verification code has been sent to your email..."
    }
    ```

#### 2. Login
- **POST /api/auth/login**
    - **Body**:
    ```json
    {
      "email": "john.doe@example.com",
      "password": "SecurePass123"
    }
    ```
    - **Response**:
    ```json
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
    ```

---

### Task Routes

All task routes require a valid JWT token.

#### 1. Create Task
- **POST /api/tasks**
    - **Body**:
    ```json
    {
      "title": "My Task",
      "description": "Task details",
      "status": "not-started",
      "deadline": "2025-01-31T23:59:59.999Z"
    }
    ```
    - **Response**:
    ```json
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
    ```

---

### Profile Routes

All profile routes require a valid JWT token.

#### 1. Get Profile
- **GET /api/profile**
    - **Response**:
    ```json
    {
      "id": 123,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "avatar": "https://res.cloudinary.com/...",
      ...
    }
    ```

---

## Cron Jobs
- Defined in `utils/cronJobs.js`.
- Runs every minute (`* * * * *`).
- Checks for tasks whose deadlines are within the next hour and sends reminder emails if `reminderSent` is false.
- Sets `reminderSent` to true after sending the reminder to avoid duplicates.

---

## Error Handling
All error codes and messages are centralized in `utils/errors.js`. The server typically responds with a JSON object like:

```json
{
  "code": "AUTH001",
  "message": "Required fields are missing."
}
```

---

It looks like you want to add additional **Error / Success Codes** for various operations like **Authentication**, **Password Reset**, **Registration**, **Contact**, and **Server Errors** as well as the **Example Request & Response** for a typical registration flow, along with the **Code Explanation** section. Below is the completed version with these details added:

---

## Error / Success Codes

### **AUTH** (Authentication)

| **Code**   | **Message**                                | **Potential Reasons**                             |
|------------|--------------------------------------------|---------------------------------------------------|
| AUTH001    | "Required fields are missing."             | Missing email or password fields, etc.            |
| AUTH002    | "Invalid email or password."               | User not found or incorrect password.             |
| AUTH003    | "User already exists…"                     | Duplicate registration attempt with same email/username. |
| AUTH004    | "Invalid or expired verification code."    | Wrong or expired email verification code.         |
| AUTH005    | "User is not verified…"                    | Attempt to log in without verifying email.        |
| AUTH006    | "Invalid email or password."               | Generic invalid credentials message.              |

---

### **PASSWORD** (Password Reset)

| **Code**   | **Message**                                  | **Potential Reasons**                             |
|------------|----------------------------------------------|---------------------------------------------------|
| PWD001     | "Email is required."                         | Missing email for password reset request.         |
| PWD002     | "Verification code sent…"                   | Success for starting password reset.              |
| PWD003     | "Password successfully reset."               | Success after verifying code & updating password. |

---

### **REGISTRATION** (User Registration)

| **Code**   | **Message**                                  | **Potential Reasons**                             |
|------------|----------------------------------------------|---------------------------------------------------|
| REG001     | "First name, last name, email, and password are required." | Missing fields in registration.                  |
| REG002     | "A verification code has been sent to your email. Please verify…" | Success after new user registration.             |
| REG003     | "Registration successful. You can now log in." | Success after verifying code.                    |
| REG004     | "A new verification code has been sent to your email." | Success upon re-requesting verification code.    |
| REG005     | "Email and verification code are required to verify your registration." | Missing either email or verification code in request. |

---

### **CONTACT** (Contact Form)

| **Code**   | **Message**                                  | **Potential Reasons**                             |
|------------|----------------------------------------------|---------------------------------------------------|
| CNT001     | "All fields (name, email, subject, message) are required." | Missing required fields for contact form submission. |
| CNT002     | "Your message has been sent successfully. We will get back to you soon." | Success for sending contact message.             |

---

### **SERVER** (Server Errors)

| **Code**   | **Message**                                  | **Potential Reasons**                             |
|------------|----------------------------------------------|---------------------------------------------------|
| SRV001     | "An unexpected server error occurred. Please try again later." | General internal error, DB issues, etc.           |
| SRV002     | "Failed to send email. Please try again later." | Email service not working, invalid credentials, etc. |

---

## Example Request & Response

### **Register > Verify > Login** (Typical Flow)

#### 1. **Register**

**Request**:
```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "Alice",
  "lastName": "Smith",
  "email": "alice@example.com",
  "password": "Secret123"
}
```

**Response**:
```json
{
  "code": "REG002",
  "message": "A verification code has been sent to your email. Please verify your registration."
}
```

#### 2. **Verify Registration** (Using the verification code from email)

**Request**:
```bash
POST /api/auth/verify-registration
Content-Type: application/json

{
  "email": "alice@example.com",
  "verificationCode": "123456"
}
```

**Response**:
```json
{
  "code": "REG003",
  "message": "Registration successful. You can now log in.",
  "token": "<JWT_TOKEN>",
  "userInfo": {
    "id": 1,
    "firstName": "Alice",
    "lastName": "Smith",
    "email": "alice@example.com",
    "avatar": "https://res.cloudinary.com/your-cloud-name/image/upload/v123456789/avatars/your-avatar.jpg"
  }
}
```

#### 3. **Login**

**Request**:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "Secret123"
}
```

**Response**:
```json
{
  "code": "AUTH008",
  "message": "Login successful.",
  "token": "<JWT_TOKEN>",
  "userInfo": {
    "id": 1,
    "firstName": "Alice",
    "lastName": "Smith",
    "email": "alice@example.com",
    "avatar": "https://res.cloudinary.com/your-cloud-name/image/upload/v123456789/avatars/your-avatar.jpg"
  }
}
```

---

## Code Explanation

- **server.js**  
  - Initializes the Express app, configures middleware, sets up routes, and starts the server.
  - Syncs the database using Sequelize on startup and listens for incoming requests.

- **models/User.js**  
  - Defines the `User` schema with fields like `firstName`, `lastName`, `email`, and `password`.
  - Password is hashed before saving into the database using `bcrypt`.

- **models/Task.js**  
  - Defines the `Task` schema with fields like `title`, `description`, `status`, and `deadline`.
  - Includes a `reminderSent` flag to track if a reminder has been sent for the task's deadline.

- **controllers/authController.js**  
  - Handles the logic for registering, logging in, email verification, and password resets.
  - Sends email verification codes and reset passwords using `Nodemailer`.

- **controllers/taskController.js**  
  - Handles task CRUD operations: Create, Read, Update, Delete, and Change Task Status.
  - Allows users to assign priorities and set deadlines for tasks.

- **controllers/profileController.js**  
  - Handles retrieving and updating user profile information.
  - Allows users to upload an avatar using Cloudinary for image storage.

- **middleware/authMiddleware.js**  
  - Verifies the JWT token included in the `Authorization` header for protected routes.
  - If the token is valid, it attaches the user's information to the request.

- **utils/cronJobs.js**  
  - Defines background tasks to run periodically (e.g., every minute).
  - It checks for tasks nearing their deadlines and sends email reminders to users about upcoming deadlines.

- **utils/mailer.js**  
  - Configures Nodemailer to send email notifications.
  - Uses environment credentials (e.g., Gmail or custom SMTP) to handle email delivery.

- **utils/errors.js**  
  - Centralizes error codes and success messages used across the application.
  - Ensures consistent error handling for API responses.

---

## Useful Commands

- **Start (production mode)**:
    ```bash
    npm start
    ```

- **Start (development mode with nodemon)**:
    ```bash
    npm run dev
    ```

- **Install dependencies**:
    ```bash
    npm install
    ```

- **Run tests** (if configured):
    ```bash
    npm test
    ```

---

## License

This project is licensed under the **MIT License**.  
Feel free to modify and distribute under these terms.

Thank you for using the Task Manager Application!  
Please open an issue or submit a pull request for questions or contributions.
