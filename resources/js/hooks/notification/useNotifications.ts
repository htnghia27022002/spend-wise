import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import type { Notification } from '@/types/finance';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await axios.get('/notifications/unread');
      setNotifications(data.notifications);
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await axios.post(`/notifications/${notificationId}/mark-as-read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.post('/notifications/mark-all-as-read');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [fetchUnread]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, refetch: fetchUnread };
}
