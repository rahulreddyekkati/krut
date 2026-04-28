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

interface ShiftCardProps {
  shift: any;
  onPress?: () => void;
  onRelease?: (assignmentId: string) => void;
  releaseStatus?: 'none' | 'pending';
}

export default function ShiftCard({ shift, onPress, onRelease, releaseStatus = 'none' }: ShiftCardProps) {
  const shiftDate = shift.date ? new Date(shift.date) : null;
  const displayDate = shiftDate
    ? shiftDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
    : '';

  const storeName = shift.job?.store?.name || shift.storeName || 'Store';
  const startTime = formatTimeStr(shift.job?.startTimeStr);
  const endTime = formatTimeStr(shift.job?.endTimeStr);
  const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : '';

  let canRelease = true;
  if (shiftDate && shift.job?.startTimeStr) {
    const [startH, startM] = shift.job.startTimeStr.split(':').map(Number);
    const shiftStartTime = new Date(shiftDate);
    shiftStartTime.setUTCHours(startH, startM, 0, 0);
    const hoursUntilShift = (shiftStartTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilShift < 2) canRelease = false;
  }

  const handleRelease = () => {
    if (!onRelease || !shift.id) return;
    if (!canRelease) {
      Alert.alert('Cannot Release', 'Shifts cannot be released within 2 hours of the start time.');
      return;
    }
    Alert.alert(
      'Release Shift',
      `Are you sure you want to release this shift on ${displayDate}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Release', style: 'destructive', onPress: () => onRelease(shift.id) },
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

        {releaseStatus === 'pending' ? (
          <View style={styles.requestedBadge}>
            <Text style={styles.requestedText}>Pending Approval</Text>
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
    backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info: { flex: 1 },
  date: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 4 },
  store: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  time: { fontSize: 14, fontWeight: '600', color: '#6366F1' },
  releaseBtn: {
    backgroundColor: '#FEE2E2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginLeft: 12,
  },
  releaseBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
  requestedBadge: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 12,
  },
  requestedText: { color: '#D97706', fontSize: 13, fontWeight: '600' },
});
