import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { router } from 'expo-router';
import { fetchWithAuth } from '../../utils/apiClient';
import ShiftCard from '../../components/ShiftCard';

export default function MyShiftsTab() {
  const { token, signOut, user } = useAuth();
  const [currentCycle, setCurrentCycle] = useState<any[]>([]);
  const [cycleLabel, setCycleLabel] = useState<string | null>(null);
  const [pendingReleaseIds, setPendingReleaseIds] = useState<string[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (token) loadShifts();
  }, [token]);

  const loadShifts = async () => {
    setFetching(true);
    try {
      const res = await fetchWithAuth('/jobs/my-shifts');
      const data = await res.json();
      if (!data.error) {
        setCurrentCycle(data.currentCycle || []);
        setCycleLabel(data.cycleLabel || null);
        setPendingReleaseIds(data.pendingReleaseAssignmentIds || []);
      }
    } catch (e) {
      console.log("Failed fetching shifts", e);
    } finally {
      setFetching(false);
    }
  };

  const handleRelease = async (assignmentId: string) => {
    try {
      const res = await fetchWithAuth('/jobs/actions', {
        method: 'POST',
        body: JSON.stringify({ action: 'RELEASE', assignmentId }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', "Release request submitted. You'll be notified when it's approved.");
        loadShifts();
      } else {
        Alert.alert('Error', data.error || 'Failed to release shift.');
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const handleClockIn = async (assignmentId: string, lat: number, lng: number) => {
    const res = await fetchWithAuth('/timeclock', {
      method: 'POST',
      body: JSON.stringify({ action: 'CLOCK_IN', assignmentId, latitude: lat, longitude: lng }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      Alert.alert('Clocked In', 'You have successfully clocked in.');
      loadShifts();
    } else {
      Alert.alert('Clock In Failed', data.error || `Error ${res.status}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <View>
          <Text style={styles.brand}>Kruto Tastes</Text>
          <Text style={styles.navSubtitle}>{user?.name || 'My Shifts'}</Text>
        </View>
        <View style={styles.navIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)/messages')}>
            <Text style={styles.iconEmoji}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
            <Text style={styles.iconEmoji}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={signOut}>
            <Text style={styles.logoutIcon}>↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      {fetching && currentCycle.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6366F1" />
      ) : (
        <FlatList
          data={currentCycle}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={fetching} onRefresh={loadShifts} />}
          ListHeaderComponent={
            cycleLabel ? <Text style={styles.cycleHeader}>{cycleLabel.toUpperCase()}</Text> : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyTitle}>No Shifts This Cycle</Text>
              <Text style={styles.emptyText}>No shifts assigned for this pay cycle yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ShiftCard
              shift={item}
              releaseStatus={pendingReleaseIds.includes(item.id) ? 'pending' : 'none'}
              onRelease={handleRelease}
              onClockIn={handleClockIn}
              onPress={() => router.push({ pathname: "/shift/[id]", params: { id: item.jobId, assignmentId: item.id } })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  navbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingBottom: 14, paddingHorizontal: 20,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F3F4F6',
  },
  brand: { fontSize: 20, fontWeight: '800', color: '#6366F1' },
  navSubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  navIcons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#F9FAFB',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6',
  },
  iconEmoji: { fontSize: 18 },
  logoutIcon: { fontSize: 18, color: '#EF4444', fontWeight: '700' },
  listContent: { padding: 16 },
  cycleHeader: { fontSize: 13, fontWeight: '700', color: '#6366F1', letterSpacing: 1, marginBottom: 16 },
  emptyState: { padding: 40, alignItems: 'center', marginTop: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 4 },
  emptyText: { color: '#6B7280', fontSize: 14 },
});
