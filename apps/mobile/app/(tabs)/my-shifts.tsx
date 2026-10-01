import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../providers/AuthProvider';
import { router } from 'expo-router';
import { fetchWithAuth } from '../../utils/apiClient';
import ShiftCard from '../../components/ShiftCard';

export default function MyShiftsTab() {
  const { token, signOut, user } = useAuth();
  const [previousCompleted, setPreviousCompleted] = useState<any[]>([]);
  const [currentCycle, setCurrentCycle] = useState<any[]>([]);
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([]);
  const [cycleLabel, setCycleLabel] = useState<string | null>(null);
  const [nextCycle, setNextCycle] = useState<{ start: number; end: number; label: string } | null>(null);
  const [pendingReleaseIds, setPendingReleaseIds] = useState<string[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (token) loadShifts();
  }, [token]);

  // Refetch on focus too — router.push from the notifications screen doesn't
  // remount this tab, so a stale list would otherwise hide new/removed shifts.
  useFocusEffect(
    useCallback(() => {
      if (token) loadShifts();
    }, [token])
  );

  const loadShifts = async () => {
    setFetching(true);
    try {
      const res = await fetchWithAuth('/jobs/my-shifts');
      const data = await res.json();
      if (!data.error) {
        setPreviousCompleted(data.previousCompleted || []);
        setCurrentCycle(data.currentCycle || []);
        setCycleLabel(data.cycleLabel || null);
        setNextCycle(
          data.nextCycleStart && data.nextCycleEnd && data.nextCycleLabel
            ? { start: new Date(data.nextCycleStart).getTime(), end: new Date(data.nextCycleEnd).getTime(), label: data.nextCycleLabel }
            : null
        );
        setPendingReleaseIds(data.pendingReleaseAssignmentIds || []);
        const cycleEndDate = data.cycleEnd ? new Date(data.cycleEnd) : null;
        const afterCycle = (data.upcoming || []).filter(
          (a: any) => a.date && cycleEndDate && new Date(a.date) > cycleEndDate
        );
        setUpcomingShifts(afterCycle);
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

  const shifts = [...previousCompleted, ...currentCycle, ...upcomingShifts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Section headers are placed by date range, not by which list a shift came from — a
  // one-off shift dated beyond the next cycle belongs under "Later", not the next cycle.
  const sectionOf = (item: any): 'next' | 'later' | null => {
    if (!nextCycle || !item?.date) return null;
    const t = new Date(item.date).getTime();
    if (t > nextCycle.end) return 'later';
    return t >= nextCycle.start ? 'next' : null;
  };
  const sectionHeaderFor = (item: any, index: number): string | null => {
    const section = sectionOf(item);
    if (!section || (index > 0 && sectionOf(shifts[index - 1]) === section)) return null;
    return section === 'next' ? nextCycle!.label.toUpperCase() : 'LATER';
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
          data={shifts}
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
          renderItem={({ item, index }) => {
            const sectionHeader = sectionHeaderFor(item, index);
            return (
              <>
                {sectionHeader ? <Text style={[styles.cycleHeader, styles.sectionHeader]}>{sectionHeader}</Text> : null}
                <ShiftCard
                  shift={item}
                  releaseStatus={pendingReleaseIds.includes(item.id) ? 'pending' : 'none'}
                  onRelease={handleRelease}
                  onClockIn={handleClockIn}
                  onPress={() => router.push({ pathname: "/shift/[id]", params: { id: item.jobId, assignmentId: item.id } })}
                />
              </>
            );
          }}
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
  sectionHeader: { marginTop: 12 },
  emptyState: { padding: 40, alignItems: 'center', marginTop: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 4 },
  emptyText: { color: '#6B7280', fontSize: 14 },
});
