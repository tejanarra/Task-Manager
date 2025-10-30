# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Task Manager - Architecture Documentation

A full-stack task management application built with **React 19** (Frontend) and **Express 5** (Backend), featuring JWT authentication, PostgreSQL database, AI-powered task generation using Ollama, and modern image cropping with react-easy-crop.

---

## Project Structure

### Monorepo Organization

This is a **monorepo with separate Frontend and Backend** folders:

```
Task-Manager/
├── Frontend/               # React.js client application
├── Backend/                # Express.js API server
├── Assets/                 # Static images and documentation assets
├── IOS/                    # iOS-related files
├── README.md               # Main project documentation
├── GIT_REFERENCE.md        # Git workflow guide
└── CLAUDE.md              # This file
```

### Backend Structure

```
Backend/
├── server.js              # Express app initialization
├── app.js                 # Alternative app configuration (legacy)
├── package.json           # Backend dependencies
├── jest.config.js         # Testing configuration
├── config/
│   ├── db.js             # PostgreSQL/Sequelize connection
│   ├── cloudinary.js     # Image upload configuration
│   ├── config.js         # General configuration
│   └── swagger.js        # API documentation setup
├── constants/
│   └── config.js         # Centralized configuration constants
├── controllers/
│   ├── authController.js
│   ├── taskController.js
│   ├── profileController.js
│   └── aiController.js
├── models/
│   ├── User.js          # User schema (Sequelize)
│   └── Task.js          # Task schema (Sequelize)
├── routes/
│   ├── authRoutes.js
│   ├── taskRoutes.js
│   ├── profileRoutes.js
│   └── aiRoutes.js
├── middleware/
│   ├── authMiddleware.js      # JWT token verification
│   └── rateLimiter.js        # Express rate limiting
├── utils/
│   ├── tokenUtils.js         # JWT utilities
│   ├── passwordUtils.js      # Bcrypt password hashing
│   ├── validationUtils.js    # Input validation
│   ├── emailUtils.js         # Email utilities
│   ├── mailer.js            # Nodemailer configuration
│   ├── jwtUtils.js          # JWT token management
│   ├── timeHelpers.js       # Time/date utilities
│   ├── errors.js            # Custom error classes
│   └── cronJobs.js          # Scheduled tasks
└── __tests__/
    ├── controllers/
    │   ├── taskController.test.js
    │   ├── profileController.test.js
    │   └── aiController.test.js
    ├── middleware/
    │   └── authMiddleware.test.js
    └── utils/
        ├── passwordUtils.test.js
        ├── tokenUtils.test.js
        └── validationUtils.test.js
```

### Frontend Structure

```
Frontend/
├── package.json           # Frontend dependencies
├── public/               # Static assets
├── build/                # Production build output
├── src/
│   ├── App.js           # Main application component
│   ├── index.js         # React entry point
│   ├── App.css          # Main styles
│   ├── constants/
│   │   └── appConstants.js    # Centralized constants
│   ├── context/
│   │   ├── AuthContext.js     # Auth state management (Context API)
│   │   ├── PrivateRoute.js    # Protected route wrapper
│   │   └── PublicRoute.js     # Public-only route wrapper
│   ├── hooks/
│   │   ├── useFormState.js    # Form state management
│   │   ├── useApiError.js     # Error handling
│   │   ├── useLoading.js      # Loading state
│   │   ├── usePasswordValidation.js
│   │   ├── useTaskReminders.js
│   │   ├── useAuthCheck.js
│   │   └── index.js           # Hooks exports
│   ├── services/
│   │   └── api.js             # Axios configuration and API calls
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── ForgotPassword.js
│   │   │   ├── ChangePassword.js
│   │   │   └── VerificationForm.js
│   │   ├── tasks/             # Task management components
│   │   │   ├── TaskList.js
│   │   │   ├── TaskEditor.js
│   │   │   ├── taskItem/
│   │   │   │   ├── TaskCard.js
│   │   │   │   ├── TaskItem.js
│   │   │   │   ├── TaskReminders.js
│   │   │   │   └── ReminderCheckbox.js
│   │   │   └── AIChatModal/   # AI task generation
│   │   │       ├── AIChatModal.js
│   │   │       ├── ChatMessage.js
│   │   │       ├── ChatMode.js
│   │   │       ├── QuickMode.js
│   │   │       └── TaskPreviewModal.js
│   │   ├── profile/           # User profile
│   │   │   ├── ProfileOverview.js
│   │   │   └── EditProfile.js
│   │   ├── layout/            # Layout components
│   │   │   ├── Navbar.js
│   │   │   ├── footer.js
│   │   │   ├── ErrorBoundary.js
│   │   │   └── ConfirmationModal.js
│   │   ├── landingPage/       # Public landing page
│   │   │   ├── LandingPage.js
│   │   │   ├── BenefitsSection.js
│   │   │   ├── FeaturesSection.js
│   │   │   ├── DemoSection.js
│   │   │   ├── TestimonialsSection.js
│   │   │   └── data.js
│   │   └── common/            # Reusable UI components
│   │       ├── FormInput.js
│   │       ├── AlertBanner.js
│   │       ├── LoadingButton.js
│   │       ├── ModalHeader.js
│   │       ├── ProfileCard.js
│   │       └── index.js
│   ├── utils/
│   │   ├── errorUtils.js      # Error handling
│   │   ├── statusUtils.js     # Task status utilities
│   │   ├── reminderUtils.js   # Reminder utilities
│   │   ├── dateUtils.js       # Date formatting
│   │   ├── imageUtils.js      # Image handling
│   │   └── reminderHelpers.js
│   └── setupTests.js          # Test configuration
└── REFACTORING_SUMMARY.md     # Recent refactoring documentation
```

---

## Tech Stack

### Frontend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | ^19.2.0 | UI framework (latest) |
| **React Router DOM** | ^6.30.1 | Client-side routing (v6, stable for CRA) |
| **Axios** | ^1.13.1 | HTTP client |
| **Bootstrap** | ^5.3.8 | UI styling framework |
| **@dnd-kit** | ^6.3.1+ | Drag-and-drop library |
| **@hello-pangea/dnd** | ^18.0.1 | Alternative DnD (react-beautiful-dnd fork) |
| **date-fns** | ^4.1.0 | Date manipulation |
| **Lucide React** | ^0.548.0 | Icon library |
| **react-easy-crop** | ^5.5.3 | Modern image cropping with zoom/rotation |
| **@react-oauth/google** | ^0.12.2 | Google OAuth integration |
| **React Testing Library** | ^16.3.0 | Component testing |
| **@testing-library/jest-dom** | ^6.9.1 | Jest DOM matchers |
| **@testing-library/user-event** | ^14.6.1 | User interaction testing |
| **web-vitals** | ^5.1.0 | Performance metrics |

### Backend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Express.js** | ^5.1.0 | Web framework (ES6 modules, v5) |
| **Sequelize** | ^6.37.7 | ORM for PostgreSQL |
| **PostgreSQL** | ^8.16.3 | Relational database (via `pg` driver) |
| **JWT** | ^9.0.2 | Authentication tokens |
| **Bcryptjs** | ^3.0.2 | Password hashing (major upgrade) |
| **Dotenv** | ^16.4.5 | Environment variables |
| **CORS** | ^2.8.5 | Cross-origin requests |
| **Express Validator** | ^7.3.0 | Input validation |
| **Express Rate Limit** | ^8.2.0 | API rate limiting |
| **Nodemailer** | ^7.0.7 | Email sending |
| **Cloudinary** | ^2.8.0 | Image hosting/transformation |
| **Ollama** | ^0.6.0 | AI/LLM integration (local or cloud) |
| **Multer** | ^2.0.2 | File upload handling |
| **node-cron** | ^4.2.1 | Scheduled tasks (v4) |
| **Swagger UI** | ^5.0.1 | API documentation |
| **Jest** | ^30.2.0 | Testing framework |
| **Supertest** | ^7.1.4 | HTTP assertions |

### Key Features by Stack

#### Frontend
- **Authentication**: Context API + localStorage
- **State Management**: React Context + custom hooks
- **HTTP**: Axios with interceptors for JWT tokens
- **Styling**: Bootstrap + custom CSS
- **Date Handling**: date-fns library
- **Drag & Drop**: react-beautiful-dnd + @dnd-kit
- **Testing**: React Testing Library + Jest

#### Backend
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (Bearer tokens)
- **Password Security**: Bcrypt hashing
- **API Documentation**: Swagger/OpenAPI
- **Rate Limiting**: Express rate-limit
- **Email**: Nodemailer with Gmail SMTP
- **File Upload**: Multer + Cloudinary storage
- **AI Features**: Ollama for task generation
- **Scheduling**: node-cron for reminders
- **Testing**: Jest with mocked database

---

## Key Architectural Patterns

### Authentication Flow

1. **Registration**:
   - User submits email/password
   - Backend generates 6-digit verification code (expires in 10 minutes)
   - Code sent via email using Nodemailer
   - Frontend: User enters code → Backend verifies → Account activated

2. **Login**:
   - Email + password validated against bcrypt hash
   - JWT token generated (48h expiration)
   - Token stored in localStorage
   - Axios interceptor automatically adds `Authorization: Bearer <token>` to requests

3. **Token Verification**:
   - `authMiddleware.js` extracts and verifies JWT
   - Decoded `userId` attached to `req.userId`
   - Invalid/expired tokens return 403 Forbidden

4. **Frontend Auth State**:
   - `AuthContext.js` manages user state + token
   - `PrivateRoute` checks authentication, redirects to login if needed
   - `PublicRoute` redirects authenticated users away from login/register

### Database Architecture

**User-Task Relationship**:
```javascript
User (1) ← hasMany → Task (Many)
Task.userId (FK) → User.id
```

**User Model** (Sequelize):
- `firstName`, `lastName`, `email` (unique)
- `password` (bcrypt hashed)
- `isVerified`, `verificationCode`, `verificationCodeExpiration`
- `avatar` (Cloudinary URL), `bio`, `phoneNumber`, `dob`
- Timestamps: `createdAt`, `updatedAt`

**Task Model** (Sequelize):
- `title` (max 100 chars), `description` (max 1000 chars)
- `status`: ENUM('not-started', 'in-progress', 'completed')
- `userId` (FK to User)
- `priority` (integer, used for ordering)
- `deadline` (DATE nullable)
- `reminders` (JSONB array)
- Timestamps: `createdAt`, `updatedAt`

### API Architecture

**RESTful Endpoints** with JWT protection:

```
Authentication (Public)
├── POST /api/auth/register
├── POST /api/auth/verify-registration
├── POST /api/auth/resend-verification
├── POST /api/auth/login
├── POST /api/auth/forgot-password
├── POST /api/auth/verify-code
├── POST /api/auth/google
└── POST /api/auth/contact

Tasks (Protected)
├── POST /api/tasks (create, bumps priorities)
├── GET /api/tasks (list ordered by priority ASC)
├── GET /api/tasks/:taskId (single task)
├── PUT /api/tasks/:taskId (update)
├── DELETE /api/tasks/:taskId (delete, reorders priorities)
└── PUT /api/tasks/:taskId/priority (update with reindexing)

Profile (Protected)
├── GET /api/profile
└── PUT /api/profile (multipart form-data, image upload)

AI Features (Protected)
├── POST /api/ai/chat (single prompt → task)
└── POST /api/ai/chat-conversation (multi-turn conversation)

Miscellaneous
├── GET /api/auth/change-password (protected)
└── GET /api/auth/cronrun (manual cron trigger)
```

### Component Architecture

**Frontend Pattern**: Feature-based organization
- Each feature (auth, tasks, profile) has its own folder
- Shared UI components in `/components/common`
- Utility functions grouped by concern
- Custom hooks in `/hooks` for reusable logic
- Context API for global state (Auth)

**Backend Pattern**: MVC + Utility Separation
- **Models**: Sequelize schemas in `/models`
- **Controllers**: Business logic in `/controllers`
- **Routes**: Endpoint definitions in `/routes`
- **Middleware**: Cross-cutting concerns (auth, validation)
- **Utils**: Reusable functions (token, password, validation, email)
- **Constants**: Centralized config in `/constants/config.js`

### State Management

**Frontend**:
- **Global State**: AuthContext (user + token)
- **Local State**: React useState hooks
- **Custom Hooks**: useFormState, useApiError, useLoading, useTaskReminders
- **Persistence**: localStorage for token and user info

**Backend**:
- **No state**: Stateless API
- **Database**: PostgreSQL as single source of truth
- **Session**: JWT (stateless, no session storage needed)

### Error Handling

**Frontend**:
- `useApiError()` hook centralizes error management
- `errorUtils.js` provides helpers: `getErrorMessage()`, `isAuthError()`
- Alerts displayed via `AlertBanner` component
- Auto-logout on 403 (authorization error)

**Backend**:
- Custom error classes in `utils/errors.js`
- Consistent error response format:
  ```json
  { "error": "Error message", "status": 400 }
  ```
- HTTP status codes from `ERROR_MESSAGES` constant

### Validation

**Frontend**:
- `usePasswordValidation()` for password strength
- Form validation before submission
- Real-time field validation

**Backend**:
- `express-validator` for input validation
- Sequelize model validation
- Custom validators in `validationUtils.js`
- VALIDATION_CONFIG constants (regex, lengths)

---

## Build & Development Commands

### Frontend Commands

```bash
# Development
npm start              # Start dev server on http://localhost:3000

# Production
npm run build         # Create production build
npm run deploy        # Deploy to GitHub Pages (requires gh-pages)

# Testing
npm test              # Run tests (react-scripts test)

# No eject (CRA managed)
npm run eject         # One-way operation, DON'T USE unless necessary
```

**Scripts in `Frontend/package.json`**:
```json
{
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

### Backend Commands

```bash
# Development
npm start             # Start server on http://localhost:5001
npm run dev          # Same as start

# Testing
npm test             # Run Jest tests
npm test:watch      # Run tests in watch mode
npm test:coverage   # Run tests with coverage report

# Building
npm run build        # Install dependencies (legacy script)
```

**Scripts in `Backend/package.json`**:
```json
{
  "start": "node server.js",
  "dev": "node server.js",
  "build": "npm install && npm run build",
  "test": "NODE_OPTIONS=--experimental-vm-modules jest",
  "test:watch": "NODE_OPTIONS=--experimental-vm-modules jest --watch",
  "test:coverage": "NODE_OPTIONS=--experimental-vm-modules jest --coverage"
}
```

**Note**: Backend uses **ES6 modules** (`"type": "module"`), requires Node 16+

### Environment Setup

**Frontend** - `.env` (create if needed):
```env
REACT_APP_API_URL=https://task-manager-sigma-ashen.vercel.app/api
# or for local dev:
# REACT_APP_API_URL=http://localhost:5001/api
```

**Backend** - `.env` (required):
```env
# Database
DB_HOST=localhost
DB_NAME=task_manager
DB_USER=postgres
DB_PASSWORD=password
DB_PORT=5432
DB_DIALECT=postgres

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=48h

# Email (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
CONTACT_EMAIL=support@example.com

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# File Upload
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI/LLM
OLLAMA_API_BASE_URL=http://localhost:11434

# Deployment
FRONTEND_URL=https://tejanarra.github.io/Task-Manager
PORT=5001
NODE_ENV=development
```

---

## Testing Setup

### Backend Testing

**Framework**: Jest 30.2.0 + Supertest 7.1.4

**Configuration** (`Backend/jest.config.js`):
- Environment: Node.js
- Transform: None (native ES6 modules)
- Test files: `**/__tests__/**/*.test.js`
- Coverage: Controllers, middleware, utils
- Coverage reporters: text, lcov, html

**Test Structure**:
```
Backend/__tests__/
├── controllers/
│   ├── taskController.test.js      # Task CRUD operations
│   ├── profileController.test.js
│   └── aiController.test.js
├── middleware/
│   └── authMiddleware.test.js      # JWT verification
└── utils/
    ├── passwordUtils.test.js       # Bcrypt hashing
    ├── tokenUtils.test.js          # JWT utilities
    └── validationUtils.test.js     # Input validation
```

**Run Tests**:
```bash
npm test                # Run all tests once
npm test:watch         # Watch mode
npm test:coverage      # Generate coverage report → Backend/coverage/
```

**Mocking Strategy**:
- Jest mocks for database models
- Mocked `Task` and `User` models
- Mocked transactions
- Mock `res` object with `status()`, `json()` methods

### Frontend Testing

**Framework**: React Testing Library 13.4.0 + Jest (via react-scripts)

**Setup** (`Frontend/src/setupTests.js`):
- Testing Library configuration
- jest-dom matchers

**Test Files**:
- `Frontend/src/App.test.js` - App component tests

**Run Tests**:
```bash
npm test               # Interactive watch mode
# Press 'a' to run all, 'q' to quit
```

**Testing Approach**:
- Component integration tests
- User event simulation
- API mocking (via axios)

---

## Important Configuration Files

### Backend Key Configs

**1. `Backend/constants/config.js`** - Centralized constants:
- `AUTH_CONFIG`: JWT expiry, bcrypt rounds, verification code TTL
- `TASK_CONFIG`: Max lengths, valid statuses, defaults
- `AI_CONFIG`: Model, temperature, token limits, conversation history
- `EMAIL_CONFIG`: SMTP settings, frontend URLs
- `CLOUDINARY_CONFIG`: Image upload constraints
- `RATE_LIMIT_CONFIG`: API rate limits
- `VALIDATION_CONFIG`: Regex patterns, field lengths
- `ERROR_MESSAGES`, `SUCCESS_MESSAGES`: User-facing text
- `HTTP_STATUS`: Standard status codes

**2. `Backend/config/db.js`** - PostgreSQL connection:
- Sequelize initialization
- Connection pooling settings
- Database authentication

**3. `Backend/config/swagger.js`** - API documentation:
- OpenAPI/Swagger spec generation
- Endpoint definitions with schemas
- Security schemes (JWT Bearer)

**4. `Backend/config/cloudinary.js`** - Image service setup:
- Cloudinary credentials
- Transformation settings

### Frontend Key Configs

**1. `Frontend/src/constants/appConstants.js`** - Frontend constants:
- `REMINDER_INTERVALS`: Time options for reminders
- `TASK_STATUS`: Task statuses (not-started, in-progress, completed)
- `STATUS_COLORS`: Color mapping for statuses
- `STORAGE_KEYS`: localStorage key names
- `API_CONFIG`: Timeout, base URL
- `AVATAR_CONFIG`: Upload constraints
- Error and success messages

**2. `Frontend/src/services/api.js`** - Axios HTTP client:
- Base URL configuration
- Request interceptor: Adds JWT token from localStorage
- Response error handling
- All API endpoint wrappers

**3. `Frontend/src/context/AuthContext.js`** - Auth state:
- User + token state
- Login/logout functions
- localStorage persistence
- Multi-tab sync via storage events

---

## API Architecture & Communication

### Frontend-Backend Communication

**HTTP Client**: Axios with auto JWT injection

```javascript
// api.js request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Error Handling Pattern**:
```javascript
const handleApiError = (error) => {
  if (error.response) {
    // Server error: 4xx, 5xx
    return {
      message: error.response.data?.error || "An error occurred",
      status: error.response.status,
    };
  } else if (error.request) {
    // Network error
    return {
      message: "No response from server. Check your connection.",
      status: 0,
    };
  }
  // Other errors
};
```

### API Request/Response Format

**Success Response**:
```json
{
  "data": { /* resource data */ },
  "message": "Operation successful"
}
```

**Error Response**:
```json
{
  "error": "Error description",
  "status": 400
}
```

### Pagination

- Default: 50 items per page
- Max limit: 100 items
- Tasks returned ordered by priority ASC

### API Documentation

- **Endpoint**: `GET /api-docs` - Swagger UI
- **Raw Spec**: `GET /openapi.json`
- **Technology**: swagger-jsdoc + swagger-ui-express

---

## Authentication & Security Patterns

### JWT Authentication

**Token Flow**:
1. User logs in → Backend generates JWT with `userId` claim
2. Frontend stores token in localStorage
3. Frontend includes token in all requests: `Authorization: Bearer <token>`
4. Backend middleware (`authMiddleware.js`) validates token
5. Token expiry: 48 hours

**Token Structure**:
```javascript
jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: AUTH_CONFIG.JWT_EXPIRATION }
)
```

### Password Security

**Hashing**:
- Algorithm: Bcrypt (bcryptjs)
- Salt rounds: 10
- Min length: 8 characters
- Stored hash in database, never plaintext

**Password Utilities** (`Backend/utils/passwordUtils.js`):
- `hashPassword()`: Hash plain password
- `comparePassword()`: Verify during login
- `validatePasswordStrength()`: Check requirements

### Rate Limiting

**Configuration** (`Backend/middleware/rateLimiter.js`):
- Auth endpoints: 5 requests per 15 minutes
- General API: 100 requests per 15 minutes
- AI endpoints: 20 requests per 15 minutes
- Returns 429 Too Many Requests when exceeded

### CORS Configuration

**Allowed Origins**:
- `https://tejanarra.github.io` (production)
- `https://task-manager-sigma-ashen.vercel.app` (staging)
- `http://localhost:3000` (local dev)

**Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS

**Headers**:
- Content-Type, Authorization, ngrok-skip-browser-warning, x-user-timezone

### OAuth Integration

**Google Login**:
- Frontend: Google OAuth code
- Backend: Exchange code for user info
- Create or update user, return JWT token

---

## Notable Features & Patterns

### 1. Email Verification
- Verification code: 6 random digits
- Expiry: 10 minutes
- Sent via Nodemailer (Gmail SMTP)
- Resend option available

### 2. Password Reset Flow
1. User requests reset via email
2. Verification code generated and emailed
3. User enters code + new password
4. Backend validates code and updates password

### 3. Task Priority Reordering
- When task created: Other tasks' priorities bumped
- When task deleted: Priorities reindexed
- Prevents gaps, maintains sequential ordering

### 4. Reminders System
- Stored as JSONB in Task model
- Types: One-time, daily, weekly
- Backend cron job checks every 5 minutes
- Frontend: Displays reminder summary, allows customization

### 5. AI Task Generation (Ollama)
- User submits prompt → AI generates task details
- Integrates with user's timezone
- Two modes:
  - Quick: Single prompt → task
  - Chat: Multi-turn conversation with history
- Model: deepseek-v3.1:671b-cloud

### 6. Avatar Upload
- Frontend: Drag-drop or click upload
- Processing: React Avatar Editor for cropping
- Backend: Multer receives file
- Storage: Cloudinary with auto-transformation
- Size limit: 5MB, formats: jpg, png, gif

### 7. Theme Support
- Light/dark mode toggle
- Preference stored in localStorage
- Applied via CSS classes on body

### 8. Drag & Drop
- Libraries: react-beautiful-dnd + @dnd-kit
- Used in: Task reordering, priority adjustment
- Both libraries available for flexibility

---

## Recent Refactoring (Phase 5)

### Frontend Refactoring

**Completed** (REFACTORING_SUMMARY.md):

1. **Centralized Constants** (`appConstants.js`):
   - All hardcoded strings moved to single file
   - Reduces duplication, easier maintenance

2. **Reusable UI Components** (`/components/common/`):
   - `FormInput`: Replace 30+ duplicate input fields
   - `AlertBanner`: Standardized alerts
   - `LoadingButton`: Loading state button
   - `ModalHeader`, `ProfileCard`: Layout components

3. **Custom Hooks** (`/hooks/`):
   - `useFormState`: Form input management
   - `useApiError`: Error handling
   - `useLoading`: Loading state
   - `usePasswordValidation`: Password strength
   - `useTaskReminders`: Reminder management
   - `useAuthCheck`: Authorization checking

4. **Component Reorganization**:
   - Feature-based structure (auth, tasks, profile, layout)
   - Shared components in common/
   - Each feature owns its styles

5. **Code Reduction**:
   - ~750-1000 lines of duplicate code eliminated
   - 30+ duplicate inputs → FormInput
   - 15+ duplicate alerts → AlertBanner
   - 10+ duplicate spinners → LoadingButton

### Backend Structure

All controllers, routes, and utilities converted to **ES6 modules** in earlier phases:
- No CommonJS `require()` statements
- All files use `import/export`
- Requires Node.js 16+ with `"type": "module"` in package.json

---

## Deployment

### Frontend Deployment
- **Platform**: GitHub Pages
- **URL**: https://tejanarra.github.io/Task-Manager
- **Process**: `npm run deploy` (uses gh-pages package)
- **Build**: Static bundle at `/build`

### Backend Deployment
- **Platform**: Vercel (production)
- **URL**: https://task-manager-sigma-ashen.vercel.app
- **Database**: PostgreSQL (managed separately)
- **Ignored files**: `.vercelignore` in root

### Environment Parity

**Development**:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

**Production**:
- Frontend: https://tejanarra.github.io/Task-Manager
- Backend: https://task-manager-sigma-ashen.vercel.app

---

## Key Files to Understand First

For a new developer joining the project, read in this order:

1. **README.md** - Project overview, setup instructions
2. **REFACTORING_SUMMARY.md** (Frontend) - Recent architectural changes
3. **Backend/constants/config.js** - All backend constants
4. **Frontend/src/constants/appConstants.js** - All frontend constants
5. **Backend/server.js** - Express app setup
6. **Frontend/src/App.js** - React routing setup
7. **Backend/models/User.js & Task.js** - Database schema
8. **Frontend/src/context/AuthContext.js** - Auth state management
9. **Frontend/src/services/api.js** - HTTP client
10. **Backend/middleware/authMiddleware.js** - JWT verification
11. **Backend/routes/taskRoutes.js** - Task API endpoints

---

## Common Development Tasks

### Adding a New API Endpoint

1. Define route in `Backend/routes/*.js`
2. Add controller function in `Backend/controllers/*.js`
3. Export from API service in `Frontend/src/services/api.js`
4. Call in Frontend component using the exported function
5. Handle errors with `useApiError()` hook

### Adding a New Component

1. Create file in appropriate `components/` folder
2. Use reusable components from `common/`
3. Use custom hooks from `hooks/`
4. Import constants from `appConstants.js`
5. Use utilities from `utils/`

### Adding Database Field

1. Update model in `Backend/models/*.js`
2. Update validation in `Backend/constants/config.js`
3. Run database migration (if using migrations)
4. Update API response handling in Frontend

### Running Tests

**Backend**:
```bash
cd Backend
npm test              # Single run
npm test:watch       # Watch mode
npm test:coverage    # Coverage report
```

**Frontend**:
```bash
cd Frontend
npm test              # Interactive mode
# Press 'a' for all tests, 'q' to quit
```

---

## Architecture Decision Record

### Why PostgreSQL + Sequelize?
- Relational data model (Users ↔ Tasks)
- Built-in data validation
- JSONB support (for reminders)
- ORM provides type safety

### Why Context API instead of Redux/Zustand?
- Simple auth-only state requirement
- Reduces bundle size
- Adequate for current application scope

### Why ES6 Modules (not CommonJS)?
- Future-proof (ESM is JavaScript standard)
- Better tree-shaking
- Improved performance
- Node.js increasingly ESM-focused

### Why Separate Frontend/Backend (not Next.js)?
- Independent scaling (Frontend: static, Backend: compute)
- Independent deployment
- Better separation of concerns
- Flexibility in framework choices

---

## Known Issues & TODOs

### Frontend
- [ ] Add TypeScript for type safety
- [ ] Add PropTypes validation
- [ ] Create Storybook for UI components
- [ ] Add E2E tests (Cypress/Playwright)
- [ ] Improve mobile responsiveness
- [ ] Add dark mode CSS improvements

### Backend
- [ ] Add API rate limiting for authenticated endpoints
- [ ] Implement pagination for task listings
- [ ] Add database transaction logging
- [ ] Implement task audit trail
- [ ] Add API versioning (/v1/, /v2/)

### DevOps
- [ ] Setup CI/CD pipeline (GitHub Actions)
- [ ] Add database backups
- [ ] Monitor error logs (Sentry)
- [ ] Performance monitoring (New Relic)

---

## Useful Links & Resources

- **Frontend Docs**: [React 19](https://react.dev), [React Router 6](https://reactrouter.com), [react-easy-crop](https://github.com/ValentinH/react-easy-crop)
- **Backend Docs**: [Express 5](https://expressjs.com), [Sequelize](https://sequelize.org)
- **Database**: [PostgreSQL](https://postgresql.org), [pgAdmin](https://pgadmin.org)
- **Testing**: [Jest](https://jestjs.io), [React Testing Library](https://testing-library.com)
- **API Docs**: Swagger UI at `/api-docs` (when backend running)
- **AI/LLM**: [Ollama](https://ollama.com)

---

## Git Workflow

**Main Branch**: `main` (production-ready code)
**Feature Branch**: `claude-code` (active development)

**Common Commands**:
```bash
git status                    # Check current status
git checkout main             # Switch to main
git checkout claude-code      # Switch to feature branch
git pull --rebase             # Update current branch
git push                      # Push changes
git log --oneline --graph     # View commit history
```

See **GIT_REFERENCE.md** for detailed Git guide.

---

## Last Updated

- **Documentation**: 2025-10-30
- **Latest Commit**: Phase 5 - Comprehensive testing infrastructure
- **Node Version**: 16+ (for ES6 modules)
- **Status**: Active Development

---

## Questions?

Refer to:
1. README.md for project overview
2. REFACTORING_SUMMARY.md for recent changes
3. Component files for implementation details
4. Backend/constants/config.js for all configuration values
5. API Docs at `/api-docs` endpoint when backend is running
