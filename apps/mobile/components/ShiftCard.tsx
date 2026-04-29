import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

const fmt = (timeStr?: string) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const haversineMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

interface ShiftCardProps {
  shift: any;
  releaseStatus?: 'none' | 'pending';
  onRelease?: (assignmentId: string) => void;
  onClockIn?: (assignmentId: string, lat: number, lng: number) => Promise<void>;
  onPress?: () => void;
}

export default function ShiftCard({ shift, releaseStatus = 'none', onRelease, onClockIn, onPress }: ShiftCardProps) {
  const [clockingIn, setClockingIn] = React.useState(false);

  const shiftDate = shift.date ? new Date(shift.date) : null;
  const now = new Date();

  const displayDate = shiftDate
    ? shiftDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
    : '';

  const storeName = shift.job?.store?.name || 'Store';
  const startStr = fmt(shift.job?.startTimeStr);
  const endStr = fmt(shift.job?.endTimeStr);

  // ── Time calculations ──────────────────────────────────────────────────────
  const [startH, startM] = (shift.job?.startTimeStr || '00:00').split(':').map(Number);
  const [endH, endM] = (shift.job?.endTimeStr || '23:59').split(':').map(Number);
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const isToday = shiftDate
    ? shiftDate.getUTCFullYear() === now.getFullYear() &&
      shiftDate.getUTCMonth() === now.getMonth() &&
      shiftDate.getUTCDate() === now.getDate()
    : false;

  const isPastDate = shiftDate
    ? new Date(shiftDate.getUTCFullYear(), shiftDate.getUTCMonth(), shiftDate.getUTCDate()) <
      new Date(now.getFullYear(), now.getMonth(), now.getDate())
    : false;

  // ── Status flags ───────────────────────────────────────────────────────────
  const isClockedIn = !!shift.clockIn && !shift.clockOut;
  const isDone = !!shift.clockIn && !!shift.clockOut;
  const isMissed = !shift.clockIn && (isPastDate || (isToday && nowMins > endMins));
  const isPendingRelease = releaseStatus === 'pending';
  // Allow clock-in starting 15 min before shift start
  const isInClockInWindow = isToday && nowMins >= startMins - 15 && nowMins <= endMins;

  const shiftStartMs = shiftDate
    ? new Date(shiftDate.getUTCFullYear(), shiftDate.getUTCMonth(), shiftDate.getUTCDate(), startH, startM).getTime()
    : Infinity;
  const hoursUntilStart = (shiftStartMs - now.getTime()) / 3600000;
  const canRelease = !isDone && !isClockedIn && !isMissed && !isPendingRelease && hoursUntilStart >= 2;

  // ── Clock-in handler ───────────────────────────────────────────────────────
  const handleClockIn = async () => {
    if (!onClockIn) return;
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location Required', 'Enable location access to clock in.');
      return;
    }
    setClockingIn(true);
    try {
      let loc;
      try {
        loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      } catch {
        Alert.alert('Location Error', 'Unable to get your current location. Try again.');
        return;
      }

      const store = shift.job?.store;
      if (store?.latitude != null && store?.longitude != null && store?.radius != null) {
        const dist = haversineMeters(loc.coords.latitude, loc.coords.longitude, store.latitude, store.longitude);
        if (dist > store.radius) {
          Alert.alert(
            'Outside Store Location',
            `You are ${Math.round(dist)}m away from ${store.name}. You must be within ${Math.round(store.radius)}m to clock in.`
          );
          return;
        }
      }

      await onClockIn(shift.id, loc.coords.latitude, loc.coords.longitude);
    } finally {
      setClockingIn(false);
    }
  };

  const handleRelease = () => {
    if (!onRelease) return;
    Alert.alert(
      'Release Shift',
      `Release your shift on ${displayDate}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Release', style: 'destructive', onPress: () => onRelease(shift.id) },
      ]
    );
  };

  // ── Badge ──────────────────────────────────────────────────────────────────
  const renderBadge = () => {
    if (isDone) return <View style={[styles.badge, styles.doneBadge]}><Text style={[styles.badgeText, { color: '#059669' }]}>Done</Text></View>;
    if (isClockedIn) return <View style={[styles.badge, styles.clockedInBadge]}><Text style={[styles.badgeText, { color: '#2563EB' }]}>Clocked In</Text></View>;
    if (isMissed) return <View style={[styles.badge, styles.missedBadge]}><Text style={[styles.badgeText, { color: '#6B7280' }]}>Missed</Text></View>;
    if (isPendingRelease) return <View style={[styles.badge, styles.requestedBadge]}><Text style={[styles.badgeText, { color: '#D97706' }]}>Requested</Text></View>;
    if (isInClockInWindow) return (
      <TouchableOpacity style={[styles.badge, styles.clockInBadge]} onPress={handleClockIn} disabled={clockingIn}>
        {clockingIn
          ? <ActivityIndicator size="small" color="#fff" />
          : <Text style={[styles.badgeText, { color: '#fff' }]}>Clock In</Text>}
      </TouchableOpacity>
    );
    if (canRelease && onRelease) return (
      <TouchableOpacity style={[styles.badge, styles.releaseBadge]} onPress={handleRelease}>
        <Text style={[styles.badgeText, { color: '#EF4444' }]}>Release</Text>
      </TouchableOpacity>
    );
    return null;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.date}>{displayDate}</Text>
          <Text style={styles.store}>{storeName}</Text>
          {startStr && endStr ? <Text style={styles.time}>{startStr} - {endStr}</Text> : null}
        </View>
        {renderBadge()}
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
  badge: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginLeft: 12,
    alignItems: 'center', justifyContent: 'center', minWidth: 84,
  },
  badgeText: { fontSize: 13, fontWeight: '700' },
  doneBadge: { backgroundColor: '#D1FAE5' },
  clockedInBadge: { backgroundColor: '#DBEAFE' },
  missedBadge: { backgroundColor: '#F3F4F6' },
  requestedBadge: { backgroundColor: '#FEF3C7' },
  clockInBadge: { backgroundColor: '#6366F1' },
  releaseBadge: { backgroundColor: '#FEE2E2' },
});
