import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService, { useSocket } from '../services/socketService';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount, deleteNotification as deleteNotificationApi, clearAllNotifications as clearAllApi } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await getNotifications();
      setNotifications(data.data);
      
      // Update unread count
      const unread = data.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const { data } = await getUnreadCount();
      setUnreadCount(data.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (id) => {
    try {
      const { data } = await markAsRead(id);
setNotifications(prev => 
         prev.map(n => n.id === id ? { ...n, read: true } : n)
       );
      setUnreadCount(prev => prev - 1);
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      const res = await deleteNotificationApi(id);
      if (res.status === 'success' || res.status === 200) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      const res = await clearAllApi();
      if (res.status === 'success' || res.status === 200) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  };

  useSocket('new_notification', (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  });

useSocket('task_updated', (task) => {
     setNotifications(prev => 
       prev.map(n => 
         n.taskId?.id === task.id 
           ? { ...n, message: `Task "${task.title}" status was updated to ${task.status}` }
           : n
       )
     );
   });

  useEffect(() => {
    socketService.connect();

    // Fetch initial data
    fetchNotifications();
    fetchUnreadCount();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};