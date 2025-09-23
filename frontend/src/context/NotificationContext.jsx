import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import PropTypes from 'prop-types';

// Create context
export const NotificationContext = createContext();

// Custom hook to use notification context
export const useNotifications = () => useContext(NotificationContext);

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  
  // Get current user from local storage
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const userId = user?._id || null;
  
  // Initialize socket connection
  useEffect(() => {
    if (userId) {
      // Connect to socket.io server
      const newSocket = io('http://localhost:5000', {
        query: { userId }
      });
      
      setSocket(newSocket);
      
      // Clean up socket connection on unmount
      return () => {
        newSocket.disconnect();
      };
    }
  }, [userId]);
  
  // Listen for new notification events
  useEffect(() => {
    if (socket) {
      // Listen for new lab request notifications
      socket.on('new_lab_request', (data) => {
        // Add the new notification to the state
        setNotifications(prev => [data, ...prev]);
        // Increment unread count
        setUnreadCount(count => count + 1);
      });
      
      // Listen for other notification types as needed
      socket.on('notification', (data) => {
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(count => count + 1);
      });
    }
    
    return () => {
      if (socket) {
        socket.off('new_lab_request');
        socket.off('notification');
      }
    };
  }, [socket]);
  
  // Fetch existing notifications on component mount
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);
  
  // Function to fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
        
        // Count unread notifications
        const unread = data.data.filter(notif => !notif.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  // Function to mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(count => Math.max(0, count - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/user/${userId}/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Value object to be provided to consumers
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};