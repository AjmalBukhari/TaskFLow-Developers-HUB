import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/me', data);
export const deleteAccount = (data) => API.delete('/auth/me', { data });
export const changePassword = (data) => API.post('/auth/forgot-password', data);
export const updatePassword = (data) => API.put('/auth/me/password', data);
export const getAllTasks = (params) => API.get('/tasks', { params });
export const getTask = (id) => API.get(`/tasks/${id}`);
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const getBinTasks = () => API.get('/tasks/bin');
export const restoreTask = (id) => API.put(`/tasks/restore/${id}`);
export const permanentDelete = (id) => API.delete(`/tasks/permanent/${id}`);
export const shareTask = (id, userIds) => API.put(`/tasks/${id}/share`, { userIds });
export const getSharedTasks = () => API.get('/tasks/shared');
export const getNotifications = () => API.get('/notifications');
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/read-all');
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);
export const getUnreadCount = () => API.get('/notifications/unread-count');
export const permanentDeleteTask = (id) => API.delete(`/tasks/permanent/${id}`);

export default API;
