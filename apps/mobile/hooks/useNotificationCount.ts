import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/apiClient';

export function useNotificationCount() {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    try {
      const response = await fetchWithAuth('/notifications');
      if (response.ok) {
        const data = await response.json();
        const unread = data.filter((n: any) => !n.read).length;
        setCount(unread);
      }
    } catch (e) {
      console.log('Error fetching notifications count', e);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { count, refetch: fetchCount };
}
