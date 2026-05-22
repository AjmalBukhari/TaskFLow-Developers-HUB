# TaskFlow - Full Stack Task Management Application

A modern, full-featured task management application built with React, Node.js, Express, and MongoDB. Features real-time collaboration, analytics dashboard, dark mode, file attachments, and more.

## Features

### Core Features
- **User Authentication** - JWT-based registration, login, and session management
- **Task CRUD** - Create, read, update, and delete tasks with full validation
- **Task Organization** - Status tracking (Pending, In Progress, Completed), priority levels (Low, Medium, High), pinning, and due dates
- **Search & Filter** - Real-time search with status and priority filtering
- **Soft Delete** - Bin system with 7-day auto-deletion, restore capability
- **Bulk Operations** - Select and delete multiple tasks at once

### Collaboration (Phase 2)
- **Task Sharing** - Share tasks with other users by ID
- **Real-time Notifications** - Socket.IO powered notifications for sharing and updates
- **Shared Task View** - View tasks shared with you
- **Authorization** - Prevent unauthorized access and editing

### Analytics Dashboard
- **Overview Stats** - Total, completed, pending, overdue, due today, shared tasks
- **Completion Rate** - Track your productivity percentage
- **Weekly/Monthly Trends** - Bar charts showing task creation and completion trends
- **Status Distribution** - Pie chart showing task status breakdown
- **Priority Distribution** - Pie chart showing priority breakdown
- **MongoDB Aggregation** - Optimized queries for analytics data

### UI/UX
- **Dark Mode** - Toggle between light and dark themes with persistence
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Framer Motion powered transitions
- **Toast Notifications** - Real-time feedback for all actions
- **Pagination** - Efficient task list pagination

### File Attachments
- **Upload Files** - Attach images, PDFs, documents to tasks
- **File Management** - View and remove attachments
- **10MB Limit** - Configurable file size limits

### Account Management
- **Profile View** - View account information
- **Account Settings** - Update name, email, password
- **Account Deletion** - Secure account deletion with password confirmation
- **Password Reset** - Forgot password functionality

## Tech Stack

### Frontend
- **React 19** - UI library
- **React Router DOM 7** - Client-side routing
- **Tailwind CSS 3** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Recharts** - Chart library for analytics

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB + Mongoose 9** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Socket.IO** - Real-time events
- **express-validator** - Input validation
- **Multer** - File upload handling

## Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Run the backend:

```bash
npm run dev
```

Server will start at `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

App will open at `http://localhost:3000`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Backend server port | 5000 |
| MONGO_URI | MongoDB connection string | - |
| JWT_SECRET | Secret for JWT signing | - |
| JWT_EXPIRES_IN | Token expiration time | 7d |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3000 |
| NODE_ENV | Environment mode | development |

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current profile | Yes |
| PUT | `/api/auth/me` | Update profile | Yes |
| PUT | `/api/auth/me/password` | Update password | Yes |
| POST | `/api/auth/forgot-password` | Reset password | No |
| DELETE | `/api/auth/me` | Delete account | Yes |

### Tasks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/tasks` | Create task | Yes |
| GET | `/api/tasks` | Get all tasks (with search/filter) | Yes |
| GET | `/api/tasks/:id` | Get single task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Soft delete task | Yes |
| GET | `/api/tasks/bin` | Get deleted tasks | Yes |
| PUT | `/api/tasks/restore/:id` | Restore task | Yes |
| DELETE | `/api/tasks/permanent/:id` | Permanent delete | Yes |
| PUT | `/api/tasks/:id/share` | Share task with users | Yes |
| GET | `/api/tasks/shared` | Get shared tasks | Yes |
| POST | `/api/uploads/:id/attachments` | Upload attachment | Yes |
| DELETE | `/api/uploads/:taskId/attachments/:attachmentId` | Remove attachment | Yes |

### Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | Get notifications | Yes |
| PUT | `/api/notifications/:id/read` | Mark as read | Yes |
| PUT | `/api/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/api/notifications/:id` | Delete notification | Yes |
| GET | `/api/notifications/unread-count` | Get unread count | Yes |

### Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/analytics/overview` | Get overview stats | Yes |
| GET | `/api/analytics/trends` | Get trends and charts data | Yes |

## Authentication Flow

1. User registers with fullname, email, password
2. Password is hashed with bcrypt before storage
3. On login, JWT token is generated and returned
4. Token is stored in localStorage on frontend
5. All API requests include token in Authorization header
6. Backend middleware validates token on protected routes
7. Token expires after configured duration (default: 7 days)

## Socket.IO Setup

### Server Events
- `join` - User joins their room with userId
- `task_created` - Emitted when task is created
- `task_updated` - Emitted when task is updated
- `task_deleted` - Emitted when task is soft deleted
- `task_restored` - Emitted when task is restored
- `task_permanently_deleted` - Emitted on permanent delete
- `new_notification` - Emitted for new notifications

### Client Events
- Connects to server on authentication
- Joins user room automatically
- Listens for real-time events
- Displays toast notifications for incoming events

## Analytics Overview

The analytics dashboard provides:
- **Real-time stats** - Total, completed, pending, overdue tasks
- **Completion rate** - Percentage of completed tasks
- **Weekly trends** - Task creation and completion over last 7 days
- **Monthly trends** - Task trends over last 6 months
- **Status pie chart** - Visual breakdown of task statuses
- **Priority pie chart** - Visual breakdown of task priorities
- **Summary cards** - Weekly and monthly creation/completion counts

All analytics use MongoDB Aggregation Framework for optimized queries.

## Folder Structure

```
task-manager/
├── backend/
│   ├── config/           # App configuration
│   ├── controllers/      # Route handlers
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── notificationController.js
│   │   ├── taskController.js
│   │   └── uploadController.js
│   ├── middleware/       # Auth and validation
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── services/         # Socket.IO service
│   ├── utils/            # Error handling utilities
│   ├── uploads/          # File attachments (gitignored)
│   ├── .env.example      # Environment template
│   ├── .gitignore
│   ├── package.json
│   └── server.js         # Entry point
├── frontend/
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/   # Header, Sidebar, MainLayout
│   │   │   ├── pages/    # Dashboard, AllTasks, Analytics, etc.
│   │   │   └── ui/       # Toast, modals
│   │   ├── context/      # Theme and Notification contexts
│   │   ├── services/     # API and Socket services
│   │   ├── App.jsx       # Main app component
│   │   ├── index.css     # Tailwind imports
│   │   └── index.js      # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Deployment

### Backend (Heroku/Railway/Render)
1. Set environment variables in platform dashboard
2. Connect GitHub repository
3. Deploy - platform will run `npm install` and `npm start`

### Frontend (Vercel/Netlify)
1. Set `REACT_APP_API_URL` to backend URL
2. Connect GitHub repository
3. Deploy - platform will run `npm install` and `npm run build`

### Full Stack (Single Server)
1. Build frontend: `cd frontend && npm run build`
2. Serve `frontend/build` from Express static middleware
3. Deploy entire project to single platform

## Screenshots

[ADD SCREENSHOTS HERE]
- Login/Register screen
- Dashboard with stats
- All Tasks view with search/filter
- Analytics Dashboard with charts
- Dark mode view
- Mobile responsive view

## Links

[ADD GITHUB REPOSITORY LINK HERE]

[ADD GOOGLE DRIVE VIDEO LINK HERE]

[ADD LIVE DEPLOYMENT LINK HERE]

## Future Improvements

- [ ] Email notifications for task sharing
- [ ] Drag and drop task reordering
- [ ] Task categories/tags
- [ ] Calendar view for due dates
- [ ] Export tasks to CSV/PDF
- [ ] Team/workspace management
- [ ] Rich text editor for descriptions
- [ ] Cloud storage integration (S3) for attachments
- [ ] OAuth login (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Comments on tasks
- [ ] Activity log/audit trail

## License

MIT
