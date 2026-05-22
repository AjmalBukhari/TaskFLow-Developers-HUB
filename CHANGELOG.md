# Changelog

All notable changes to TaskFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.0.0] - 2026-05-20

### Added
- Analytics Dashboard with Recharts
  - Overview statistics (total, completed, pending, overdue, due today, shared)
  - Completion rate percentage
  - Weekly and monthly trend bar charts
  - Status distribution pie chart
  - Priority distribution pie chart
  - Weekly/monthly summary cards
- Analytics backend endpoints
  - `GET /api/analytics/overview` - Aggregated statistics
  - `GET /api/analytics/trends` - Trend data with MongoDB aggregation
- File attachment system
  - `POST /api/uploads/:id/attachments` - Upload files to tasks
  - `DELETE /api/uploads/:taskId/attachments/:attachmentId` - Remove attachments
  - Multer middleware for file handling
  - 10MB file size limit
  - File type validation (images, PDFs, documents)
- `.env.example` template for backend
- Backend `.gitignore` file
- Analytics page in sidebar navigation

### Fixed
- **Critical:** `getAllTasks` search filter bug where `$or` operator was overwritten, breaking user ownership checks
- Search now properly combines with status and priority filters using `$and`
- Notification context delete using raw fetch instead of API service

### Changed
- Added `priority` query parameter support to task filtering
- Sidebar menu order: Dashboard, All Tasks, Add Task, Analytics, Bin Task, Profile
- Updated README with complete documentation

### Security
- Proper authorization checks maintained for all new endpoints
- File upload validation prevents malicious file types
- Ownership verification for attachment management

---

## [1.0.0] - 2026-05-15

### Added
- Full-stack task management application
- **Backend:**
  - Node.js + Express 5 API server
  - MongoDB + Mongoose 9 integration
  - JWT authentication system
  - Task CRUD operations
  - Soft delete with bin system (7-day TTL)
  - Task sharing with other users
  - Real-time notifications via Socket.IO
  - express-validator input validation
  - Centralized error handling
- **Frontend:**
  - React 19 SPA
  - Tailwind CSS 3 styling
  - Framer Motion animations
  - Axios HTTP client
  - Socket.IO real-time client
  - Dark mode with persistence
  - Responsive design
  - Task list with pagination
  - Search with debounce
  - Status and priority filters
  - Bulk select and delete
  - Progress bar component
  - Toast notifications
  - Confirmation modals
  - Share modal
  - Dashboard with stats
  - Profile and account pages
  - Forgot password page

### Features
- User registration and login
- Task creation with title, description, status, priority, due date, pin
- Task editing and deletion
- Soft delete with 7-day auto-cleanup
- Task restore from bin
- Permanent task deletion
- Task sharing by user ID
- Shared task viewing
- Real-time notifications
- Search across title and description
- Filter by status
- Pagination (7 items per page)
- Dark/light mode toggle
- Responsive mobile design
- Account management (update, delete)
- Password change and reset
