import { useEffect } from 'react';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Initialize socket connection
  connect() {
    if (this.socket) return this.socket;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for socket connection');
      return null;
    }

    // Import socket.io-client dynamically
    const io = require('socket.io-client');
    
    this.socket = io('http://localhost:5000', {
      auth: {
        token: token
      }
    });

    // Set up event listeners
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      // Join user's room
      const userId = this.getUserIdFromToken();
      if (userId) {
        this.socket.emit('join', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Handle real-time notifications
    this.socket.on('new_notification', (notification) => {
      this.emit('notification', notification);
    });

    // Handle task updates
    this.socket.on('task_updated', (task) => {
      this.emit('taskUpdated', task);
    });

    // Handle task creation
    this.socket.on('task_created', (task) => {
      this.emit('taskCreated', task);
    });

    // Handle task deletion
    this.socket.on('task_deleted', (taskId) => {
      this.emit('taskDeleted', taskId);
    });

    // Handle task restoration
    this.socket.on('task_restored', (taskId) => {
      this.emit('taskRestored', taskId);
    });

    return this.socket;
  }

  // Get user ID from JWT token
  getUserIdFromToken() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // If socket is connected, add the listener
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Emit event
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Emit custom event to listeners
  emit(event, data) {
    // Emit to socket if connected
    if (this.socket) {
      this.socket.emit(event, data);
    }

    // Emit to React listeners
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket listener:', error);
        }
      });
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Join user room
  joinRoom(userId) {
    if (this.socket) {
      this.socket.emit('join', userId);
    }
  }

  // Leave user room
  leaveRoom(userId) {
    if (this.socket) {
      this.socket.emit('leave', userId);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;

// React hook for socket events
export const useSocket = (event, callback) => {
  useEffect(() => {
    // Connect socket if not connected
    if (!socketService.socket) {
      socketService.connect();
    }

    // Add listener
    socketService.on(event, callback);

    // Cleanup on unmount
    return () => {
      socketService.off(event, callback);
    };
  }, [event, callback]);
};