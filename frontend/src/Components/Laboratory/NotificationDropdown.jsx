import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark the notification as read
    markAsRead(notification._id);

    // Navigate based on notification type and related model
    if (notification.relatedTo && notification.relatedTo.model === 'Test') {
      navigate(`/lab-technician/lab-requests/${notification.relatedTo.id}`);
    }
    
    // Close the dropdown
    setIsOpen(false);
  };

  // Get notification time as relative time string (e.g. "2 hours ago")
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hr ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day ago`;
    }
    
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200 group"
        onClick={toggleDropdown}
      >
        <BellIcon size={20} className="text-slate-600 group-hover:text-blue-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full w-5 h-5 text-xs text-white flex items-center justify-center font-medium shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
          {/* Dropdown Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-slate-800 font-semibold text-sm">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-6 px-4 text-center text-slate-500 text-sm">
                No notifications yet
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    className={`px-4 py-3 border-b border-slate-100 hover:bg-blue-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50/40' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      <div className={`w-2 h-2 mt-1.5 rounded-full mr-2 flex-shrink-0 ${
                        notification.read ? 'bg-slate-300' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 mb-0.5">
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-600 mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400">
                          {getRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-center">
            <button
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
              onClick={() => {
                navigate('/lab-technician/notifications');
                setIsOpen(false);
              }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;