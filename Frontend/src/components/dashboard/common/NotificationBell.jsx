import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckDouble, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../AuthContext';

const NotificationBell = ({ accent = 'blue' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef(null);

  const accentClasses = {
    blue: 'bg-blue-500 text-blue-600',
    teal: 'bg-teal-500 text-teal-600',
    emerald: 'bg-emerald-500 text-emerald-600',
    indigo: 'bg-indigo-500 text-indigo-600',
    slate: 'bg-slate-500 text-slate-600',
  };

  const activeAccent = accentClasses[accent] || accentClasses.blue;

  const fetchNotifications = async () => {
    if (!user?.token) return;

    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setNotifications(Array.isArray(res.data?.notifications) ? res.data.notifications : []);
      setUnreadCount(Number(res.data?.unread_count || 0));
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 60000);
    return () => window.clearInterval(interval);
  }, [user?.token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markRead = async (notification) => {
    if (!notification?.notification_id || notification.is_read) return;

    setNotifications((items) =>
      items.map((item) =>
        item.notification_id === notification.notification_id ? { ...item, is_read: 1 } : item,
      ),
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${notification.notification_id}/read`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
    } catch (error) {
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, is_read: 1 })));
    setUnreadCount(0);

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
    } catch (error) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    await markRead(notification);
    setOpen(false);

    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          fetchNotifications();
        }}
        className="relative p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
        title="Notifications"
      >
        <FontAwesomeIcon icon={faBell} className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full ${activeAccent.split(' ')[0]} text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-800`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[80]">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-black text-sm text-slate-800 dark:text-white">Notifications</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{unreadCount} unread</p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 ${activeAccent.split(' ')[1]} disabled:opacity-40`}
              title="Mark all as read"
            >
              <FontAwesomeIcon icon={faCheckDouble} className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <FontAwesomeIcon icon={faSpinner} spin className="h-5 w-5" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.notification_id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className="w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-1.5 w-2 h-2 rounded-full ${notification.is_read ? 'bg-slate-300 dark:bg-slate-700' : activeAccent.split(' ')[0]}`}></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{notification.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{notification.message}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                        {notification.created_at ? new Date(notification.created_at).toLocaleString() : 'Recent'}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
