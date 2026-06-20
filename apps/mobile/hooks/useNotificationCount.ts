import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/apiClient';
import { useAuth } from '../providers/AuthProvider';

export function useNotificationCount() {
  const [count, setCount] = useState(0);
  const { token } = useAuth();

  const fetchCount = async () => {
    // Don't attempt fetch if not authenticated — prevents spurious 401 → logout
    if (!token) return;
    try {
      const response = await fetchWithAuth('/notifications');
      if (response.ok) {
        const data = await response.json();
        const unread = Array.isArray(data) ? data.filter((n: any) => !n.read).length : 0;
        setCount(unread);
      }
    } catch (e) {
      // Silently ignore network errors — badge just stays stale
    }
  };

  useEffect(() => {
    if (!token) {
      setCount(0);
      return;
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30_000); // poll every 30 s
    return () => clearInterval(interval);
  }, [token]); // re-subscribe whenever auth state changes

  return { count, refetch: fetchCount };
}
