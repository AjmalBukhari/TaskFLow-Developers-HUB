# Phase 1 Report - Task Manager Implementation

## Overview

Phase 1 covers Weeks 1-3: Backend setup, Frontend implementation, and Advanced Features including authentication, search/filter, and progress tracking.

## Backend Implementation

### Week 1 - Core Backend

**Technology Stack:**
- Node.js with Express 5
- MongoDB with Mongoose 9
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation

**Database Models:**
- **User Model** - fullname, email, password (hashed), pre-save hook for hashing, comparePassword method
- **Task Model** - title, description, status, priority, dueDate, pinned, user (owner), sharedWith, attachments, isDeleted (soft delete), deletedAt (TTL index for 7-day auto-delete)
- **Notification Model** - recipient, message, taskId, read status, type, indexed for efficient querying

**REST API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create new task |
| GET | `/api/tasks` | Get all tasks (with search/filter) |
| GET | `/api/tasks/:id` | Get single task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Soft delete task |

**Validation:**
- express-validator middleware for task creation
- Title required, max 100 chars
- Status must be one of: Pending, In Progress, Completed
- Due date must be ISO8601 format

**Error Handling:**
- Centralized error handler middleware
- Custom AppError utility for consistent error responses
- Proper HTTP status codes (400, 401, 403, 404, 500)

### Week 2 - Frontend

**Technology Stack:**
- React 19
- Tailwind CSS 3 for styling
- Framer Motion for animations
- Axios for HTTP requests
- React Router DOM 7 for navigation

**Components:**
- **Auth** - Login/Register form with toggle
- **TaskForm** - Create/Edit task form with all fields
- **SearchBar** - Search input with debouncing, status filter dropdown
- **ProgressBar** - Visual progress indicator with animation
- **MainLayout** - App shell with Sidebar and Header
- **Sidebar** - Navigation menu with active state indicator
- **Header** - App header with search, notifications, theme toggle, user menu
- **Toast** - Notification toasts with auto-dismiss
- **ConfirmModal** - Confirmation dialog for destructive actions
- **ShareModal** - Modal for sharing tasks with users

**Pages:**
- **Dashboard** - Overview stats, progress bar, recent tasks
- **AllTasks** - Full task list with search, filter, pagination, bulk operations
- **AddTask** - Task creation form
- **BinTask** - Soft-deleted tasks with restore/permanent delete
- **Profile** - User profile information
- **Account** - Account settings with update and delete
- **ForgotPassword** - Password reset form

**CRUD Functionality:**
- Full create, read, update, delete operations
- Soft delete with bin system
- Restore from bin
- Permanent deletion
- Bulk select and delete

**Responsive Design:**
- Mobile-first approach with Tailwind
- Responsive grid layouts
- Adaptive navigation
- Touch-friendly controls

### Week 3 - Advanced Features

**Authentication System:**
- JWT-based authentication
- Token stored in localStorage
- Axios interceptor for automatic token attachment
- 401 response handling with automatic logout
- Protected routes with auth middleware
- Password hashing with bcrypt (10 rounds)
- Current password verification for account deletion

**Search & Filter:**
- Real-time search with 400ms debounce
- Search across title and description
- Status filter (Pending, In Progress, Completed)
- Combined search + filter support
- Case-insensitive regex search

**Progress Tracking:**
- ProgressBar component with animated fill
- Completion percentage calculation
- Color-coded progress (yellow < 50%, blue >= 50%, green = 100%)
- Completed vs total task display

**Performance Optimizations:**
- useCallback for memoized functions
- useEffect cleanup for timers
- Pagination for task lists (7 items per page)
- Debounced search to reduce API calls
- Conditional rendering for loading states

**Basic Testing:**
- Jest and Supertest installed for backend testing
- React Testing Library installed for frontend testing

## Challenges Faced

### 1. Search Filter Bug
**Problem:** The initial `getAllTasks` implementation overwrote the `$or` operator when search was applied, breaking user ownership filtering and potentially exposing other users' tasks.

**Solution:** Restructured the query to use `$and` for additional filters while preserving the base `$or` for ownership checks.

### 2. Soft Delete TTL Index
**Problem:** Needed automatic cleanup of deleted tasks after 7 days.

**Solution:** Used MongoDB TTL index on `deletedAt` field with `expires: '7d'`. Tasks with `isDeleted: true` are automatically removed.

### 3. Real-time State Sync
**Problem:** Keeping frontend state in sync with backend changes.

**Solution:** Implemented Socket.IO service with React hooks for real-time event listening. Toast notifications provide immediate feedback.

## Solutions Implemented

1. **Centralized API Service** - All API calls in single `api.js` file with Axios instance, interceptors, and error handling
2. **Socket Service Singleton** - Single Socket.IO connection managed across components
3. **Context Providers** - Theme and Notification contexts for global state
4. **Reusable Components** - TaskForm, ConfirmModal, ShareModal used across multiple pages
5. **Consistent Error Handling** - Backend uses centralized error handler, frontend shows toast notifications
6. **Security** - JWT authentication, password hashing, authorization checks on all protected routes

## Testing Summary

- Backend: Jest + Supertest configured
- Frontend: React Testing Library configured
- Manual testing completed for all CRUD operations
- Authentication flow tested end-to-end
- Search and filter functionality verified
- Pagination working correctly
- Soft delete and restore verified
- Dark mode toggle persistent across sessions
