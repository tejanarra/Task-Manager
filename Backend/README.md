# Task Management API

This is a RESTful API for user authentication and task management, built with Node.js, Express, Sequelize, and JWT for secure user authentication. 

---

## **Setup**

### **Requirements:**
- Node.js (version 16 or higher)
- Sequelize with a supported database (e.g., MySQL, PostgreSQL)
- dotenv for managing environment variables

### **Installation:**
1. **Clone the repository:**
   ```bash
   git clone "repo-link"
   cd task-management-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION=1h
   ```

4. **Run the application:**
   ```bash
   npm start
   ```

   The app will run on `http://localhost:5000` by default.

---

## **API Endpoints**

### **1. User Authentication**

#### **Register User**
- **Endpoint:** `POST /api/auth/register`
- **Description:** Registers a new user by providing a `username`, `email`, and `password`.
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response (Success):**
  ```json
  {
    "token": "string",
    "userInfo": {
      "username": "string",
      "email": "string"
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "message": "All fields are required."
  }
  ```

#### **Login User**
- **Endpoint:** `POST /api/auth/login`
- **Description:** Logs in a user with the provided `email` and `password`.
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response (Success):**
  ```json
  {
    "token": "string",
    "userInfo": {
      "username": "string",
      "email": "string"
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "message": "Invalid credentials"
  }
  ```

#### **Verify Token**
- **Endpoint:** `GET /api/auth/verify-token`
- **Description:** Verifies the validity of the JWT token.
- **Headers:**
  - `Authorization`: Bearer token
- **Response (Success):**
  ```json
  {
    "message": "Valid Token"
  }
  ```
- **Response (Error):**
  ```json
  {
    "message": "No token provided"
  }
  ```

---

### **2. Task Management**

#### **Create Task**
- **Endpoint:** `POST /api/tasks`
- **Description:** Creates a new task for the logged-in user.
- **Request Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "status": "string"
  }
  ```
- **Headers:**
  - `Authorization`: Bearer token
- **Response (Success):**
  ```json
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "status": "string",
    "userId": "number"
  }
  ```

#### **Get Tasks**
- **Endpoint:** `GET /api/tasks`
- **Description:** Retrieves all tasks of the logged-in user.
- **Headers:**
  - `Authorization`: Bearer token
- **Response (Success):**
  ```json
  [
    {
      "id": "number",
      "title": "string",
      "description": "string",
      "status": "string",
      "userId": "number"
    },
    ...
  ]
  ```

#### **Get Task By ID**
- **Endpoint:** `GET /api/tasks/:taskId`
- **Description:** Retrieves a specific task by its ID.
- **Params:**
  - `taskId`: The ID of the task
- **Headers:**
  - `Authorization`: Bearer token
- **Response (Success):**
  ```json
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "status": "string",
    "userId": "number"
  }
  ```

#### **Update Task**
- **Endpoint:** `PUT /api/tasks/:taskId`
- **Description:** Updates a task by its ID.
- **Request Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "status": "string"
  }
  ```
- **Params:**
  - `taskId`: The ID of the task to update
- **Headers:**
  - `Authorization`: Bearer token
- **Response (Success):**
  ```json
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "status": "string",
    "userId": "number"
  }
  ```

#### **Delete Task**
- **Endpoint:** `DELETE /api/tasks/:taskId`
- **Description:** Deletes a task by its ID.
- **Params:**
  - `taskId`: The ID of the task to delete
- **Headers:**
  - `Authorization`: Bearer token
- **Response (Success):**
  ```json
  {
    "message": "Task deleted successfully"
  }
  ```

---

## **Authentication Middleware**

### **Authenticate Token Middleware**
- **Description:** This middleware checks if a valid JWT token is present in the `Authorization` header and validates it. If valid, it adds the `userId` to the `req` object; otherwise, it returns an error.
- **Headers:**
  - `Authorization`: Bearer token
- **Response (Success):** Passes the request to the next handler.
- **Response (Error):**
  ```json
  {
    "message": "Unauthorized. Invalid or expired token."
  }
  ```

---

## **Environment Variables**
- `JWT_SECRET`: Secret key used to sign JWT tokens.
- `JWT_EXPIRATION`: Expiration time for JWT tokens (e.g., '1h').

---

## **Contributions**

Feel free to fork this project and contribute by submitting issues or pull requests. Please follow best practices and ensure all new features are well-tested.

---
