# Task Manager - Complete Application Documentation

## Table of Contents
1. [Overview](#overview)
2. [Core Features](#core-features)
3. [User Management & Authentication](#user-management--authentication)
4. [Task Management](#task-management)
5. [Reminder System](#reminder-system)
6. [AI Features](#ai-features)
7. [User Interface Components](#user-interface-components)
8. [Mobile Responsiveness](#mobile-responsiveness)
9. [Technical Architecture](#technical-architecture)
10. [API Endpoints](#api-endpoints)
11. [Tech Stack](#tech-stack)

---

## Overview

**Task Manager** is a full-stack React-based web application designed for personal productivity and task management. It combines traditional task management with AI-powered features to help users create, organize, and track tasks efficiently.

- **Deployment**: https://taskmanager.tejanarra.space
- **Backend**: https://api.taskmanager.tejanarra.space
- **Framework**: React 18.3.1
- **UI Library**: Bootstrap 5.3.3

---

## Core Features

### Task Management Core
- ✅ **Create Tasks** - Create new tasks with title, description, status, and deadline
- ✅ **Edit Tasks** - Full inline and dedicated editing capabilities
- ✅ **Delete Tasks** - Remove tasks with confirmation modal
- ✅ **Task Status Tracking** - Three status options: "Not Started", "In Progress", "Completed"
- ✅ **Drag & Drop Priority** - Reorder tasks to set priorities
- ✅ **Deadline Management** - Set task deadlines with date/time picker
- ✅ **Task Display** - Task cards showing title, description, creation date, and deadline

### Reminder System
- ⏰ **One-time Reminders** - Set specific reminders at 1 hour, 1 day, or 1 week before deadline
- 🔄 **Recurring Reminders**
  - Daily reminders (automatically generates up to deadline)
  - Weekly reminders (automatically generates up to deadline)
- 📅 **Custom Reminders** - Add custom reminder dates/times via datetime picker
- ✨ **Smart Validation** - Ensures reminders are before deadline and in the future
- 🎯 **Reminder UI** - Collapsible reminder section with visual badge counting active reminders

### AI Features
- 🤖 **AI Task Generation (Quick Mode)**
  - Natural language prompts to generate tasks
  - Example: "Schedule dentist appointment next Tuesday at 3pm"
  - Automatically extracts title, description, status, deadline, and reminders
  - Suggestion chips for quick task creation

- 💬 **AI Chat Mode**
  - Multi-turn conversation with AI assistant
  - Chat history persistence using localStorage
  - AI can suggest task creation, updates, or deletions
  - Inline task previews for AI-suggested changes
  - "Generate Task from Chat" functionality

---

## User Management & Authentication

### Registration Flow
1. User fills registration form (first name, last name, email, password)
2. Backend sends verification code to email
3. User enters verification code
4. Account created and user logged in

### Login Options
- **Email & Password** - Traditional login with credentials
- **Google OAuth** - One-tap Google authentication (Firebase OAuth)

### Password Management
- **Forgot Password** - Email-based password reset flow with verification code
- **Change Password** - Authenticated users can change password in profile settings

### Security Features
- JWT token-based authentication
- Token stored in localStorage
- Automatic logout on 403 Forbidden responses
- Session management across tabs
- Protected routes for authenticated users

---

## Task Management

### Task Properties
```javascript
{
  id: string,
  title: string,
  description: string,
  status: "not-started" | "in-progress" | "completed",
  deadline: ISO8601 string | null,
  reminders: Array<{
    remindBefore: number (hours),
    sent: boolean,
    type: "one-time" | "daily" | "weekly",
    customDate?: ISO8601 string,
    dayNumber?: number,  // For daily
    weekNumber?: number  // For weekly
  }>,
  priority: number (1 = highest),
  createdAt: ISO8601 string,
  updatedAt: ISO8601 string
}
```

### Task Operations
- **Create**: Add new tasks with all properties
- **Read**: View task list and individual task details
- **Update**: Edit any task field
- **Delete**: Remove tasks with confirmation
- **Reorder**: Drag and drop to change priority

### Drag & Drop Features (using @dnd-kit)
- Desktop: Mouse-based dragging with 10px activation constraint
- Mobile: Touch-based with 200ms delay and 5px tolerance
- Visual feedback: Scale transform and shadow on drag
- Priority updates: Automatically synced to backend after reorder
- Shimmer loading state while tasks load

---

## Reminder System

### Reminder Types

#### One-time Reminders
- Pre-defined options: 1 hour, 1 day, 1 week before deadline
- Custom date/time selection via datetime picker

#### Recurring Reminders
- **Daily Reminders**: Automatically generates reminders for each day leading up to deadline
- **Weekly Reminders**: Automatically generates reminders for each week leading up to deadline

### Reminder Features
- **Normalization**: Automatic calculation of reminder hours before deadline
- **Validation**: Ensures reminders are:
  - Before the task deadline
  - In the future (not in the past)
- **Visual Indicators**: Badge showing count of active reminders
- **Collapsible UI**: Save space with expandable reminder section
- **Mixed Types**: Support for combining one-time, daily, weekly, and custom reminders

---

## AI Features

### Quick Mode (One-shot Task Generation)
- Single-turn AI task generation
- Takes natural language description
- Outputs: complete task with title, description, status, deadline, reminders
- Suggestion chips with pre-filled examples:
  - "Create a task to review project documentation by Friday at 3pm"
  - "Schedule dentist appointment next Tuesday at 3pm"
  - "Plan weekly team meeting every Monday at 10am"
- Enter key shortcut (Shift+Enter for newline in textarea)

### Chat Mode (Multi-turn Conversation)
- Multi-turn conversation history
- Persistent chat history using localStorage (`ai_chat_history` key)
- AI responses can include:
  - Text replies and suggestions
  - Task creation suggestions
  - Task update suggestions
  - Task deletion suggestions
- Inline task preview with confirm/cancel buttons
- "Generate Task from Chat" aggregates conversation into task
- Clear chat history button
- Typing indicator while AI responds
- WhatsApp-style message UI

### Timezone Support
- Client sends timezone via `x-user-timezone` header
- Helps backend calculate deadline/reminder times accurately based on user location

---

## User Interface Components

### Pages & Routes

| Route | Component | Type | Description |
|-------|-----------|------|-------------|
| `/` | LandingPage | Public | Marketing landing page |
| `/login` | Login | Public | User login form |
| `/register` | Register | Public | User registration form |
| `/forgot-password` | ForgotPassword | Public | Password reset flow |
| `/tasks` | TaskList | Private | Main task dashboard |
| `/tasks/:taskId/edit` | TaskEditor | Private | Task creation/editing |
| `/profile-overview` | ProfileOverview | Private | User profile display |
| `/edit-profile` | EditProfile | Private | Profile editing with avatar |
| `/change-password` | ChangePassword | Private | Password change form |

### Key Components

#### Navigation
- **Navbar** - Top navigation with theme toggle, user avatar, and links
- **Footer** - Footer component with links and info

#### Task Components
- **TaskList** - Main dashboard with drag-and-drop task sorting
- **TaskEditor** - Dedicated editor page for tasks
- **TaskCard** - Task card display with metadata
- **TaskItem** - Editable inline task component
- **TaskReminders** - Reminder configuration UI
- **ReminderCheckbox** - Individual reminder checkbox

#### Profile Components
- **ProfileOverview** - User profile display with logout
- **EditProfile** - Avatar upload with crop/rotate and profile editing
- **Avatar Editor** - Image crop and rotate with scale controls

#### AI Components
- **AIChatModal** - Main modal container for AI features
- **QuickMode** - One-shot AI task generation
- **ChatMode** - Multi-turn conversation mode
- **ChatMessage** - WhatsApp-style message display
- **TaskPreviewModal** - Task preview/edit modal for AI suggestions

#### Landing Page
- **LandingPage** - Main landing page
- **FeaturesSection** - Features showcase
- **BenefitsSection** - Benefits section
- **TestimonialsSection** - User testimonials
- **DemoSection** - Interactive demo

---

## Mobile Responsiveness

### Responsive Design Features
- Bootstrap 5 grid system (col-12, col-md-6, etc.)
- Flexbox layouts for mobile-first design
- Breakpoint-aware button grouping (hides button text on mobile)

### Mobile Touch Optimizations
- `@dnd-kit` TouchSensor with 200ms delay and 5px tolerance
- `touch-action: manipulation` to prevent scroll issues during drag
- Modal overlays that respond to touch
- Input fields with larger touch targets
- Reduced Pointer/Mouse sensor distance for precision

### Mobile-Specific Features
- Collapsible reminder section to save space
- Inline task editing without separate page navigation
- Simplified navigation in limited screen space
- Responsive form layouts
- Stack vertical buttons on small screens
- Avatar display optimization

---

## Technical Architecture

### State Management

#### Context API
- **AuthContext** - User authentication state, login/logout functions
- Provides `useAuth()` custom hook
- Syncs across tabs using storage event listener

#### Component-Level State
- React useState for component-specific states
- useCallback for optimized callback functions
- useRef for DOM element access (avatar editor, chat scroll)
- useEffect for side effects and data loading

#### Local Storage Usage
```javascript
token              // JWT authentication token
userInfo           // User profile information (JSON)
theme              // Light/Dark mode preference
ai_chat_mode       // Last used AI mode (quick/chat)
ai_chat_history    // Multi-turn chat history (JSON array)
```

### Theme System
- Light and Dark mode toggle via navbar button
- CSS custom properties for theme variables
- Smooth 0.3s transition between themes
- Theme persistence via localStorage
- Applied to all components with dynamic class binding

### Error Handling
- Centralized error handler with message and status extraction
- Handles network errors, timeouts, and response errors
- User-friendly error messages
- 403 status triggers automatic logout
- Confirmation modals for destructive actions

### Performance Optimizations
- Code splitting with lazy loading (React.lazy)
- Suspense boundaries with loading UI
- Optimized re-renders with useCallback
- Image optimization for avatars
- Skeleton loaders for async data (tasks, profile)
- Debounced form inputs (Bootstrap native)

---

## API Endpoints

### Base URL
- Production: `https://api.taskmanager.tejanarra.space/api`
- Local: `http://localhost:5001/api`

### Authentication Endpoints
```
POST   /auth/login
POST   /auth/google
POST   /auth/register
POST   /auth/verify-registration
POST   /auth/resend-verification
POST   /auth/forgot-password
POST   /auth/verify-code
POST   /auth/change-password
GET    /verify-token
```

### Task Endpoints
```
GET    /tasks
GET    /tasks/:taskId
POST   /tasks
PUT    /tasks/:taskId
DELETE /tasks/:taskId
PUT    /tasks/:taskId/priority
```

### Profile Endpoints
```
GET    /profile
PUT    /profile (multipart/form-data for avatar)
```

### AI Endpoints
```
POST   /ai/chat
POST   /ai/chat-conversation
```

### API Features
- JWT token automatically added to all requests via axios interceptor
- 30-second timeout for all API calls
- Timezone header (`x-user-timezone`) for accurate date/time handling
- Error response handling with status codes

---

## Tech Stack

### Frontend Framework
- React 18.3.1
- React Router DOM 6.28.0
- React Scripts 5.0.1

### UI & Styling
- Bootstrap 5.3.3
- Custom CSS with CSS variables
- Lucide React (icons)
- React Avatar Editor 13.0.2

### State & Data Management
- Axios 1.12.0 (HTTP client)
- Context API (state management)
- LocalStorage (persistence)

### Drag & Drop
- @dnd-kit/core 6.3.1
- @dnd-kit/sortable 10.0.0
- @dnd-kit/modifiers 9.0.0
- @dnd-kit/utilities

### Authentication
- @react-oauth/google 0.12.1
- JWT tokens (backend-issued)

### Date Handling
- date-fns 4.1.0

### Testing
- @testing-library/react 13.4.0
- @testing-library/jest-dom 5.17.0
- @testing-library/user-event 13.5.0

### Build & Deployment
- gh-pages 6.3.0 (GitHub Pages deployment)

---

## Notable Features

### Avatar Management
- Avatar Editor with crop and rotate capabilities
- Image upload with file preview
- Scale (1x - 2x zoom) and rotation (0-360°) controls
- Converts to JPEG blob for backend submission
- Base64 encoding for display in localStorage

### Accessibility Features
- Semantic HTML (nav, main, section)
- ARIA labels (aria-label, aria-pressed)
- Bootstrap accessibility classes
- Keyboard navigation support
- Form labels properly associated with inputs

### User Experience Enhancements
- Confirmation modals for destructive actions
- Form validation (required fields, password matching)
- Error alerts with user-friendly messages
- Skeleton loaders with shimmer animation
- Empty states for no tasks
- Typing indicators in chat
- Visual feedback for all actions

---

## File Structure

```
Frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── AIChatModal/
│   │   │   ├── AIChatModal.js
│   │   │   ├── QuickMode.js
│   │   │   ├── ChatMode.js
│   │   │   ├── ChatMessage.js
│   │   │   ├── TaskPreviewModal.js
│   │   │   └── Styles/
│   │   ├── taskItem/
│   │   │   ├── TaskCard.js
│   │   │   ├── TaskItem.js
│   │   │   ├── TaskReminders.js
│   │   │   ├── ReminderCheckbox.js
│   │   │   └── Styles/
│   │   ├── landingPage/
│   │   │   ├── LandingPage.js
│   │   │   ├── FeaturesSection.js
│   │   │   ├── BenefitsSection.js
│   │   │   ├── TestimonialsSection.js
│   │   │   ├── DemoSection.js
│   │   │   ├── data.js
│   │   │   └── Styles/
│   │   ├── TaskList.js
│   │   ├── TaskEditor.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── ForgotPassword.js
│   │   ├── ChangePassword.js
│   │   ├── ProfileOverview.js
│   │   ├── EditProfile.js
│   │   ├── VerificationForm.js
│   │   ├── Navbar.js
│   │   ├── footer.js
│   │   ├── ConfirmationModal.js
│   │   └── ErrorBoundary.js
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── PrivateRoute.js
│   │   └── PublicRoute.js
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   ├── dateUtils.js
│   │   ├── reminderHelpers.js
│   │   └── imageUtils.js
│   ├── assets/
│   ├── Styles/
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

---

## Summary

This Task Manager represents a production-ready application with enterprise-level features including:

- 🔐 Complete authentication system with email verification and OAuth
- 📋 Comprehensive task management with drag-and-drop prioritization
- ⏰ Advanced reminder system with one-time, daily, weekly, and custom reminders
- 🤖 AI-powered task generation with both quick and conversational modes
- 📱 Fully responsive mobile interface with touch optimizations
- 👤 User profile management with avatar editing
- 🎨 Theme support (light/dark mode)
- ♿ Accessibility features and semantic HTML
- ⚡ Performance optimizations with lazy loading and skeleton loaders
- 🌍 Timezone-aware date/time handling

The codebase demonstrates modern React patterns while maintaining simplicity through focused component architecture and Context API state management.
