import axios from 'axios';

// ================= BASE INSTANCE =================
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// ================= REQUEST INTERCEPTOR =================
// Attach JWT token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// ================= RESPONSE INTERCEPTOR =================
// Optional: global error handling
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

// ================= AUTH =================
export const registerUser = (data) =>
  API.post('/auth/register', data);

export const loginUser = (data) =>
  API.post('/auth/login', data);

export const getProfile = () => 
  API.get('/auth/me');
export const updateProfile = (data) => 
  API.put('/auth/me', data);

export const deleteAccount = () =>
  API.delete('/auth/me');

// ================= TASKS =================

// Get all tasks (with search + filter)
export const getAllTasks = (params) =>
  API.get('/tasks', { params });

// Get single task
export const getTask = (id) =>
  API.get(`/tasks/${id}`);

// Create task
export const createTask = (data) =>
  API.post('/tasks', data);

// Update task
export const updateTask = (id, data) =>
  API.put(`/tasks/${id}`, data);

// Soft delete (move to bin)
export const deleteTask = (id) =>
  API.delete(`/tasks/${id}`);

// ================= BIN TASKS =================

// Get deleted tasks
export const getBinTasks = () =>
  API.get('/tasks/bin');

// Restore task
export const restoreTask = (id) =>
  API.put(`/tasks/restore/${id}`);

// Permanent delete
export const permanentDelete = (id) =>
  API.delete(`/tasks/permanent/${id}`);

// ================= SHARING =================

// Share task
export const shareTask = (id, userIds) =>
  API.put(`/tasks/${id}/share`, { userIds });

// Get shared tasks
export const getSharedTasks = () =>
  API.get('/tasks/shared');

// ================= ANALYTICS =================

// Get analytics overview
export const getAnalyticsOverview = () =>
  API.get('/analytics/overview');

// Get analytics trends
export const getAnalyticsTrends = (period) =>
  API.get('/analytics/trends', { params: { period } });

// Get user analytics
export const getUserAnalytics = () =>
  API.get('/analytics/user');

// ================= NOTIFICATIONS =================

// Get notifications
export const getNotifications = () =>
  API.get('/notifications');

// Mark notification as read
export const markAsRead = (id) =>
  API.put(`/notifications/${id}/read`);

// Mark all notifications as read
export const markAllAsRead = () =>
  API.put('/notifications/read-all');

// Delete notification
export const deleteNotification = (id) =>
  API.delete(`/notifications/${id}`);

// Get unread count
export const getUnreadCount = () =>
  API.get('/notifications/unread-count');

// Permanently delete
export const permanentDeleteTask = (id) =>
  API.delete(`/tasks/permanent/${id}`);

// ================= PHASE-2: TASK SHARING =================
export const shareTask = (id, userIds) =>
  API.put(`/tasks/${id}/share`, { userIds });

export const getSharedTasks = () =>
  API.get('/tasks/shared');

// ================= PHASE-2: NOTIFICATIONS =================
export const getNotifications = () =>
  API.get('/notifications');

export const markNotificationRead = (id) =>
  API.put(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  API.put('/notifications/read-all');

export const deleteNotification = (id) =>
  API.delete(`/notifications/${id}`);

// ================= PHASE-2: ANALYTICS =================
export const getAnalyticsOverview = () =>
  API.get('/analytics/overview');

export const getAnalyticsTrends = (period) =>
  API.get(`/analytics/trends?period=${period}`);

export const getPriorityDistribution = () =>
  API.get('/analytics/priority');

export default API;