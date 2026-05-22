# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "status": "success",
  "data": { ... },
  "results": 10,
  "message": "Optional message"
}
```

### Error Response
```json
{
  "status": 400,
  "message": "Error description"
}
```

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Body:**
```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (201):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "user": {
      "_id": "507f191e810c19729de860ea",
      "fullname": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### POST /api/auth/login
Login with email and password.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "user": {
      "_id": "507f191e810c19729de860ea",
      "fullname": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### GET /api/auth/me
Get current user profile.

**Headers:** Authorization: Bearer <token>

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "507f191e810c19729de860ea",
      "fullname": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### PUT /api/auth/me
Update user profile.

**Headers:** Authorization: Bearer <token>

**Body:**
```json
{
  "fullname": "John Updated"
}
```

### PUT /api/auth/me/password
Update password.

**Headers:** Authorization: Bearer <token>

**Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### POST /api/auth/forgot-password
Reset password (no auth required).

**Body:**
```json
{
  "email": "john@example.com",
  "newPassword": "newpassword"
}
```

### DELETE /api/auth/me
Delete account (requires password confirmation).

**Headers:** Authorization: Bearer <token>

**Body:**
```json
{
  "password": "currentpassword"
}
```

---

## Task Endpoints

### POST /api/tasks
Create a new task.

**Headers:** Authorization: Bearer <token>

**Body:**
```json
{
  "title": "Complete project",
  "description": "Finish the task manager app",
  "status": "Pending",
  "priority": "High",
  "dueDate": "2026-06-01",
  "pinned": false
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "_id": "...",
    "title": "Complete project",
    "description": "Finish the task manager app",
    "status": "Pending",
    "priority": "High",
    "dueDate": "2026-06-01T00:00:00.000Z",
    "pinned": false,
    "user": "...",
    "owner": "...",
    "sharedWith": [],
    "attachments": [],
    "isDeleted": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### GET /api/tasks
Get all tasks (with optional search and filter).

**Headers:** Authorization: Bearer <token>

**Query Parameters:**
- `search` - Search in title and description
- `status` - Filter by status (Pending, In Progress, Completed)
- `priority` - Filter by priority (Low, Medium, High)

**Response (200):**
```json
{
  "status": "success",
  "results": 5,
  "data": [ ... ]
}
```

### GET /api/tasks/:id
Get a single task.

**Headers:** Authorization: Bearer <token>

**Response (200):**
```json
{
  "status": "success",
  "data": { ... }
}
```

### PUT /api/tasks/:id
Update a task.

**Headers:** Authorization: Bearer <token>

**Body:** Any task fields to update.

### DELETE /api/tasks/:id
Soft delete a task (moves to bin).

**Headers:** Authorization: Bearer <token>

**Response (200):**
```json
{
  "status": "success",
  "message": "Task moved to bin"
}
```

### GET /api/tasks/bin
Get soft-deleted tasks.

**Headers:** Authorization: Bearer <token>

### PUT /api/tasks/restore/:id
Restore a task from bin.

**Headers:** Authorization: Bearer <token>

### DELETE /api/tasks/permanent/:id
Permanently delete a task.

**Headers:** Authorization: Bearer <token>

### PUT /api/tasks/:id/share
Share a task with other users.

**Headers:** Authorization: Bearer <token>

**Body:**
```json
{
  "userIds": ["507f191e810c19729de860ea", "..."]
}
```

### GET /api/tasks/shared
Get tasks shared with current user.

**Headers:** Authorization: Bearer <token>

---

## Notification Endpoints

### GET /api/notifications
Get user notifications (latest 50).

**Headers:** Authorization: Bearer <token>

### PUT /api/notifications/:id/read
Mark notification as read.

### PUT /api/notifications/read-all
Mark all notifications as read.

### DELETE /api/notifications/:id
Delete a notification.

### GET /api/notifications/unread-count
Get count of unread notifications.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "unreadCount": 3
  }
}
```

---

## Analytics Endpoints

### GET /api/analytics/overview
Get overview statistics.

**Headers:** Authorization: Bearer <token>

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "totalTasks": 25,
    "completedTasks": 15,
    "pendingTasks": 7,
    "inProgressTasks": 3,
    "overdueTasks": 2,
    "dueTodayTasks": 1,
    "sharedTasks": 4,
    "highPriorityTasks": 5,
    "weeklyCreated": 5,
    "weeklyCompleted": 3,
    "monthlyCreated": 15,
    "monthlyCompleted": 10,
    "completionRate": 60
  }
}
```

### GET /api/analytics/trends
Get trends and chart data.

**Headers:** Authorization: Bearer <token>

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "weeklyTrends": [
      { "_id": "2026-05-14", "statuses": [...], "total": 3 }
    ],
    "monthlyTrends": [
      { "_id": "2026-01", "statuses": [...], "total": 10 }
    ],
    "statusDistribution": [
      { "_id": "Completed", "count": 15 },
      { "_id": "Pending", "count": 7 },
      { "_id": "In Progress", "count": 3 }
    ],
    "priorityDistribution": [
      { "_id": "Low", "count": 10 },
      { "_id": "Medium", "count": 10 },
      { "_id": "High", "count": 5 }
    ]
  }
}
```

---

## Upload Endpoints

### POST /api/uploads/:id/attachments
Upload a file attachment to a task.

**Headers:** Authorization: Bearer <token>

**Content-Type:** multipart/form-data

**Body:**
- `file` - The file to upload (max 10MB)

**Allowed types:** jpeg, jpg, png, gif, pdf, doc, docx, xls, xlsx, txt, zip

### DELETE /api/uploads/:taskId/attachments/:attachmentId
Remove an attachment from a task.

**Headers:** Authorization: Bearer <token>

---

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |
