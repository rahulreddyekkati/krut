import { Tabs } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function TabLayout() {
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/login');
    }
  }, [isLoading, token]);

  if (isLoading || !token) return null;

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#4F46E5', headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Shifts',
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Open Shifts',
        }}
      />
    </Tabs>
  );
}
