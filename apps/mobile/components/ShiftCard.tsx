import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const formatTimeStr = (timeStr?: string) => {
  if (!timeStr) return "";
  try {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  } catch { return timeStr; }
};

const getNextOccurrence = (dayOfWeek: number) => {
  const now = new Date();
  const result = new Date();
  const currentDay = now.getDay();
  let distance = (dayOfWeek - currentDay + 7) % 7;
  result.setDate(now.getDate() + distance);
  return result;
};

interface ShiftCardProps {
  shift: any;
  onPress?: () => void;
  onRelease?: (jobId: string, date: string) => void;
  releaseStatus?: 'none' | 'pending' | 'released';
}

export default function ShiftCard({ shift, onPress, onRelease, releaseStatus = 'none' }: ShiftCardProps) {
  // Determine the display date
  let displayDate = "";
  let shiftDate: Date | null = null;

  if (shift.date) {
    shiftDate = new Date(shift.date);
    displayDate = shiftDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
  } else if (shift.isRecurring && shift.dayOfWeek !== null && shift.dayOfWeek !== undefined) {
    shiftDate = getNextOccurrence(shift.dayOfWeek);
    displayDate = shiftDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  const storeName = shift.job?.store?.name || 'Store';
  const startTime = formatTimeStr(shift.job?.startTimeStr);
  const endTime = formatTimeStr(shift.job?.endTimeStr);
  const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : '';

  // 2-hour release buffer check
  const BUFFER_HOURS = 2;
  let canRelease = true;
  if (shiftDate && shift.job?.startTimeStr) {
    const [startH, startM] = shift.job.startTimeStr.split(':').map(Number);
    const shiftStartTime = new Date(shiftDate);
    shiftStartTime.setHours(startH, startM, 0, 0);
    const now = new Date();
    const hoursUntilShift = (shiftStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilShift < BUFFER_HOURS) {
      canRelease = false;
    }
  }

  const handleRelease = () => {
    if (!onRelease || !shiftDate) return;
    if (!canRelease) {
      Alert.alert('Cannot Release', 'Shifts cannot be released within 2 hours of the start time.');
      return;
    }
    Alert.alert(
      'Release Shift',
      `Are you sure you want to release this shift on ${displayDate}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Release', style: 'destructive', onPress: () => {
          onRelease(shift.jobId, shiftDate!.toISOString().split('T')[0]);
        }},
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.date}>{displayDate}</Text>
          <Text style={styles.store}>{storeName}</Text>
          {timeRange ? <Text style={styles.time}>{timeRange}</Text> : null}
        </View>

        {/* Release button area */}
        {releaseStatus === 'pending' ? (
          <View style={styles.requestedBadge}>
            <Text style={styles.requestedText}>Requested</Text>
          </View>
        ) : !canRelease && onRelease ? (
          <View style={[styles.releaseBtn, { opacity: 0.4 }]}>
            <Text style={[styles.releaseBtnText, { color: '#9CA3AF' }]}>Too Late</Text>
          </View>
        ) : onRelease ? (
          <TouchableOpacity style={styles.releaseBtn} onPress={handleRelease} activeOpacity={0.7}>
            <Text style={styles.releaseBtnText}>Release</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  date: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  store: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  releaseBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  releaseBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  requestedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  requestedText: {
    color: '#D97706',
    fontSize: 13,
    fontWeight: '600',
  },
});
