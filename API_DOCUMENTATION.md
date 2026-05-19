# TaskFlow API Documentation

## Overview

This document provides comprehensive API documentation for the TaskFlow task management application. The API follows RESTful principles and provides endpoints for authentication, task management, notifications, and analytics.

---

## Base URL

```
Production: https://api.taskflow.com/api
Development: http://localhost:5000/api
```

## Authentication

All API endpoints (except authentication endpoints) require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

Error responses follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec9f9b1d8e001f8e4c1a",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Status Codes:**
- 201: Created
- 400: Bad Request (invalid input)
- 409: Conflict (user already exists)

### Login User

**POST** `/auth/login`

Authenticate a user and return a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec9f9b1d8e001f8e4c1a",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized (invalid credentials)

### Get Current User

**GET** `/auth/me`

Get the current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "60d5ec9f9b1d8e001f8e4c1a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLogin": "2024-01-20T14:45:00Z"
  }
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized

### Update User Profile

**PUT** `/auth/me`

Update the current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "60d5ec9f9b1d8e001f8e4c1a",
    "name": "John Updated",
    "email": "john.updated@example.com"
  }
}
```

**Status Codes:**
- 200: OK
- 400: Bad Request (invalid input)
- 401: Unauthorized

### Update Password

**PUT** `/auth/me/password`

Update the current user's password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Status Codes:**
- 200: OK
- 400: Bad Request (invalid input)
- 401: Unauthorized (invalid current password)

### Delete User Account

**DELETE** `/auth/me`

Delete the current user's account (requires password confirmation).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Status Codes:**
- 200: OK
- 400: Bad Request (invalid password)
- 401: Unauthorized

---

## Task Endpoints

### Get All Tasks

**GET** `/tasks`

Get all tasks for the authenticated user with optional filtering and pagination.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of tasks per page (default: 10, max: 50)
- `status` (optional): Filter by status (Pending, In Progress, Completed)
- `priority` (optional): Filter by priority (Low, Medium, High)
- `search` (optional): Search in title and description
- `sort` (optional): Sort field (createdAt, updatedAt, dueDate, priority)
- `order` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "60d5ec9f9b1d8e001f8e4c1b",
        "title": "Complete project proposal",
        "description": "Finish the project proposal document",
        "status": "In Progress",
        "priority": "High",
        "pinned": true,
        "dueDate": "2024-02-15T10:00:00Z",
        "createdAt": "2024-01-20T10:30:00Z",
        "updatedAt": "2024-01-22T14:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized

### Create Task

**POST** `/tasks`

Create a new task.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Complete project proposal",
  "description": "Finish the project proposal document",
  "status": "Pending",
  "priority": "High",
  "dueDate": "2024-02-15T10:00:00Z",
  "pinned": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec9f9b1d8e001f8e4c1b",
    "title": "Complete project proposal",
    "description": "Finish the project proposal document",
    "status": "Pending",
    "priority": "High",
    "pinned": false,
    "dueDate": "2024-02-15T10:00:00Z",
    "user": "60d5ec9f9b1d8e001f8e4c1a",
    "owner": "60d5ec9f9b1d8e001f8e4c1a",
    "sharedWith": [],
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-20T10:30:00Z"
  }
}
```

**Status Codes:**
- 201: Created
- 400: Bad Request (invalid input)
- 401: Unauthorized

### Get Single Task

**GET** `/tasks/:id`

Get a specific task by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec9f9b1d8e001f8e4c1b",
    "title": "Complete project proposal",
    "description": "Finish the project proposal document",
    "status": "In Progress",
    "priority": "High",
    "pinned": true,
    "dueDate": "2024-02-15T10:00:00Z",
    "user": "60d5ec9f9b1d8e001f8e4c1a",
    "owner": "60d5ec9f9b1d8e001f8e4c1a",
    "sharedWith": ["60d5ec9f9b1d8e001f8e4c1c"],
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-22T14:45:00Z"
  }
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 404: Not Found

### Update Task

**PUT** `/tasks/:id`

Update an existing task.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Complete project proposal (updated)",
  "description": "Finish the project proposal document and submit it",
  "status": "Completed",
  "priority": "High",
  "pinned": true,
  "dueDate": "2024-02-15T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec9f9b1d8e001f8e4c1b",
    "title": "Complete project proposal (updated)",
    "description": "Finish the project proposal document and submit it",
    "status": "Completed",
    "priority": "High",
    "pinned": true,
    "dueDate": "2024-02-15T10:00:00Z",
    "user": "60d5ec9f9b1d8e001f8e4c1a",
    "owner": "60d5ec9f9b1d8e001f8e4c1a",
    "sharedWith": ["60d5ec9f9b1d8e001f8e4c1c"],
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-22T14:45:00Z"
  }
}
```

**Status Codes:**
- 200: OK
- 400: Bad Request (invalid input)
- 401: Unauthorized
- 404: Not Found

### Delete Task (Soft Delete)

**DELETE** `/tasks/:id`

Soft delete a task (moves to bin).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec9f9b1d8e001f8e4c1b",
    "title": "Complete project proposal",
    "isDeleted": true,
    "deletedAt": "2024-01-22T14:45:00Z"
  }
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 404: Not Found

### Get Deleted Tasks

**GET** `/tasks/bin`

Get all deleted tasks for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of tasks per page (default: 10, max: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "60d5ec9f9b1d8e001f8e4c1b",
        "title": "Complete project proposal",
        "isDeleted": true,
        "deletedAt": "2024-01-22T14:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized

### Restore Task

**PUT** `/tasks/restore/:id`

Restore a deleted task from the bin.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec9f9b1d8e001f8e4c1b",
    "title": "Complete project proposal",
    "isDeleted": false,
    "deletedAt": null
  }
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 404: Not Found

### Permanent Delete Task

**DELETE** `/tasks/permanent/:id`

Permanently delete a task (cannot be restored).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Task permanently deleted"
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 404: Not Found

### Share Task

**PUT** `/tasks/:id/share`

Share a task with other users.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userIds": ["60d5ec9f9b1d8e001f8e4c1c", "60d5ec9f9b1d8e001f8e4c1d"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec9f9b1d8e001f8e4c1b",
    "title": "Complete project proposal",
    "sharedWith": ["60d5ec9f9b1d8e001f8e4c1c", "60d5ec9f9b1d8e001f8e4c1d"]
  }
}
```

**Status Codes:**
- 200: OK
- 400: Bad Request (invalid input)
- 401: Unauthorized
- 404: Not Found

### Get Shared Tasks

**GET** `/tasks/shared`

Get tasks shared with the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of tasks per page (default: 10, max: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "60d5ec9f9b1d8e001f8e4c1b",
        "title": "Complete project proposal",
        "description": "Finish the project proposal document",
        "status": "In Progress",
        "priority": "High",
        "owner": {
          "_id": "60d5ec9f9b1d8e001f8e4c1a",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "sharedWith": ["60d5ec9f9b1d8e001f8e4c1c"],
        "createdAt": "2024-01-20T10:30:00Z",
        "updatedAt": "2024-01-22T14:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "pages": 1
    }
  }
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized

---

## Notification Endpoints

### Get All Notifications

**GET** `/notifications`

Get all notifications for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of notifications per page (default: 20, max: 100)
- `read` (optional): Filter by read status (true, false)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "60d5ec9f9b1d8e001f8e4c1e",
        "title": "Task Updated",
        "message": "Task 'Complete project proposal' has been updated",
        "type": "task_updated",
        "read": false,
        "createdAt": "2024-01-22T14:45:00Z",
        "metadata": {
          "taskId": "60d5ec9f9b1d8e001f8e4c1b",
          "action": "updated"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized

### Mark Notification as Read

**PUT** `/notifications/:id/read`

Mark a specific notification as read.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec9f9b1d8e001f8e4c1e",
    "read": true
  }
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 404: Not Found

### Mark All Notifications as Read

**PUT** `/notifications/read-all`

Mark all notifications as read.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized

### Delete Notification

**DELETE** `/notifications/:id`

Delete a specific notification.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized
- 404: Not Found

### Get Unread Count

**GET** `/notifications/unread-count`

Get the count of unread notifications.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized

---

## Analytics Endpoints

### Get Analytics Overview

**GET** `/analytics/overview`

Get overview statistics for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTasks": 25,
    "completedTasks": 15,
    "pendingTasks": 8,
    "overdueTasks": 2,
    "completionRate": 60.0
  }
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized

### Get Analytics Trends

**GET** `/analytics/trends`

Get trend data for task completion and creation.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (optional): Time period (week, month, year) (default: week)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "2024-01-15",
      "created": 3,
      "completed": 2
    },
    {
      "_id": "2024-01-16",
      "created": 5,
      "completed": 4
    }
  ]
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized

### Get Status Distribution

**GET** `/analytics/status-distribution`

Get task status distribution.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "status": "Pending",
      "count": 8
    },
    {
      "status": "In Progress",
      "count": 12
    },
    {
      "status": "Completed",
      "count": 15
    }
  ]
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized

### Get Priority Distribution

**GET** `/analytics/priority-distribution`

Get task priority distribution.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json {
  "success": true,
  "data": [
    {
      "priority": "Low",
      "count": 5
    },
    {
      "priority": "Medium",
      "count": 10
    },
    {
      "priority": "High",
      "count": 10
    }
  ]
}
```

**Status Codes:**
- 200: OK
- 401: Unauthorized

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| AUTH_REQUIRED | Authentication required |
| INVALID_TOKEN | Invalid or expired token |
| NOT_FOUND | Resource not found |
| VALIDATION_ERROR | Input validation failed |
| DUPLICATE_RESOURCE | Resource already exists |
| PERMISSION_DENIED | User lacks permission |
| SERVER_ERROR | Internal server error |
| RATE_LIMIT_EXCEEDED | Rate limit exceeded |

### Validation Errors

When validation fails, the response includes detailed error information:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Please provide a valid email address"
        },
        {
          "field": "password",
          "message": "Password must be at least 6 characters long"
        }
      ]
    }
  }
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **Task endpoints**: 100 requests per minute per IP
- **Notification endpoints**: 50 requests per minute per IP
- **Analytics endpoints**: 30 requests per minute per IP

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

---

## WebSocket Events

The API supports real-time updates via WebSocket (Socket.IO). Here are the available events:

### Client Events

| Event | Description | Payload |
|-------|-------------|---------|
| `join` | Join user-specific room | `{ userId: string }` |
| `leave` | Leave user-specific room | `{ userId: string }` |
| `task_created` | Emit task creation | `{ task: Task }` |
| `task_updated` | Emit task update | `{ task: Task }` |
| `task_deleted` | Emit task deletion | `{ taskId: string }` |

### Server Events

| Event | Description | Payload |
|-------|-------------|---------|
| `new_task` | New task notification | `{ task: Task }` |
| `task_updated` | Task update notification | `{ task: Task }` |
| `task_deleted` | Task deletion notification | `{ taskId: string }` |
| `task_shared` | Task shared notification | `{ taskId: string, title: string, action: string }` |
| `new_notification` | New notification | `{ notification: Notification }` |

---

## Authentication Flow

### 1. User Registration
1. Send POST request to `/auth/register`
2. Receive JWT token in response
3. Store token for subsequent requests

### 2. User Login
1. Send POST request to `/auth/login`
2. Receive JWT token in response
3. Store token for subsequent requests

### 3. Protected API Requests
1. Include JWT token in Authorization header
2. Server validates token on each request
3. User data is attached to request object

### 4. Token Refresh
- Tokens expire after 7 days
- Users must login again after expiration
- Refresh tokens can be implemented for longer sessions

---

## Data Models

### User Model
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "password": "String",
  "role": "String",
  "isActive": "Boolean",
  "lastLogin": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Task Model
```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "status": "String",
  "priority": "String",
  "isDeleted": "Boolean",
  "deletedAt": "Date",
  "pinned": "Boolean",
  "user": "ObjectId",
  "owner": "ObjectId",
  "sharedWith": ["ObjectId"],
  "dueDate": "Date",
  "attachments": [
    {
      "filename": "String",
      "fileUrl": "String",
      "uploadedAt": "Date"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Notification Model
```json
{
  "_id": "ObjectId",
  "title": "String",
  "message": "String",
  "type": "String",
  "user": "ObjectId",
  "read": "Boolean",
  "metadata": {
    "taskId": "ObjectId",
    "userId": "ObjectId",
    "action": "String"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Testing

### API Testing Examples

#### Using curl

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get tasks
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create task
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Test description","status":"Pending","priority":"Medium"}'
```

#### Using JavaScript (Axios)

```javascript
// Register user
const register = async () => {
  try {
    const response = await axios.post('/api/auth/register', {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    });
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response.data);
  }
};

// Get tasks with token
const getTasks = async (token) => {
  try {
    const response = await axios.get('/api/tasks', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get tasks:', error.response.data);
  }
};
```

---

## Version History

### Version 1.0.0 (Current)
- Initial API release
- Basic authentication and task management
- Real-time notifications
- Analytics endpoints
- WebSocket support

---

## Support

For API support and questions:
- Email: support@taskflow.com
- Documentation: https://docs.taskflow.com
- Status Page: https://status.taskflow.com

---

## Changelog

### v1.0.0 (2024-01-20)
- Initial release
- Authentication system
- Task management endpoints
- Notification system
- Analytics endpoints
- WebSocket real-time updates