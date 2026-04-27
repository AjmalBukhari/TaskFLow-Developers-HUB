# 🚀 TaskFlow - Full Stack Task Management App

TaskFlow is a full-stack task management application built with **React, Node.js, Express, and MongoDB**.
It allows users to manage tasks efficiently with features like authentication, task tracking, bin system, and account management.

---

# 📌 Features

## 🔐 Authentication

* User Registration & Login (JWT आधारित)
* Protected routes (only logged-in users can access tasks)
* Secure password hashing (bcrypt)

---

## 📋 Task Management

* Create, edit, delete tasks
* Task status: **Pending / In Progress / Completed**
* Priority levels: **Low / Medium / High**
* Due date support
* Pin important tasks 📌

---

## 🗑️ Bin System

* Soft delete (tasks moved to bin)
* Restore deleted tasks
* Permanent delete option
* Auto-delete after 7 days

---

## 📊 Dashboard

* Task statistics (Total / Completed / Pending)
* Progress bar
* Recent tasks preview

---

## 📋 All Tasks Page

* Full task list
* Search & filter
* Pagination
* Bulk selection & delete
* Edit task (modal)

---

## 👤 User System

* Profile management (update name & password)
* Account settings page
* Delete account (removes all user data)

---

## 🎨 UI / UX

* Clean and minimal UI
* Sidebar navigation
* Header with search + profile dropdown
* Toast notifications (success/error alerts)
* Smooth animations (Framer Motion)

---

# 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Framer Motion
* Axios

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* bcrypt.js

---

# 📂 Project Structure

```
task-manager/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
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
git clone https://github.com/your-username/task-manager.git
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
