import React from 'react';
import { useAuth } from '../../providers/AuthProvider';
import WorkerDashboard from '../../components/WorkerDashboard';
import AdminDashboard from '../../components/AdminDashboard';
import { ActivityIndicator, View } from 'react-native';

export default function HomeRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (user.role === 'ADMIN' || user.role === 'MARKET_MANAGER') {
    return <AdminDashboard />;
  }

  return <WorkerDashboard />;
}
