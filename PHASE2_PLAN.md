# Phase-2 Implementation Plan

## Current Architecture Analysis

### Backend Structure
```
backend/
├── package.json          # Dependencies: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv, express-validator
├── server.js             # Express server entry point
├── middleware/
│   ├── auth.js           # JWT authentication middleware
│   └── validate.js       # Express-validator middleware
├── models/
│   ├── Task.js           # Task schema (user, title, description, status, isDeleted, priority, pinned, dueDate)
│   └── User.js           # User schema (fullname, email, password)
└── routes/
    ├── auth.js           # Auth routes: register, login, me, update, delete
    └── tasks.js          # Task routes: CRUD, bin, restore, permanent delete
```

### Frontend Structure
```
frontend/
├── package.json          # React 19, axios, framer-motion, react-router-dom, tailwindcss
├── src/
│   ├── App.jsx           # Main app with routing (Dashboard, All Tasks, Add Task, Bin, Profile, Account)
│   ├── services/api.js   # API service layer (auth + task endpoints)
│   ├── components/
│   │   ├── layout/       # MainLayout, Sidebar, Header
│   │   ├── pages/        # Dashboard, AllTasks, AddTask, BinTask, Profile, Account
│   │   ├── ui/           # Toast notifications
│   │   └── TaskForm.jsx  # Task creation/editing form
│   └── index.css         # Tailwind CSS imports
```

### Existing APIs

#### Auth Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get profile
- `PUT /api/auth/me` - Update profile
- `DELETE /api/auth/me` - Delete account

#### Task Endpoints
- `GET /api/tasks` - Get all tasks (with search/status filters)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Soft delete (move to bin)
- `GET /api/tasks/bin` - Get deleted tasks
- `PUT /api/tasks/restore/:id` - Restore from bin
- `DELETE /api/tasks/permanent/:id` - Permanent delete

### Current Task Schema
```javascript
{
  title: String (required),
  description: String,
  status: String (enum: Pending, In Progress, Completed),
  isDeleted: Boolean,
  deletedAt: Date,
  priority: String,
  pinned: Boolean,
  user: ObjectId (ref: User),
  dueDate: Date
}
```

---

## Phase-2 Features Implementation Plan

### 1. Database Schema Updates (Task.js)

**Changes Required:**
- Add `owner` field (ObjectId ref: User) - alias for user field for clarity
- Add `sharedWith` array (ObjectId[] ref: User) - for task sharing
- Add `attachments` array - for file uploads

**Backward Compatibility:**
- Keep existing `user` field working
- New fields should be optional with defaults

### 2. Task Sharing System

**New APIs:**
- `PUT /api/tasks/:id/share` - Share task with users
- `GET /api/tasks/shared` - Get tasks shared with current user

**Authorization Rules:**
- Only owner can share tasks
- Prevent duplicate sharing
- Prevent self-sharing
- Shared users can view/update status
- Shared users CANNOT delete or re-share

### 3. Socket.IO Real-time Notifications

**Backend Changes:**
- Integrate Socket.IO with Express server
- Create Notification model
- Emit events on: task shared, task updated, task completed

**Frontend Changes:**
- Socket.IO client integration
- Notification bell component
- Real-time notification panel

### 4. Analytics Dashboard

**Backend APIs:**
- `GET /api/analytics/overview` - Task statistics
- `GET /api/analytics/trends` - Weekly/monthly trends

**Frontend:**
- Analytics page with charts (Recharts)
- Summary cards, pie chart, trend charts

### 5. Task Attachments

**Backend:**
- Multer for file upload handling
- Local storage or Cloudinary integration
- File validation (type, size)

**Frontend:**
- Upload button in TaskForm
- Attachment preview/download

### 6. Dark Mode

**Implementation:**
- Tailwind `dark` class strategy
- Theme toggle in Header
- Persist in localStorage

### 7. Mobile Responsiveness

**Improvements:**
- Sidebar collapse on mobile
- Responsive grid layouts
- Touch-friendly interactions

### 8. Deployment Preparation

**Tasks:**
- Environment variable cleanup
- CORS configuration
- Build scripts
- Deployment instructions

---

## Safe Extension Strategy

1. **Database Changes:** All new fields are optional with defaults - no breaking changes
2. **API Changes:** New endpoints only - existing APIs unchanged
3. **Frontend:** New components/pages added incrementally
4. **Auth:** Existing middleware reused, extended for sharing permissions
5. **Socket.IO:** Integrated alongside existing Express server

## Potential Breaking Points

1. **Task Schema:** Adding required fields could break existing tasks
   - **Mitigation:** All new fields optional with defaults

2. **Authorization:** Shared task access needs careful permission checks
   - **Mitigation:** Create shared task middleware

3. **Socket.IO:** Must not interfere with existing HTTP routes
   - **Mitigation:** Use separate server instance or integrate carefully

4. **File Uploads:** Large files could impact performance
   - **Mitigation:** File size limits, proper validation

---

## Implementation Order

1. ✅ Phase 1: Analysis Complete
2. ⏳ Phase 2: Database Schema Update
3. ⏳ Phase 3: Task Sharing System
4. ⏳ Phase 4: Socket.IO Notifications
5. ⏳ Phase 5: Analytics Backend
6. ⏳ Phase 6: Analytics Frontend
7. ⏳ Phase 7: Task Attachments
8. ⏳ Phase 8: Dark Mode
9. ⏳ Phase 9: Responsiveness
10. ⏳ Phase 10: Testing & Error Handling
11. ⏳ Phase 11: Deployment Preparation
12. ⏳ Phase 12: Documentation