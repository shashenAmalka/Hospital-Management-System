import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Clock, Beaker, FileCheck } from 'lucide-react';
import { notificationService } from '../../utils/api';

const NotificationBell = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications on component mount
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      console.log('🔔 Fetching notifications for user:', userId);
      const response = await notificationService.getAll();
      console.log('🔔 Notification API response:', response);
      
      if (response && response.success) {
        const notifs = response.data || [];
        console.log(`✅ Received ${notifs.length} notifications`);
        if (notifs.length > 0) {
          console.log('Sample notification:', notifs[0]);
        }
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      } else {
        console.warn('⚠️ Response not successful or missing data');
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      console.error('Error details:', error.message);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n._id === notificationId);
        return notification && !notification.read ? prev - 1 : prev;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "h-5 w-5 drop-shadow-md";
    switch (type) {
      case 'lab_request_created':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
            <Beaker className={`${iconClass} text-white`} />
          </div>
        );
      case 'lab_response_received':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <FileCheck className={`${iconClass} text-white`} />
          </div>
        );
      case 'lab_status_update':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
            <Clock className={`${iconClass} text-white`} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <Bell className={`${iconClass} text-white`} />
          </div>
        );
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-white hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 drop-shadow-lg" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-lg animate-pulse border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="fixed right-4 top-20 w-[420px] bg-white rounded-2xl shadow-2xl border-2 border-teal-200/50 z-[9999] max-h-[calc(100vh-100px)] overflow-hidden flex flex-col backdrop-blur-xl">
          {/* Header */}
          <div className="p-5 border-b-2 border-teal-200/50 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white drop-shadow-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </h3>
                <p className="text-sm text-white/90 font-medium mt-1">
                  {unreadCount > 0 ? `🔔 ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : '✅ All caught up!'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl transition-all duration-300 disabled:opacity-50 font-semibold border border-white/30 shadow-lg"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 bg-gradient-to-b from-teal-50/30 to-cyan-50/30">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <Bell className="h-10 w-10 text-white" />
                </div>
                <p className="text-gray-700 text-center font-bold text-lg">No notifications yet</p>
                <p className="text-gray-500 text-sm text-center mt-2">
                  🔔 You'll see updates about your lab requests here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-teal-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all duration-300 cursor-pointer ${
                      !notification.read ? 'bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 border-l-4 border-teal-500' : 'bg-white'
                    }`}
                    onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            
                            {/* Metadata */}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.createdAt)}
                              </span>
                              {!notification.read && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md animate-pulse">
                                  ✨ New
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification._id);
                            }}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-red-400 hover:to-pink-500 rounded-full transition-all duration-300 shadow-md"
                            aria-label="Delete notification"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t-2 border-teal-200/50 bg-gradient-to-r from-teal-50 to-cyan-50">
              <button
                className="w-full text-center text-sm text-white bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page if you have one
                }}
              >
                📋 View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
