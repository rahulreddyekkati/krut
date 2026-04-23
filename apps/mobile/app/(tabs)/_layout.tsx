import { Tabs } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text } from 'react-native';

export default function TabLayout() {
  const { token, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/login');
    }
  }, [isLoading, token]);

  if (isLoading || !token) return null;

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MARKET_MANAGER';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          paddingTop: 10,
          paddingBottom: 28,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="my-shifts"
        options={{
          title: 'My Shifts',
          href: isAdmin ? null : undefined, // Hide for ADMIN/MARKET_MANAGER
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Open Shifts',
          href: isAdmin ? null : undefined, // Hide for ADMIN/MARKET_MANAGER
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>🔍</Text>,
        }}
      />
      {/* Admin specific tabs - we define them here to appear in bottom bar for Admin */}
      <Tabs.Screen
        name="recaps"
        options={{
          title: 'Recaps',
          href: isAdmin ? '/(admin)/recaps' : null, // Only for ADMIN
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>🧾</Text>,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          href: isAdmin ? '/messages' : null, // Only for ADMIN
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>💬</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
