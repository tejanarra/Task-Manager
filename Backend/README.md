# Task Manager API

This is a Task Manager API built using Node.js, Express, Sequelize (for PostgreSQL), and JWT authentication. It allows users to register, log in, manage tasks, and perform task-related actions (create, update, delete, and prioritize tasks). The API is designed to handle user authentication, task management, and password recovery features.

## Features

- **User Registration and Login**: Users can register, log in, and receive JWT tokens for authentication.
- **Task Management**: Users can create, read, update, delete, and prioritize tasks.
- **Password Reset**: Users can reset their password by verifying a code sent via email.
- **JWT Authentication**: Protects routes by ensuring only authenticated users can access certain endpoints.
- **Email Verification**: Sends a verification code to users' email addresses during registration.

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL (or any database with Sequelize support)
- Gmail (for sending emails via nodemailer)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/task-manager-api.git
```

2. Navigate to the project directory:

```bash
cd task-manager-api
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory and configure the environment variables:

```env
PORT=5001
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=1h
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
```

5. Run the application:

```bash
npm start
```

The API will start running on `http://localhost:5001`.

## API Endpoints

### Authentication Routes

- **POST `/api/auth/register`**: Register a new user.
- **POST `/api/auth/login`**: Log in and receive a JWT token.
- **POST `/api/auth/forgot-password`**: Request a password reset code.
- **POST `/api/auth/verify-code`**: Verify the reset code and set a new password.
- **POST `/api/auth/resend-verification`**: Resend verification email.
- **POST `/api/auth/verify-registration`**: Verify registration using a code.

### Task Routes

- **POST `/api/tasks`**: Create a new task.
- **GET `/api/tasks`**: Get all tasks for the authenticated user.
- **GET `/api/tasks/:taskId`**: Get a specific task by ID.
- **PUT `/api/tasks/:taskId`**: Update a task by ID.
- **DELETE `/api/tasks/:taskId`**: Delete a task by ID.
- **PUT `/api/tasks/:taskId/priority`**: Update task priority.

### Middleware

The `authenticateToken` middleware is used to protect task-related routes, ensuring that only authenticated users can interact with tasks.

```javascript
const authenticateToken = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("Error verifying token:", err.message || err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
```

### Models

#### User Model

- `username`: A unique username for the user.
- `email`: A unique email address for the user.
- `password`: The user's password (hashed using bcrypt).
- `isVerified`: A boolean flag indicating whether the user has verified their email.
- `verificationCode`: A verification code used for email verification and password reset.
- `verificationCodeExpiration`: The expiration timestamp for the verification code.

#### Task Model

- `title`: The task's title.
- `description`: A detailed description of the task.
- `status`: The task's current status (can be "not-started", "in-progress", or "completed").
- `userId`: The ID of the user to whom the task belongs.
- `priority`: The task's priority, used to order tasks.

### Task Priority Update Logic

The priority of a task can be updated. If the new priority is higher than the old one, other tasks with lower priorities are shifted down. If the new priority is lower, tasks with higher priorities are shifted up.

## Error Handling

The API provides descriptive error messages and status codes to help developers handle issues effectively:

- **400 Bad Request**: Missing or incorrect data in the request.
- **401 Unauthorized**: Missing or invalid JWT token.
- **403 Forbidden**: Invalid or expired token.
- **404 Not Found**: Resource not found (e.g., user or task).
- **500 Internal Server Error**: An error occurred while processing the request.

### Example Request: User Registration

```bash
POST /api/auth/register

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "message": "A verification code has been sent to your email. Please verify to complete the registration.",
  "code": "S003"
}
```

### Example Request: Task Creation

```bash
POST /api/tasks

{
  "title": "Complete the project",
  "description": "Finish the task management app by the end of the week.",
  "status": "not-started"
}
```

Response:

```json
{
  "id": 1,
  "title": "Complete the project",
  "description": "Finish the task management app by the end of the week.",
  "status": "not-started",
  "userId": 1,
  "priority": 1
}
```

### Example Request: Password Reset

```bash
POST /api/auth/forgot-password

{
  "email": "john@example.com"
}
```

Response:

```json
{
  "message": "Verification code sent. Please check your inbox.",
  "code": "S001"
}
```

## Contributing

Feel free to fork the repository, open issues, or submit pull requests. Make sure to follow the coding standards and provide detailed descriptions for bug fixes or new features.