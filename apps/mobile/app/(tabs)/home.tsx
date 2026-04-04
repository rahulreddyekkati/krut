import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { fetchWithAuth } from '../../utils/apiClient';

const CIRCLE_SIZE = Dimensions.get('window').width * 0.48;

const formatToClockTime = (dateStr: string | null) => {
  if (!dateStr) return "--:--";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatTimeStr = (timeStr?: string) => {
  if (!timeStr) return "-";
  try {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  } catch { return timeStr; }
};

export default function HomeTab() {
  const { token } = useAuth();
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);

  useEffect(() => {
    if (token) loadTodayShift();
  }, [token]);

  const loadTodayShift = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/timeclock/active');
      if (res.ok) {
        const data = await res.json();
        setActiveAssignment(data.assignment || null);
      }
    } catch (e) {
      console.log("Failed to load active assignment", e);
    } finally {
      setLoading(false);
    }
  };

  const handleClock = async () => {
    if (!activeAssignment) return;
    const action = activeAssignment.clockIn ? "CLOCK_OUT" : "CLOCK_IN";
    setClockLoading(true);
    try {
      const res = await fetchWithAuth('/timeclock', {
        method: "POST",
        body: JSON.stringify({ action, assignmentId: activeAssignment.id })
      });
      if (res.ok) {
        await loadTodayShift();
      } else {
        const data = await res.json();
        console.log("Clock action failed:", data.error);
      }
    } catch (e) {
      console.log("Network error during clock action", e);
    } finally {
      setClockLoading(false);
    }
  };

  const isDone = activeAssignment?.clockIn && activeAssignment?.clockOut;
  const isClockedIn = activeAssignment?.clockIn && !activeAssignment?.clockOut;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Circle Button */}
      <View style={styles.circleContainer}>
        <TouchableOpacity
          style={[
            styles.circle,
            isDone ? styles.circleDone : isClockedIn ? styles.circleOut : styles.circleIn
          ]}
          onPress={handleClock}
          disabled={clockLoading || !activeAssignment || isDone}
          activeOpacity={0.8}
        >
          {clockLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Text style={styles.circleText}>
                {isDone ? 'Done' : isClockedIn ? 'Clock Out' : 'Clock In'}
              </Text>
              {activeAssignment && (
                <Text style={styles.circleStore}>{activeAssignment.job?.store?.name}</Text>
              )}
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Restriction Message */}
      {!activeAssignment && !loading && (
        <Text style={styles.statusText}>No shift active today</Text>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Time Indicators */}
      <View style={styles.timeRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeValue}>{formatToClockTime(activeAssignment?.clockIn)}</Text>
          <Text style={styles.timeLabel}>START TIME</Text>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.timeValue}>--:--</Text>
          <Text style={styles.timeLabel}>BREAK TIME</Text>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.timeValue}>{formatToClockTime(activeAssignment?.clockOut)}</Text>
          <Text style={styles.timeLabel}>END TIME</Text>
        </View>
      </View>

      {/* Today's Shift Card */}
      <View style={styles.shiftCard}>
        <Text style={styles.shiftCardTitle}>Today's Shift</Text>
        {activeAssignment ? (
          <View>
            <Text style={styles.shiftTimeRange}>
              {formatTimeStr(activeAssignment.job?.startTimeStr)} - {formatTimeStr(activeAssignment.job?.endTimeStr)}
            </Text>
            <Text style={styles.shiftDate}>
              {activeAssignment.date
                ? new Date(activeAssignment.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
                : new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            <Text style={styles.shiftLocation}>{activeAssignment.job?.store?.address}</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>Take a break, you have no shifts today!</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 40 },

  circleContainer: { alignItems: 'center', marginTop: 50, marginBottom: 16 },
  circle: {
    width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center', alignItems: 'center',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 12,
  },
  circleIn: { backgroundColor: '#6366F1', shadowColor: '#6366F1' },
  circleOut: { backgroundColor: '#EF4444', shadowColor: '#EF4444' },
  circleDone: { backgroundColor: '#10B981', shadowColor: '#10B981' },
  circleText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  circleStore: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },

  statusText: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginBottom: 16 },

  divider: { height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 32, marginBottom: 24 },

  timeRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24, marginBottom: 8 },
  timeBlock: { alignItems: 'center' },
  timeValue: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  timeLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', letterSpacing: 1 },

  shiftCard: {
    backgroundColor: '#F9FAFB', marginHorizontal: 24, marginTop: 24,
    padding: 20, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB',
  },
  shiftCardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  shiftTimeRange: { fontSize: 18, fontWeight: '600', color: '#6366F1', marginBottom: 4 },
  shiftDate: { fontSize: 14, color: '#6B7280', marginBottom: 2 },
  shiftLocation: { fontSize: 13, color: '#9CA3AF' },
  emptyText: { fontSize: 14, color: '#6B7280' },
});
