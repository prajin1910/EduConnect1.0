import { Bell, Briefcase, Calendar, CheckCircle, MessageCircle, User, UserPlus, X, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface Notification {
  id: string;
  type: 'EVENT_APPROVED' | 'EVENT_REJECTED' | 'EVENT_UPCOMING' | 'NEW_FOLLOWER' | 'CONNECTION_REQUEST' | 'CONNECTION_ACCEPTED' | 'JOB_POST' | 'EVENT_REMINDER';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  eventId?: string;
  relatedEntityId?: string;
  eventTitle?: string;
  organizerName?: string;
  eventDate?: string;
}

const EnhancedNotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (!showDropdown) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      const notificationsData = Array.isArray(response.data) ? response.data : [];
      
      // Sort by creation date (newest first)
      const sortedNotifications = notificationsData.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/count');
      setUnreadCount(response.data || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(notification => 
          api.put(`/notifications/${notification.id}/read`)
        )
      );
      
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
    } catch (error) {
      console.error('Error marking all as read:', error);
      showToast('Failed to mark all as read', 'error');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'EVENT_APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'EVENT_REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'EVENT_UPCOMING':
      case 'EVENT_REMINDER':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'NEW_FOLLOWER':
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      case 'CONNECTION_REQUEST':
        return <User className="h-5 w-5 text-orange-500" />;
      case 'CONNECTION_ACCEPTED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'JOB_POST':
        return <Briefcase className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    const baseColor = read ? 'bg-white' : 'bg-blue-50';
    const borderColor = read ? 'border-gray-100' : 'border-blue-200';
    return `${baseColor} ${borderColor}`;
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        const minutes = Math.floor(diffInHours * 60);
        return `${minutes}m ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInHours < 168) { // 7 days
        return `${Math.floor(diffInHours / 24)}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return dateString;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'EVENT_APPROVED':
      case 'EVENT_UPCOMING':
      case 'EVENT_REMINDER':
        // Navigate to events page
        break;
      case 'CONNECTION_REQUEST':
        // Navigate to connections page
        break;
      case 'JOB_POST':
        // Navigate to job board
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) {
            fetchNotifications();
          }
        }}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[80vh] overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">{unreadCount} unread notifications</p>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p>No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">You'll see updates here when they arrive</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${getNotificationColor(notification.type, notification.read)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">
                            {formatDateTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      {/* Additional context for specific notification types */}
                      {notification.eventTitle && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Event: {notification.eventTitle}
                        </div>
                      )}
                      
                      {notification.organizerName && (
                        <div className="mt-1 text-xs text-gray-500">
                          Organizer: {notification.organizerName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={fetchNotifications}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-1"
              >
                Refresh Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedNotificationBell;