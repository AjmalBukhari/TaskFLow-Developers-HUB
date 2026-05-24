# TaskFlow - Full Stack Task Management System

A modern, full-featured task management application built with **React 19, Node.js, Express 4, and Supabase (PostgreSQL)**. Features JWT authentication, real-time collaboration, analytics dashboard, dark mode, file attachments, and more.

---

## Phase 1: Core Task Management

> **Objective:** Build a complete task management system with CRUD operations, authentication, search/filter, and progress tracking.

### Backend Development

**Tech Stack:**
- **Runtime:** Node.js with Express 4
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT + bcryptjs
- **Validation:** express-validator

**API Endpoints Built:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks` | Fetch all tasks (with search/filter) |
| GET | `/api/tasks/:id` | Fetch single task by ID |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Soft delete a task |

**Database Schema (`tasks` table):**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| title | TEXT | Task title |
| description | TEXT | Task description |
| status | TEXT | Pending / In Progress / Completed |
| priority | TEXT | Low / Medium / High |
| dueDate | TIMESTAMPTZ | Due date |
| user_id | UUID (FK → users) | Owner |
| isDeleted | BOOLEAN | Soft delete flag |
| createdAt | TIMESTAMPTZ | Auto-generated |
| updatedAt | TIMESTAMPTZ | Auto-generated |

**Error Handling:** Graceful error responses with proper HTTP status codes across all endpoints.

### Frontend Development

**Tech Stack:**
- **UI Library:** React 19
- **Routing:** React Router DOM 7
- **Styling:** Tailwind CSS 3
- **HTTP Client:** Axios
- **Animations:** Framer Motion

**Components Built:**
- **TaskList (`AllTasks.jsx`)** — Displays all tasks with pagination, bulk selection, and inline edit/delete/share actions
- **TaskForm (`TaskForm.jsx`)** — Create and edit tasks with title, description, status, priority, due date, and pin toggle
- **Task Details** — Inline editing via modal overlay
- **Search Bar (`SearchBar.jsx`)** — Real-time search by title/description with status filter dropdown

**API Integration:**
- Axios instance with interceptors for JWT token injection and 401 auto-redirect
- Full CRUD operations connected to backend endpoints

**Responsive Design:**
- Mobile-first approach using Tailwind CSS
- Works seamlessly on desktop, tablet, and mobile

### Advanced Features & Polish

**Authentication System:**
- **Register/Login** — JWT-based with bcrypt password hashing
- **Token Management** — Token stored in localStorage, sent via Authorization header
- **Protected Routes** — Server-side middleware validates all authenticated requests
- **Password Reset** — Forgot password flow with direct reset
- **Account Management** — Update profile, change password, delete account

**Search & Filters:**
- Debounced search (400ms) for real-time filtering by title and description
- Status filter dropdown (All / Pending / In Progress / Completed)
- Combined with server-side query for efficient results

**Progress Tracking:**
- **ProgressBar** — Visual indicator showing percentage of completed tasks
- **Dashboard cards** — Total, completed, pending, overdue, due today counts
- **Completion rate** — Percentage display across the UI

**Bin System (Soft Delete):**
- Tasks move to bin instead of permanent deletion
- Restore tasks from bin
- Permanent delete with foreign key cleanup (notifications cascade)
- Bin view with restore/permanent-delete actions

---

## Phase 2: Feature Expansion, Analytics & Deployment

> **Objective:** Add collaborative features, analytics dashboard, deployment, and final polish.

### Collaborative Features & Real-Time Notifications

**User Collaboration (Task Sharing):**
- **Share by Copy** — When a task is shared, a new independent copy is created for the recipient
- Each user owns their copy — can edit, delete, and manage independently
- Original owner's task remains unchanged
- Duplicate sharing detection prevents multiple copies

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/tasks/:id/share` | Share task with users (creates copies) |
| GET | `/api/tasks/shared` | Retrieve tasks shared with user |

**Real-Time Notifications (Socket.IO):**
- Notify users in real-time when a task is shared with them
- Notify when a task's status is updated
- Notification history with read/unread tracking

**Frontend Integration:**
- **ShareModal** — Enter user IDs to share tasks
- **Notification dropdown** — Header bell icon with unread count badge
- **Notifications page** — Full history with mark-as-read and clear-all
- **Real-time toast** — Popup notifications for incoming events

### Advanced Analytics & Reporting

**Analytics Dashboard:**
- **Overview Stats:** Total, completed, pending, in-progress, high priority, overdue, due today, shared tasks, completion rate
- **Interactive Pie Chart:** Status breakdown with hover tooltips and active sector highlighting
- **Bar Charts:** Weekly and monthly trends (created vs completed)
- **Summary Cards:** Weekly/monthly creation and completion counts

**Backend Analytics Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | Summary statistics |
| GET | `/api/analytics/trends` | Weekly/monthly trends data |

**Visualization:**
- Recharts library for all charts
- Dark mode compatible chart themes
- Responsive containers adapting to screen size

### Deployment & Final Enhancements

**Deployment (Vercel):**
- **Frontend:** Static build deployed via Vercel
- **Backend:** Express 4 server deployed as Vercel serverless function
- **Single URL:** Frontend serves on root, API routes under `/api/*`
- **Environment Variables:** Configured in Vercel dashboard

**Setup:**
```bash
# Backend
cd backend
npm install
# Create .env with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
npm start

# Frontend
cd frontend
npm install
npm start
```

**Environment Variables:**
| Variable | Description | Required |
|----------|-------------|----------|
| SUPABASE_URL | Supabase project URL | Yes |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | Yes |
| JWT_SECRET | Secret for signing JWT tokens | Yes |
| PORT | Server port (default: 5000) | No |

**Dark Mode:**
- Toggle between light and dark themes
- Theme preference persisted in localStorage
- Respects system `prefers-color-scheme` on first visit
- Smooth transitions across all components

**File Attachments:**
- Upload images, PDFs, documents (jpeg, jpg, png, gif, pdf, doc, docx, xls, xlsx, txt, zip)
- 10MB file size limit
- Uses multer memory storage for Vercel compatibility

**Mobile Responsiveness:**
- All pages tested and optimized for mobile
- Collapsible sidebar, responsive grids, touch-friendly controls

---

## API Endpoints (Complete)

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current profile | Yes |
| PUT | `/api/auth/me` | Update profile (name, email, password) | Yes |
| PUT | `/api/auth/me/password` | Update password with current verification | Yes |
| DELETE | `/api/auth/me` | Delete account (with password confirmation) | Yes |

### Tasks
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/tasks` | Create task | Yes |
| GET | `/api/tasks` | List tasks (search, status, priority filters) | Yes |
| GET | `/api/tasks/:id` | Get single task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Soft delete (move to bin) | Yes |
| GET | `/api/tasks/bin` | List bin tasks | Yes |
| PUT | `/api/tasks/restore/:id` | Restore from bin | Yes |
| DELETE | `/api/tasks/permanent/:id` | Permanently delete | Yes |
| PUT | `/api/tasks/:id/share` | Share task (creates copy for recipients) | Yes |
| GET | `/api/tasks/shared` | Get tasks shared by current user | Yes |

### Notifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | List notifications | Yes |
| PUT | `/api/notifications/:id/read` | Mark single as read | Yes |
| PUT | `/api/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/api/notifications/:id` | Delete single notification | Yes |
| DELETE | `/api/notifications/clear-all` | Clear all notifications | Yes |
| GET | `/api/notifications/unread-count` | Get unread count | Yes |

### Analytics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/analytics/overview` | Dashboard statistics | Yes |
| GET | `/api/analytics/trends` | Trend data for charts | Yes |

### Uploads
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/uploads/:id/attachments` | Upload file attachment | Yes |
| DELETE | `/api/uploads/:taskId/attachments/:attachmentId` | Remove attachment | Yes |

---

## Authentication Flow

1. User registers with fullname, email, password
2. Password is hashed with bcrypt (salt rounds: 10) before storing in Supabase
3. On login, credentials verified against hashed password
4. JWT token generated and returned to client
5. Token stored in localStorage on frontend
6. All API requests include token in `Authorization: Bearer <token>` header
7. Backend middleware validates token on every protected route
8. Auto-logout on 401 response via Axios interceptor

---

## Socket.IO Events

### Server → Client
| Event | Payload | Trigger |
|-------|---------|---------|
| `new_notification` | `{ message, type, taskId }` | Task shared, status updated |
| `task_created` | `{ id, title, ... }` | New task created |
| `task_updated` | `{ id, title, status, ... }` | Task updated |
| `task_deleted` | `taskId` | Task moved to bin |
| `task_restored` | `taskId` | Task restored from bin |
| `task_permanently_deleted` | `taskId` | Task permanently deleted |

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `userId` | Join user's notification room |

---

## Folder Structure

```
task-manager/
├── backend/
│   ├── config/              # Supabase client and app config
│   ├── controllers/         # Route handlers
│   ├── middleware/          # JWT auth and validation middleware
│   ├── routes/              # Express route definitions
│   ├── services/            # Socket.IO initialization
│   ├── utils/               # Error handling utilities
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── server.js            # Entry point
├── frontend/
│   ├── public/              # Static assets (index.html, favicon, manifest)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # Header, Sidebar, MainLayout
│   │   │   ├── pages/       # Dashboard, AllTasks, AddTask, BinTask,
│   │   │   │                # Analytics, Account, Profile, Notifications
│   │   │   └── ui/          # Toast, ConfirmModal, ShareModal
│   │   ├── context/         # ThemeContext, NotificationContext
│   │   ├── services/        # api.js (Axios), socketService.js
│   │   ├── App.jsx          # Root component with routing
│   │   ├── index.js         # React DOM entry
│   │   └── index.css        # Tailwind directives
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── package.json             # Root Vercel build script
├── vercel.json              # Vercel deployment config
├── .vercelignore
└── README.md
```

---

## Deployment (Vercel)

### Prerequisites
1. GitHub account with repository pushed
2. Vercel account (vercel.com)
3. Supabase project (supabase.com)

### Steps
1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "initial commit"
   git push
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com) → Add New Project
   - Import your GitHub repository
   - Vercel auto-detects the monorepo config from `vercel.json`

3. **Set environment variables in Vercel dashboard:**
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Deploy:**
   - Vercel builds frontend via root `package.json` build script
   - Deploys `backend/server.js` as serverless function
   - Routes `/api/*` → backend, everything else → frontend SPA

### Limitations (Graceful Degradation on Serverless)
- **Socket.IO** — Real-time notifications won't work on Vercel's serverless infrastructure (no persistent WebSocket connections). Falls back silently.
- **File Uploads** — Uses multer memory storage (no disk writes) to avoid read-only filesystem errors. File data persists only in memory for the request lifecycle.
- **Everything else** (CRUD, auth, analytics, sharing) works normally.

### Local Development
```bash
# Backend (terminal 1)
cd backend
npm install
npm start          # Runs on http://localhost:5000

# Frontend (terminal 2)
cd frontend
npm install
npm start          # Runs on http://localhost:3000
```

---

## Screenshots

*[Add screenshots here]*

- Login / Register screen
- Dashboard with task statistics
- All Tasks view with search filter and pagination
- Analytics Dashboard with pie charts and bar charts
- Dark mode toggle
- Mobile responsive view
- Share task modal
- Notifications panel

---

## Links

- **GitHub Repository:** https://github.com/AjmalBukhari/taskflow-developerhub-final100
- **Live Deployment:** https://taskflow-developerhub-final100.vercel.app

---

## Deliverables

- **Phase 1 Deadline:** 28 April, 2026
- **Phase 2 Deadline:** 25 May, 2026 — 11:59 PM PKT
- **Deliverables:** GitHub repo (public) + recorded video + live deployment URL

---

## Evaluation Criteria

| Criteria | Details |
|----------|---------|
| Feature Implementation | Task sharing, notifications, analytics, dark mode, attachments |
| Performance | Optimized backend queries, responsive frontend, fast API calls |
| Documentation | Clear README, well-structured code |
| Deployment | Smooth live deployment accessible via single URL |
