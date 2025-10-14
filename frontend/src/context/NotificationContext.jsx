import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the notification context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Function to add a new notification
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random(); // Simple ID generation
    const newNotification = {
      id,
      read: false,
      ...notification,
      timestamp: new Date(),
    };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after 5 seconds if autoRemove is not explicitly set to false
    if (notification.autoRemove !== false) {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }

    return id;
  }, []);

  // Function to remove a notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id && notification._id !== id));
  }, []);

  // Function to mark a notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        (notification.id === id || notification._id === id) 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Function to mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Function to clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Function to show success notification
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options,
    });
  }, [addNotification]);

  // Function to show error notification
  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      ...options,
    });
  }, [addNotification]);

  // Function to show warning notification
  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options,
    });
  }, [addNotification]);

  // Function to show info notification
  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options,
    });
  }, [addNotification]);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;