import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { router } from 'expo-router';
import { fetchWithAuth } from '../../utils/apiClient';
import ShiftCard from '../../components/ShiftCard';

export default function MyShiftsTab() {
  const { token } = useAuth();
  const [shifts, setShifts] = useState<{upcoming: any[], currentCycle: any[]}>({ upcoming: [], currentCycle: [] });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (token) loadShifts();
  }, [token]);

  const loadShifts = async () => {
    setFetching(true);
    try {
      const res = await fetchWithAuth('/jobs/my-shifts');
      const data = await res.json();
      if (!data.error) setShifts(data);
    } catch (e) {
      console.log("Failed fetching shifts", e);
    } finally {
      setFetching(false);
    }
  };



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Shifts</Text>
        <Text style={styles.subtitle}>Your scheduled assignments</Text>
      </View>

      {fetching && shifts.upcoming.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#4F46E5" />
      ) : (
        <FlatList
          data={shifts.upcoming}
          keyExtractor={(item, index) => item.id || `shift-${index}`}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={fetching} onRefresh={loadShifts} />}
          ListEmptyComponent={
             <View style={styles.emptyState}>
               <Text style={styles.emptyText}>You have no upcoming shifts assigned.</Text>
             </View>
          }
          renderItem={({ item }) => (
            <ShiftCard 
              shift={item} 
              onPress={() => router.push({ pathname: "/shift/[id]", params: { id: item.jobId, date: item.date || item.dayOfWeek } })} 
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    padding: 16,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
  }
});
