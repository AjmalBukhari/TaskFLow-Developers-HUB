# 🚀 TaskFlow - Full Stack Task Management App

TaskFlow is a comprehensive full-stack task management application built with **React, Node.js, Express, and MongoDB**. It provides a complete solution for task management with advanced features like real-time collaboration, analytics, and notifications.

---

# 📌 Features

## 🔐 Authentication & Security
* User Registration & Login (JWT-based)
* Protected routes (only logged-in users can access tasks)
* Secure password hashing (bcrypt)
* Role-based access control
* Token-based authentication

## 📋 Task Management
* Create, edit, delete tasks
* Task status: **Pending / In Progress / Completed**
* Priority levels: **Low / Medium / High**
* Due date support with reminders
* Pin important tasks 📌
* Soft delete with bin system
* Task sharing with multiple users

## 🗂️ Organization
* Task search and filtering
* Bulk operations (select & delete multiple tasks)
* Task categorization
* Status-based organization
* Priority-based sorting

## 📊 Analytics Dashboard
* Real-time task statistics
* Completion rate tracking
* Overdue task alerts
* Weekly and monthly trends
* Task distribution charts
* Productivity insights

## 🔄 Real-time Collaboration
* Socket.IO for real-time updates
* Live notifications for task changes
* Task sharing with collaborators
* Real-time status updates
* Instant notifications

## 📱 User Experience
* Clean and modern UI with Tailwind CSS
* Responsive design for all devices
* Smooth animations (Framer Motion)
* Toast notifications
* Loading states
* Error handling

## 🔔 Notification System
* Real-time notifications
* Email notifications (optional)
* Notification center
* Mark as read functionality
* Unread count tracking

---

# 🛠️ Tech Stack

### Frontend
* **React.js** - Modern UI framework
* **Tailwind CSS** - Utility-first CSS framework
* **Framer Motion** - Animation library
* **Axios** - HTTP client for API calls
* **Socket.IO Client** - Real-time communication
* **React Router** - Client-side routing

### Backend
* **Node.js** - JavaScript runtime
* **Express.js** - Web framework
* **MongoDB + Mongoose** - Database and ODM
* **JWT Authentication** - Token-based auth
* **bcrypt.js** - Password hashing
* **Socket.IO** - Real-time communication
* **Express Validator** - Input validation

### Development & Testing
* **ESLint** - Code linting
* **Prettier** - Code formatting
* **Jest** - Testing framework
* **Supertest** - API testing

---

# 📂 Project Structure

```
task-manager/
│
├── backend/
│   ├── controllers/          # Business logic controllers
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── notificationController.js
│   │   └── analyticsController.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── notifications.js
│   │   └── analytics.js
│   ├── models/              # Database models
│   │   ├── User.js
│   │   ├── Task.js
│   │   └── Notification.js
│   ├── middleware/          # Express middleware
│   │   ├── auth.js
│   │   └── validate.js
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   │   ├── errorHandler.js
│   │   └── appError.js
│   ├── config/              # Configuration files
│   │   └── config.js
│   └── server.js            # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── layout/      # Layout components
│   │   │   │   ├── MainLayout.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Header.jsx
│   │   │   ├── pages/       # Page components
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── AllTasks.jsx
│   │   │   │   ├── AddTask.jsx
│   │   │   │   ├── BinTask.jsx
│   │   │   │   ├── Analytics.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   └── Account.jsx
│   │   │   ├── ui/          # UI components
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── ConfirmModal.jsx
│   │   │   │   └── ShareModal.jsx
│   │   │   ├── Auth.jsx     # Authentication component
│   │   │   ├── TaskForm.jsx # Task form component
│   │   │   ├── ProgressBar.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── context/         # React context
│   │   │   └── NotificationContext.jsx
│   │   ├── services/        # API services
│   │   │   ├── api.js
│   │   │   └── socketService.js
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # CSS styles
│   │   ├── assets/          # Static assets
│   │   ├── App.jsx          # Main app component
│   │   ├── index.js         # App entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Public assets
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── docs/                    # Documentation
├── tests/                   # Test files
└── README.md
```
│   └── server.js
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.jsx
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/ajmalbukhari/task-manager.git
cd task-manager
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

Run backend:

```bash
npm run dev
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

# 🔗 API Endpoints (Main)

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/me`
* `PUT /api/auth/me`
* `DELETE /api/auth/me`

### Tasks

* `GET /api/tasks`
* `POST /api/tasks`
* `PUT /api/tasks/:id`
* `DELETE /api/tasks/:id` (move to bin)

### Bin

* `GET /api/tasks/bin`
* `PUT /api/tasks/restore/:id`
* `DELETE /api/tasks/permanent/:id`

---

# 🧪 Testing Checklist

* ✅ Register & Login works
* ✅ Task CRUD works
* ✅ Bin system works
* ✅ Pagination works
* ✅ Multi-user isolation works
* ✅ Account delete works

---

# 📸 Screenshots (Optional)

*Add screenshots here if required*

---

# 🚀 Future Improvements

* Drag & Drop (Kanban board)
* Dark mode
* Backend pagination
* Task sharing / collaboration
* Profile avatar upload

---

# 👨‍💻 Author

**Your Name**
Full Stack Developer

---

# ⭐ Conclusion

TaskFlow demonstrates a complete **full-stack application** with real-world features like authentication, data isolation, and scalable UI architecture.

---
