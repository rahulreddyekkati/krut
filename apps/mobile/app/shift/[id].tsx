import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { fetchWithAuth } from '../../utils/apiClient';

const CIRCLE_SIZE = Dimensions.get('window').width * 0.52;

export default function ShiftDetails() {
  const { id, date } = useLocalSearchParams();
  const [clockActionLoading, setClockActionLoading] = useState(false);
  const [hasClockedIn, setHasClockedIn] = useState(false);
  const [startTime, setStartTime] = useState('--:--');
  const [endTime, setEndTime] = useState('--:--');

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleClockIn = async () => {
    setClockActionLoading(true);
    try {
      const res = await fetchWithAuth(`/jobs/${id}/clock-in`, {
        method: "POST",
        body: JSON.stringify({ date })
      });
      const data = await res.json();
      if (res.ok) {
        setHasClockedIn(true);
        setStartTime(formatTime(new Date()));
        Alert.alert("Clocked In", "Your shift has started. Good luck!");
      } else {
        Alert.alert("Error", data.error || "Failed to clock in");
      }
    } catch {
      Alert.alert("Network Error");
    } finally {
      setClockActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockActionLoading(true);
    try {
      const res = await fetchWithAuth(`/jobs/${id}/clock-out`, {
        method: "POST",
        body: JSON.stringify({ date })
      });
      const data = await res.json();
      if (res.ok) {
        setEndTime(formatTime(new Date()));
        setHasClockedIn(false);
        Alert.alert("Clocked Out", "Great work today!", [
           { text: "Log Recap", onPress: () => router.replace({ pathname: "/recap/[id]", params: { id, date } }) },
           { text: "Done", style: "cancel" }
        ]);
      } else {
        Alert.alert("Error", data.error || "Failed to clock out");
      }
    } catch {
      Alert.alert("Network Error");
    } finally {
      setClockActionLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shift Details</Text>
        <View style={{width: 50}} />
      </View>

      {/* Giant Clock Circle */}
      <View style={styles.circleContainer}>
        <TouchableOpacity
          style={[
            styles.circle,
            hasClockedIn ? styles.circleOut : styles.circleIn
          ]}
          onPress={hasClockedIn ? handleClockOut : handleClockIn}
          disabled={clockActionLoading}
          activeOpacity={0.8}
        >
          {clockActionLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <Text style={styles.circleText}>
              {hasClockedIn ? 'Clock Out' : 'Clock In'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Time Indicators */}
      <View style={styles.timeRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeValue}>{startTime}</Text>
          <Text style={styles.timeLabel}>START TIME</Text>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.timeValue}>--:--</Text>
          <Text style={styles.timeLabel}>BREAK TIME</Text>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.timeValue}>{endTime}</Text>
          <Text style={styles.timeLabel}>END TIME</Text>
        </View>
      </View>

      {/* Status message */}
      <Text style={styles.statusText}>
        {hasClockedIn ? 'You are currently on shift' : 'No shift active today'}
      </Text>

      {/* Today's Shift Card */}
      <View style={styles.shiftCard}>
        <Text style={styles.shiftCardTitle}>Today's Shift</Text>
        <Text style={styles.shiftCardBody}>
          {hasClockedIn
            ? `Started at ${startTime}`
            : 'Tap the button above to start your shift!'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: '#6366F1', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

  /* Circle */
  circleContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  circleIn: {
    backgroundColor: '#6366F1',
  },
  circleOut: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  circleText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 32,
    marginBottom: 24,
  },

  /* Time Row */
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  timeBlock: {
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
  },

  /* Status */
  statusText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 12,
    marginBottom: 24,
  },

  /* Today's Shift Card */
  shiftCard: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shiftCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  shiftCardBody: {
    fontSize: 14,
    color: '#6B7280',
  },
});
