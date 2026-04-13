import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { router } from 'expo-router';
import { fetchWithAuth } from '../../utils/apiClient';
import ShiftCard from '../../components/ShiftCard';

const getNextOccurrence = (dayOfWeek: number) => {
  const now = new Date();
  const result = new Date();
  const currentDay = now.getDay();
  let distance = (dayOfWeek - currentDay + 7) % 7;
  result.setDate(now.getDate() + distance);
  return result;
};

export default function MyShiftsTab() {
  const { token, signOut, user } = useAuth();
  const [shifts, setShifts] = useState<{upcoming: any[], currentCycle: any[], pendingReleases?: string[]}>({ upcoming: [], currentCycle: [] });
  const [fetching, setFetching] = useState(true);
  const [cycleStart, setCycleStart] = useState<string | null>(null);
  const [cycleEnd, setCycleEnd] = useState<string | null>(null);

  useEffect(() => {
    if (token) loadShifts();
  }, [token]);

  const loadShifts = async () => {
    setFetching(true);
    try {
      const res = await fetchWithAuth('/jobs/my-shifts');
      const data = await res.json();
      if (!data.error) {
        // Sort shifts by date ascending (earliest first)
        const sortByDate = (a: any, b: any) => {
          const getDate = (s: any) => {
            if (s.date) return new Date(s.date);
            if (s.isRecurring && s.dayOfWeek !== null && s.dayOfWeek !== undefined) return getNextOccurrence(s.dayOfWeek);
            return new Date(9999, 0);
          };
          return getDate(a).getTime() - getDate(b).getTime();
        };
        data.upcoming = (data.upcoming || []).sort(sortByDate);
        data.currentCycle = (data.currentCycle || []).sort(sortByDate);
        setShifts(data);
        if (data.cycleStart) setCycleStart(data.cycleStart);
        if (data.cycleEnd) setCycleEnd(data.cycleEnd);
      }
    } catch (e) {
      console.log("Failed fetching shifts", e);
    } finally {
      setFetching(false);
    }
  };

  const handleRelease = async (jobId: string, date: string) => {
    try {
      const res = await fetchWithAuth('/jobs/actions', {
        method: 'POST',
        body: JSON.stringify({ action: 'RELEASE', jobId, date }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Release request submitted.');
        loadShifts();
      } else {
        Alert.alert('Error', data.error || 'Failed to release shift.');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const getReleaseStatus = (shift: any): 'none' | 'pending' | 'released' => {
    if (!shifts.pendingReleases || shifts.pendingReleases.length === 0) return 'none';
    
    let shiftDate: string = '';
    if (shift.date) {
      shiftDate = new Date(shift.date).toISOString().split('T')[0];
    } else if (shift.isRecurring && shift.dayOfWeek !== null && shift.dayOfWeek !== undefined) {
      shiftDate = getNextOccurrence(shift.dayOfWeek).toISOString().split('T')[0];
    }
    
    if (!shiftDate) return 'none';
    const key = `${shift.jobId}|${shiftDate}`;
    return shifts.pendingReleases.includes(key) ? 'pending' : 'none';
  };

  // Format cycle date range header
  const cycleHeader = cycleStart && cycleEnd
    ? `${new Date(cycleStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()} – ${new Date(cycleEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}`
    : null;

  return (
    <View style={styles.container}>
      {/* ─── Navbar ─── */}
      <View style={styles.navbar}>
        <View>
          <Text style={styles.brand}>Workforce OS</Text>
          <Text style={styles.navSubtitle}>{user?.name || 'My Shifts'}</Text>
        </View>
        <View style={styles.navIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/messages')}>
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

      {fetching && (shifts.currentCycle || []).length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6366F1" />
      ) : (
        <FlatList
          data={shifts.currentCycle || []}
          keyExtractor={(item, index) => item.id || `shift-${index}`}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={fetching} onRefresh={loadShifts} />}
          ListHeaderComponent={
            cycleHeader ? (
              <Text style={styles.cycleHeader}>{cycleHeader}</Text>
            ) : null
          }
          ListEmptyComponent={
             <View style={styles.emptyState}>
               <Text style={styles.emptyEmoji}>📅</Text>
               <Text style={styles.emptyTitle}>No Upcoming Shifts</Text>
               <Text style={styles.emptyText}>You have no shifts assigned yet.</Text>
             </View>
          }
          renderItem={({ item }) => (
            <ShiftCard 
              shift={item}
              releaseStatus={getReleaseStatus(item)}
              onRelease={handleRelease}
              onPress={() => router.push({ pathname: "/shift/[id]", params: { id: item.jobId, date: item.date || item.dayOfWeek } })} 
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  /* ── Navbar ── */
  navbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingBottom: 14, paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderColor: '#F3F4F6',
  },
  brand: { fontSize: 20, fontWeight: '800', color: '#6366F1' },
  navSubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  navIcons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  iconEmoji: { fontSize: 18 },
  logoutIcon: { fontSize: 18, color: '#EF4444', fontWeight: '700' },

  listContent: { padding: 16 },
  cycleHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
    letterSpacing: 1,
    marginBottom: 16,
  },
  emptyState: { padding: 40, alignItems: 'center', marginTop: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 4 },
  emptyText: { color: '#6B7280', fontSize: 14 },
});
