# TaskFlow Project Architecture

## Overview

This document provides a comprehensive overview of the TaskFlow project architecture, detailing the technical decisions, design patterns, and implementation strategies used to build a scalable, maintainable, and production-ready task management application.

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        TaskFlow Architecture                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   Frontend       │    │   Backend       │    │   Database  │ │
│  │   (React)        │◄──►│   (Node.js)     │◄──►│   (MongoDB) │ │
│  │                 │    │                 │    │             │ │
│  │  - Components   │    │  - Controllers  │    │  - Tasks    │ │
│  │  - Services     │    │  - Routes       │    │  - Users    │ │
│  │  - Context      │    │  - Models       │    │  - Notifs   │ │
│  │  - Hooks        │    │  - Middleware   │    │             │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Real-time Layer                           │ │
│  │                 (Socket.IO)                                │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    External Services                         │ │
│  │  - Email Service  - File Storage  - Analytics Service      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Separation of Concerns**: Clear separation between frontend, backend, and database layers
2. **Microservices Ready**: Modular design allows for future microservices decomposition
3. **Event-Driven Architecture**: Real-time updates through Socket.IO events
4. **RESTful API**: Clean, predictable API endpoints following REST principles
5. **State Management**: Centralized state management with React Context
6. **Security First**: JWT authentication, input validation, and secure data handling

---

## Frontend Architecture

### Component Structure

```
frontend/src/
├── components/           # Reusable UI components
│   ├── layout/         # Layout components
│   │   ├── MainLayout.jsx    # Main application layout
│   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   └── Header.jsx        # Header with search and profile
│   ├── pages/          # Page-specific components
│   │   ├── Dashboard.jsx     # Dashboard page
│   │   ├── AllTasks.jsx      # All tasks page
│   │   ├── AddTask.jsx       # Add task page
│   │   ├── BinTask.jsx       # Bin tasks page
│   │   ├── Analytics.jsx     # Analytics page
│   │   ├── Profile.jsx       # Profile page
│   │   └── Account.jsx      # Account settings page
│   ├── ui/             # Reusable UI elements
│   │   ├── Toast.jsx         # Toast notifications
│   │   ├── ConfirmModal.jsx  # Confirmation modal
│   │   └── ShareModal.jsx    # Task sharing modal
│   ├── Auth.jsx        # Authentication component
│   ├── TaskForm.jsx    # Task form component
│   ├── ProgressBar.jsx # Progress bar component
│   └── SearchBar.jsx   # Search bar component
├── context/            # React context providers
│   └── NotificationContext.jsx  # Global notification state
├── services/          # API and service layers
│   ├── api.js         # API service for HTTP requests
│   └── socketService.js  # Socket.IO service
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── styles/            # CSS styles
├── assets/            # Static assets
├── App.jsx            # Main application component
├── index.js           # Application entry point
└── index.css          # Global styles
```

### State Management Architecture

#### 1. Global State (React Context)
```javascript
// Notification Context
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const response = await api.get('/notifications');
    setNotifications(response.data);
    setUnreadCount(response.data.filter(n => !n.read).length);
  };

  const markNotificationAsRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => 
      prev.map(n => n._id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => prev - 1);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markNotificationAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
```

#### 2. Component State (Local State)
```javascript
// Task Form Component
const TaskForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'Pending',
    priority: initialData?.priority || 'Medium',
    dueDate: initialData?.dueDate || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors(error.response?.data?.errors || {});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Service Layer Architecture

#### 1. API Service
```javascript
// api.js - Centralized API service
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.token = localStorage.getItem('token');
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      ...options
    };

    try {
      const response = await axios(`${this.baseURL}${endpoint}`, config);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw error;
    }
  }

  // CRUD operations
  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, { method: 'POST', data });
  }

  put(endpoint, data) {
    return this.request(endpoint, { method: 'PUT', data });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService();
```

#### 2. Socket Service
```javascript
// socketService.js - Real-time communication
class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.connected = false;
  }

  connect() {
    if (this.connected) return;

    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    
    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Disconnected from server');
    });
  }

  on(event, callback) {
    this.socket.on(event, callback);
    this.listeners.set(event, callback);
  }

  emit(event, data) {
    if (this.connected) {
      this.socket.emit(event, data);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
    }
  }
}

export const socketService = new SocketService();
```

---

## Backend Architecture

### Directory Structure

```
backend/
├── controllers/        # Business logic controllers
│   ├── authController.js      # Authentication logic
│   ├── taskController.js      # Task management logic
│   ├── notificationController.js  # Notification logic
│   └── analyticsController.js     # Analytics logic
├── routes/            # API route definitions
│   ├── auth.js                # Authentication routes
│   ├── tasks.js               # Task routes
│   ├── notifications.js       # Notification routes
│   └── analytics.js           # Analytics routes
├── models/            # Database models
│   ├── User.js                # User model
│   ├── Task.js                # Task model
│   └── Notification.js       # Notification model
├── middleware/        # Express middleware
│   ├── auth.js                # Authentication middleware
│   └── validate.js            # Validation middleware
├── services/          # Business logic services
├── utils/             # Utility functions
│   ├── errorHandler.js        # Error handling utility
│   └── appError.js           # Custom error class
├── config/            # Configuration files
│   └── config.js             # Application configuration
└── server.js          # Express server entry point
```

### Controller Architecture

#### 1. Base Controller Pattern
```javascript
// Base controller for common functionality
class BaseController {
  constructor(Model) {
    this.Model = Model;
  }

  // Generic CRUD operations
  async getAll(req, res, next) {
    try {
      const documents = await this.Model.find();
      res.status(200).json({
        success: true,
        data: documents
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const document = await this.Model.findById(req.params.id);
      if (!document) {
        return next(new AppError('Document not found', 404));
      }
      res.status(200).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const document = await this.Model.create(req.body);
      res.status(201).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const document = await this.Model.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!document) {
        return next(new AppError('Document not found', 404));
      }
      res.status(200).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const document = await this.Model.findByIdAndDelete(req.params.id);
      if (!document) {
        return next(new AppError('Document not found', 404));
      }
      res.status(200).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  }
}
```

#### 2. Task Controller Implementation
```javascript
// taskController.js - Task management business logic
class TaskController extends BaseController {
  constructor() {
    super(Task);
    this.socketService = socketService;
  }

  // Custom task operations
  async createTask(req, res, next) {
    try {
      const task = await Task.create({
        ...req.body,
        user: req.user.id,
        owner: req.user.id
      });

      // Emit real-time event
      this.socketService.emit('task_created', task);

      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  async shareTask(req, res, next) {
    try {
      const { userIds } = req.body;
      const task = await Task.findById(req.params.id);

      if (!task) {
        return next(new AppError('Task not found', 404));
      }

      // Add users to sharedWith array
      task.sharedWith = [...new Set([...task.sharedWith, ...userIds])];
      await task.save();

      // Emit real-time event to shared users
      userIds.forEach(userId => {
        this.socketService.emit('task_shared', { taskId: task._id, userId });
      });

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  async getSharedTasks(req, res, next) {
    try {
      const tasks = await Task.find({
        sharedWith: req.user.id,
        isDeleted: false
      }).populate('owner', 'name email');

      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
```

### Route Architecture

#### 1. Route Organization
```javascript
// tasks.js - Task routes
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { validateTask } = require('../middleware/validate');

// Public routes
router.get('/', protect, taskController.getAllTasks);
router.get('/shared', protect, taskController.getSharedTasks);

// Protected routes
router.post('/', protect, validateTask, taskController.createTask);
router.get('/:id', protect, taskController.getTask);
router.put('/:id', protect, validateTask, taskController.updateTask);
router.delete('/:id', protect, taskController.deleteTask);
router.put('/:id/share', protect, taskController.shareTask);
router.put('/restore/:id', protect, taskController.restoreTask);
router.delete('/permanent/:id', protect, taskController.permanentDelete);

module.exports = router;
```

#### 2. Route Protection
```javascript
// auth.js - Authentication middleware
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new AppError('Not authorized, no token', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User not found', 401));
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Not authorized, token failed', 401));
  }
};

module.exports = { protect };
```

### Model Architecture

#### 1. Base Model Pattern
```javascript
// baseModel.js - Common model functionality
const mongoose = require('mongoose');

const baseSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

baseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

baseSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = baseSchema;
```

#### 2. Task Model
```javascript
// Task.js - Task model
const mongoose = require('mongoose');
const baseSchema = require('./baseModel');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Task title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  pinned: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > Date.now();
      },
      message: 'Due date must be in the future'
    }
  },
  attachments: [{
    filename: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

// Add base schema
taskSchema.add(baseSchema);

// Indexes for performance
taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ isDeleted: 1 });

// Virtual for task age
taskSchema.virtual('age').get(function() {
  const diff = Date.now() - this.createdAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Task', taskSchema);
```

---

## Database Architecture

### Database Schema Design

#### 1. User Schema
```javascript
// User.js - User model
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({
    id: this._id,
    role: this.role
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

#### 2. Notification Schema
```javascript
// Notification.js - Notification model
const mongoose = require('mongoose');
const baseSchema = require('./baseModel');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['task_created', 'task_updated', 'task_deleted', 'task_shared'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  metadata: {
    taskId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    action: String
  }
});

notificationSchema.add(baseSchema);

// Indexes
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
```

### Database Connection Architecture

```javascript
// config/database.js - Database configuration
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## Real-time Architecture

### Socket.IO Implementation

#### 1. Server-side Socket.IO
```javascript
// server.js - Socket.IO server setup
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Authentication middleware for Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);

  // Join user-specific room
  socket.join(socket.userId);

  // Handle task events
  socket.on('task_created', (task) => {
    // Notify task owner
    io.to(task.user.toString()).emit('new_task', task);
    
    // Notify shared users
    task.sharedWith.forEach(userId => {
      io.to(userId.toString()).emit('task_shared', {
        taskId: task._id,
        title: task.title,
        action: 'created'
      });
    });
  });

  socket.on('task_updated', (task) => {
    // Notify task owner
    io.to(task.user.toString()).emit('task_updated', task);
    
    // Notify shared users
    task.sharedWith.forEach(userId => {
      io.to(userId.toString()).emit('task_updated', {
        taskId: task._id,
        title: task.title,
        action: 'updated'
      });
    });
  });

  socket.on('task_deleted', (taskId) => {
    // Notify task owner
    io.to(socket.userId).emit('task_deleted', taskId);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
```

#### 2. Client-side Socket.IO
```javascript
// socketService.js - Client-side Socket.IO service
class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    if (this.connected) return;

    const token = localStorage.getItem('token');
    
    this.socket = io(process.env.REACT_APP_SOCKET_URL, {
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Disconnected from server');
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.handleReconnect();
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  emit(event, data) {
    if (this.connected && this.socket) {
      this.socket.emit(event, data);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
    }
  }
}

export const socketService = new SocketService();
```

---

## Security Architecture

### Authentication & Authorization

#### 1. JWT Authentication
```javascript
// authController.js - Authentication logic
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/appError');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User already exists', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};
```

#### 2. Input Validation
```javascript
// validate.js - Input validation middleware
const { body, validationResult } = require('express-validator');

const validateTask = [
  body('title')
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 100 })
    .withMessage('Task title cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Task description cannot exceed 1000 characters'),
  
  body('status')
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Status must be Pending, In Progress, or Completed'),
  
  body('priority')
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = { validateTask };
```

### Security Middleware

#### 1. Security Headers
```javascript
// securityMiddleware.js - Security headers middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// HTTP parameter pollution protection
const hppMiddleware = hpp();

module.exports = {
  securityHeaders,
  limiter,
  hppMiddleware
};
```

---

## Performance Architecture

### Caching Strategy

#### 1. Redis Integration
```javascript
// cacheMiddleware.js - Redis caching middleware
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    
    try {
      const cachedData = await client.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      
      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = function(data) {
        client.setex(key, duration, JSON.stringify(data));
        originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

module.exports = { cache };
```

#### 2. Database Optimization
```javascript
// databaseOptimization.js - Database optimization
const mongoose = require('mongoose');

// Query optimization middleware
mongoose.Query.prototype.cache = function() {
  this.useCache = true;
  return this;
};

mongoose.Query.prototype.exec = function() {
  if (!this.useCache) {
    return originalExec.apply(this, arguments);
  }

  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name
  });

  // Check cache
  const cachedValue = await client.get(key);
  
  if (cachedValue) {
    const doc = JSON.parse(cachedValue);
    return Array.isArray(doc) 
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }

  // Execute query
  const result = await originalExec.apply(this, arguments);
  
  // Cache result
  client.setex(key, 3600, JSON.stringify(result));
  
  return result;
};
```

### Performance Monitoring

#### 1. Request Timing
```javascript
// performanceMiddleware.js - Performance monitoring
const performance = require('perf_hooks').performance;

const requestTiming = (req, res, next) => {
  const startTime = performance.now();
  
  res.on('finish', () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
  });
  
  next();
};

module.exports = { requestTiming };
```

---

## Deployment Architecture

### Containerization

#### 1. Docker Backend
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S taskmanager -u 1001

# Change ownership
USER taskmanager

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
```

#### 2. Docker Frontend
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongodb:27017/taskmanager
      - JWT_SECRET=your-production-secret
    depends_on:
      - mongodb
    volumes:
      - ./logs:/app/logs

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend

volumes:
  mongodb_data:
```

### Kubernetes Configuration

#### 1. Backend Deployment
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: taskmanager-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: taskmanager-backend
  template:
    metadata:
      labels:
        app: taskmanager-backend
    spec:
      containers:
      - name: backend
        image: taskmanager/backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGO_URI
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: uri
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### 2. Frontend Deployment
```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: taskmanager-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: taskmanager-frontend
  template:
    metadata:
      labels:
        app: taskmanager-frontend
    spec:
      containers:
      - name: frontend
        image: taskmanager/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
```

---

## Monitoring & Logging Architecture

### Logging System

#### 1. Winston Logger
```javascript
// logger.js - Winston logging configuration
const winston = require('winston');
const path = require('path');

// Custom format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'taskmanager' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
```

#### 2. Request Logging
```javascript
// requestLogger.js - Request logging middleware
const logger = require('./logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
};

module.exports = requestLogger;
```

### Monitoring Metrics

#### 1. Prometheus Metrics
```javascript
// metrics.js - Prometheus metrics collection
const promClient = require('prom-client');

// Create a Registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code']
});

const taskCounter = new promClient.Counter({
  name: 'tasks_total',
  help: 'Total number of tasks',
  labelNames: ['action', 'status']
});

const userCounter = new promClient.Counter({
  name: 'users_total',
  help: 'Total number of users',
  labelNames: ['action']
});

// Export metrics
module.exports = {
  register,
  httpRequestDurationMicroseconds,
  taskCounter,
  userCounter
};
```

---

## Conclusion

The TaskFlow project architecture is designed to be scalable, maintainable, and production-ready. It follows industry best practices and modern development patterns to ensure:

1. **Scalability**: Microservices-ready architecture with proper separation of concerns
2. **Maintainability**: Clean code structure with proper documentation and testing
3. **Security**: Comprehensive security measures including authentication, authorization, and input validation
4. **Performance**: Optimized database queries, caching strategies, and monitoring
5. **Real-time capabilities**: Socket.IO integration for live updates and notifications
6. **Production readiness**: Containerization, Kubernetes deployment, and comprehensive monitoring

This architecture provides a solid foundation for future enhancements and scaling while maintaining code quality and performance standards.