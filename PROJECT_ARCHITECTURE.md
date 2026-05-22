# Project Architecture

## System Overview

TaskFlow is a full-stack task management application following a client-server architecture with real-time capabilities.

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │                  React App (SPA)                   │  │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌────────┐ │  │
│  │  │ Pages   │ │Components│ │ Context │ │Services│ │  │
│  │  └─────────┘ └──────────┘ └─────────┘ └────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────┬───────────────┘
               │ HTTP/REST                │ WebSocket
               ▼                          ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│     Express API Server   │  │     Socket.IO Server     │
│  ┌────────────────────┐  │  │  ┌────────────────────┐  │
│  │ Routes → Controllers│  │  │  │ Event Handlers     │  │
│  │ → Models → MongoDB  │  │  │  │ Room Management    │  │
│  └────────────────────┘  │  │  │ Real-time Events   │  │
│  ┌────────────────────┐  │  │  └────────────────────┘  │
│  │ Middleware         │  │  └──────────────────────────┘
│  │ - Auth (JWT)       │  │
│  │ - Validation       │  │
│  │ - Error Handler    │  │
│  └────────────────────┘  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│      MongoDB Database    │
│  ┌────────────────────┐  │
│  │ Collections:       │  │
│  │ - users            │  │
│  │ - tasks            │  │
│  │ - notifications    │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

## Architecture Layers

### Frontend Layer

```
frontend/src/
├── index.js              # Entry point, providers wrapper
├── App.jsx               # Main app, routing, auth state
├── index.css             # Tailwind imports
│
├── components/
│   ├── layout/           # App shell components
│   │   ├── MainLayout    # Container with sidebar + header
│   │   ├── Header        # Top bar with search, notifications
│   │   └── Sidebar       # Navigation menu
│   ├── pages/            # Page-level components
│   │   ├── Dashboard     # Overview stats
│   │   ├── AllTasks      # Task list with CRUD
│   │   ├── AddTask       # Task creation
│   │   ├── Analytics     # Charts and trends
│   │   ├── BinTask       # Soft-deleted tasks
│   │   ├── Profile       # User profile
│   │   ├── Account       # Account settings
│   │   └── ForgotPassword # Password reset
│   └── ui/               # Reusable UI components
│       ├── Toast         # Notification toasts
│       ├── ConfirmModal  # Confirmation dialogs
│       └── ShareModal    # Task sharing modal
│
├── context/              # React Context providers
│   ├── ThemeContext      # Dark/light mode
│   └── NotificationContext # Notification state
│
└── services/             # External communication
    ├── api.js            # Axios HTTP client
    └── socketService.js  # Socket.IO client
```

### Backend Layer

```
backend/
├── server.js             # Entry point, middleware setup
├── config/
│   └── config.js         # Environment configuration
│
├── models/               # Mongoose schemas
│   ├── User.js           # User model with auth
│   ├── Task.js           # Task model with sharing
│   └── Notification.js   # Notification model
│
├── controllers/          # Request handlers
│   ├── authController.js # Register, login, profile
│   ├── taskController.js # CRUD, sharing, bin
│   ├── notificationController.js # Notification CRUD
│   ├── analyticsController.js # Aggregation queries
│   └── uploadController.js # File uploads
│
├── routes/               # API route definitions
│   ├── auth.js           # /api/auth/*
│   ├── tasks.js          # /api/tasks/*
│   ├── notifications.js  # /api/notifications/*
│   ├── analytics.js      # /api/analytics/*
│   └── uploads.js        # /api/uploads/*
│
├── middleware/           # Express middleware
│   ├── auth.js           # JWT authentication
│   └── validate.js       # Input validation
│
├── services/             # Business logic services
│   └── socket.js         # Socket.IO setup
│
├── utils/                # Utility functions
│   ├── appError.js       # Custom error creator
│   └── errorHandler.js   # Centralized error handler
│
└── uploads/              # File attachments (gitignored)
```

## Data Flow

### Request Flow
1. Client makes HTTP request with JWT token
2. Axios interceptor attaches token to headers
3. Express receives request
4. Auth middleware validates token, sets req.user
5. Route handler calls controller
6. Controller queries MongoDB via Mongoose
7. Controller returns JSON response
8. Client receives and updates UI

### Real-time Flow
1. Client connects to Socket.IO on authentication
2. Client emits 'join' event with userId
3. Server adds socket to user's room
4. Server emits events to room on task changes
5. Client receives events via useSocket hook
6. Context updates, UI re-renders

## Security Architecture

### Authentication
- JWT tokens with configurable expiration
- bcrypt password hashing (10 rounds)
- Token stored in localStorage (client-side)
- Authorization header on all API requests

### Authorization
- Route-level: auth middleware on protected routes
- Resource-level: ownership checks in controllers
- Shared access: sharedWith array for read/update

### Input Validation
- express-validator for request body
- File type/size validation for uploads
- Mongoose schema validation
- Sanitization through Mongoose

## Database Schema

### User
```
{
  fullname: String (required),
  email: String (required, unique),
  password: String (hashed, required)
}
```

### Task
```
{
  title: String (required, max 100),
  description: String,
  status: Enum [Pending, In Progress, Completed],
  priority: Enum [Low, Medium, High],
  dueDate: Date,
  pinned: Boolean,
  user: ObjectId (ref: User),
  owner: ObjectId (ref: User),
  sharedWith: [ObjectId (ref: User)],
  isDeleted: Boolean,
  deletedAt: Date (TTL: 7d),
  attachments: [{ filename, fileUrl, uploadedAt }]
}
```

### Notification
```
{
  recipient: ObjectId (ref: User, required),
  message: String (required),
  taskId: ObjectId (ref: Task),
  read: Boolean,
  type: Enum [task_shared, task_updated, task_completed]
}
```

## Communication Protocols

### REST API
- JSON request/response
- Standard HTTP methods
- Consistent response format: `{ status, data, message }`
- Error format: `{ status, message }`

### WebSocket (Socket.IO)
- Real-time event broadcasting
- Room-based messaging (per user)
- Automatic reconnection
- Event types: task_created, task_updated, task_deleted, new_notification
