import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView, Alert, AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../providers/AuthProvider';
import { fetchWithAuth } from '../utils/apiClient';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotificationCount } from '../hooks/useNotificationCount';
import {
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
  ASYNC_STORE_ASSIGNMENT_KEY,
} from '../tasks/locationTask';

const CIRCLE_SIZE = Dimensions.get('window').width * 0.44;
const GEOFENCE_BREAK_THRESHOLD_SECS = 15 * 60; // 15 minutes cumulative outside
const GEOFENCE_POLL_MS = 30_000; // poll every 30 seconds

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
  const { token, signOut, user } = useAuth();
  const { count } = useNotificationCount();
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [pendingRecaps, setPendingRecaps] = useState<any[]>([]);

  // Derived clock state — must be computed before effects that depend on them
  const isDone = !!(activeAssignment?.clockIn && activeAssignment?.clockOut);
  const isClockedIn = !!(activeAssignment?.clockIn && !activeAssignment?.clockOut);

  // Geofence tracking refs (avoid stale closures inside interval)
  const storeRef = useRef<{ latitude: number; longitude: number; radius: number; name?: string } | null>(null);
  const assignmentIdRef = useRef<string | null>(null);
  const outsideSecondsRef = useRef(0);
  const isOnAutoBreakRef = useRef(false);

  useEffect(() => {
    if (token) {
      loadTodayShift();
      checkPendingRecaps();

      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          loadTodayShift();
          checkPendingRecaps();
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, [token]);

  // AppState only covers OS-level background→foreground; it does NOT fire when
  // navigating back to this tab in-app (e.g. tapping a notification and landing
  // on Home via router.push). Since Expo Router keeps tab screens mounted,
  // refetch on focus too so the pending-recap banner reflects state changes
  // (like a recap rejection) that happened while the worker was elsewhere.
  useFocusEffect(
    useCallback(() => {
      if (token) {
        loadTodayShift();
        checkPendingRecaps();
      }
    }, [token])
  );

  // When activeAssignment changes, sync it to AsyncStorage for the background task
  useEffect(() => {
    if (activeAssignment?.clockIn && !activeAssignment?.clockOut) {
      // Worker is clocked in — persist assignment for background task
      const store = activeAssignment.job?.store;
      const bgAssignment = {
        id: activeAssignment.id,
        store: store?.latitude != null && store?.longitude != null && store?.radius != null
          ? { latitude: store.latitude, longitude: store.longitude, radius: store.radius }
          : null,
      };
      AsyncStorage.setItem(ASYNC_STORE_ASSIGNMENT_KEY, JSON.stringify(bgAssignment)).catch(() => {});
    } else {
      // Not clocked in — clear persisted assignment so background task doesn't fire
      AsyncStorage.removeItem(ASYNC_STORE_ASSIGNMENT_KEY).catch(() => {});
    }
  }, [activeAssignment]);

  // Keep refs in sync with activeAssignment
  useEffect(() => {
    const store = activeAssignment?.job?.store;
    storeRef.current =
      store?.latitude != null && store?.longitude != null && store?.radius != null
        ? { latitude: store.latitude, longitude: store.longitude, radius: store.radius, name: store.name }
        : null;
    assignmentIdRef.current = activeAssignment?.id ?? null;
  }, [activeAssignment]);

  // Reset geofence tracking when clocked-in state changes
  useEffect(() => {
    if (!isClockedIn) {
      outsideSecondsRef.current = 0;
      isOnAutoBreakRef.current = false;
    }
  }, [isClockedIn]);

  // Poll location every 30s while clocked in to auto-trigger breaks
  useEffect(() => {
    if (!isClockedIn) return;

    const interval = setInterval(async () => {
      const store = storeRef.current;
      const aid = assignmentIdRef.current;
      if (!store || !aid) return;

      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const dist = haversineDistance(loc.coords.latitude, loc.coords.longitude, store.latitude, store.longitude);
        const isOutside = dist > store.radius;

        if (isOutside) {
          if (outsideSecondsRef.current === 0) {
            // First tick outside — warn before the break timer actually starts
            Notifications.scheduleNotificationAsync({
              content: {
                title: "You've left the store",
                body: `Break timer will start in 15 minutes if you don't return to ${store.name || 'your store'}.`,
                sound: true,
              },
              trigger: null,
            }).catch(() => {});
          }

          outsideSecondsRef.current += GEOFENCE_POLL_MS / 1000;
          if (outsideSecondsRef.current >= GEOFENCE_BREAK_THRESHOLD_SECS && !isOnAutoBreakRef.current) {
            const res = await fetchWithAuth('/timeclock', {
              method: 'POST',
              body: JSON.stringify({ action: 'BREAK_START', assignmentId: aid }),
            });
            if (res.ok) {
              isOnAutoBreakRef.current = true;
              Notifications.scheduleNotificationAsync({
                content: { title: 'Break time started', body: 'Break time is now being recorded.', sound: true },
                trigger: null,
              }).catch(() => {});
            }
          }
        } else {
          outsideSecondsRef.current = 0;
          if (isOnAutoBreakRef.current) {
            const res = await fetchWithAuth('/timeclock', {
              method: 'POST',
              body: JSON.stringify({ action: 'BREAK_END', assignmentId: aid }),
            });
            if (res.ok) {
              isOnAutoBreakRef.current = false;
              Notifications.scheduleNotificationAsync({
                content: { title: 'Break timer stopped', body: `Welcome back at ${store.name || 'the store'}.`, sound: true },
                trigger: null,
              }).catch(() => {});
            }
          }
        }
      } catch {
        // Location or network error — skip this tick
      }
    }, GEOFENCE_POLL_MS);

    return () => clearInterval(interval);
  }, [isClockedIn]);

  const loadTodayShift = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/timeclock');
      if (res.ok) {
        const data = await res.json();
        setActiveAssignment(data.activeAssignment || null);
      }
    } catch (e) {
      console.log("Failed to load active assignment", e);
    } finally {
      setLoading(false);
    }
  };

  const checkPendingRecaps = async () => {
    try {
      const res = await fetchWithAuth('/worker/pending-recaps');
      if (res.ok) {
        const data = await res.json();
        setPendingRecaps(data.pendingRecaps || []);
      }
    } catch (e) {
      console.log('Failed to check pending recaps', e);
    }
  };

  const handleClock = async () => {
    if (!activeAssignment) return;
    const action = activeAssignment.clockIn ? "CLOCK_OUT" : "CLOCK_IN";
    
    if (action === "CLOCK_IN") {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Required', 'Please enable location access to clock in.');
        return;
      }

      setClockLoading(true);
      let location;
      try {
         location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      } catch (e) {
         setClockLoading(false);
         Alert.alert('Location Error', 'Unable to determine your current location.');
         return;
      }

      try {
        const res = await fetchWithAuth('/timeclock', {
          method: "POST",
          body: JSON.stringify({ 
            action, 
            assignmentId: activeAssignment.id,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            lat: location.coords.latitude,
            lng: location.coords.longitude
          })
        });

        if (res.ok) {
          // Start background location tracking now that the worker is clocked in
          const store = activeAssignment.job?.store;
          startBackgroundLocationTracking({
            id: activeAssignment.id,
            store: store?.latitude != null && store?.longitude != null && store?.radius != null
              ? { latitude: store.latitude, longitude: store.longitude, radius: store.radius }
              : null,
          }).catch(() => {});
          await loadTodayShift();
        } else {
          const data = await res.json().catch(() => ({}));
          const msg = data.error || `Server error (${res.status})`;
          if (res.status === 403 && msg.toLowerCase().includes('recap')) {
            Alert.alert('Recap Required', msg);
          } else if (res.status === 403) {
            Alert.alert('Outside Store Location', `You must be physically at ${activeAssignment.job?.store?.name || 'the store'} to clock in.\n\n${msg}`);
          } else if (res.status === 400 && msg.toLowerCase().includes('early')) {
            Alert.alert('Too Early', msg);
          } else {
            Alert.alert('Clock In Failed', msg);
          }
        }
      } catch (e) {
        Alert.alert('Network Error', 'Please check your internet connection.');
      } finally {
        setClockLoading(false);
      }
    } else {
      // CLOCK_OUT — confirm first since the clock circle is easy to tap by accident
      Alert.alert(
        'Clock Out?',
        'Are you sure you want to clock out?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: performClockOut },
        ]
      );
    }
  };

  const performClockOut = async () => {
    if (!activeAssignment) return;
    setClockLoading(true);
    try {
      const res = await fetchWithAuth('/timeclock', {
        method: "POST",
        body: JSON.stringify({ action: "CLOCK_OUT", assignmentId: activeAssignment.id })
      });
      if (res.ok) {
        // Stop background location tracking now that the shift has ended
        stopBackgroundLocationTracking().catch(() => {});
        const shiftDate = activeAssignment.date
          ? new Date(activeAssignment.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        router.push(`/recap/${activeAssignment.jobId}?date=${shiftDate}&assignmentId=${activeAssignment.id}`);
      } else {
        const data = await res.json();
        Alert.alert("Clock out failed", data.error || "Failed to clock out.");
      }
    } catch (e) {
      Alert.alert("Network error", "Please check your internet connection.");
    } finally {
      setClockLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ─── Top Navbar ─── */}
      <View style={styles.navbar}>
        <View>
          <Text style={styles.brand}>Kruto Tastes</Text>
          <Text style={styles.userName}>{user?.name || 'Worker'}</Text>
        </View>
        <View style={styles.navIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/messages')}>
            <Text style={styles.iconEmoji}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
            <Text style={styles.iconEmoji}>🔔</Text>
            {count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{count}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={signOut}>
            <Text style={styles.logoutIcon}>↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── Clock Circle ─── */}
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

        {/* ─── Divider ─── */}
        <View style={styles.divider} />

        {/* ─── Time Indicators ─── */}
        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeValue}>{formatToClockTime(activeAssignment?.clockIn)}</Text>
            <Text style={styles.timeLabel}>START TIME</Text>
          </View>
          <View style={styles.timeBlock}>
            <Text style={styles.timeValue}>{formatToClockTime(activeAssignment?.clockOut)}</Text>
            <Text style={styles.timeLabel}>END TIME</Text>
          </View>
        </View>

        {/* ─── Pending Recap Banners ─── */}
        {pendingRecaps.map((recap: any) => (
          <TouchableOpacity
            key={recap.assignmentId}
            style={styles.recapBanner}
            onPress={() => {
              const shiftDate = recap.shiftDate
                ? new Date(recap.shiftDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
              router.push(`/recap/${recap.jobId}?date=${shiftDate}&assignmentId=${recap.assignmentId}`);
            }}
          >
            <View>
              <Text style={styles.recapBannerTitle}>📋 Pending Recap</Text>
              <Text style={styles.recapBannerText}>
                {recap.jobTitle || 'Shift'} at {recap.storeName || 'Store'}
              </Text>
            </View>
            <Text style={styles.recapBannerBtn}>Submit →</Text>
          </TouchableOpacity>
        ))}

        {/* ─── Today's Shift Card ─── */}
        <View style={styles.shiftCard}>
          <Text style={styles.shiftCardTitle}>Today's Shift</Text>
          {activeAssignment ? (
            <View>
              <Text style={styles.shiftTimeRange}>
                {formatTimeStr(activeAssignment.job?.startTimeStr)} - {formatTimeStr(activeAssignment.job?.endTimeStr)}
              </Text>
              <Text style={styles.shiftDate}>
                {activeAssignment.date
                  ? new Date(activeAssignment.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })
                  : new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
              <Text style={styles.shiftLocation}>{activeAssignment.job?.store?.address}</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>Take a break, you have no shifts today!</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 40 },

  /* ── Navbar ── */
  navbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingBottom: 14, paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderColor: '#F3F4F6',
  },
  brand: { fontSize: 20, fontWeight: '800', color: '#6366F1' },
  userName: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  navIcons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  iconEmoji: { fontSize: 18 },
  logoutIcon: { fontSize: 18, color: '#EF4444', fontWeight: '700' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  /* ── Circle ── */
  circleContainer: { alignItems: 'center', marginTop: 32, marginBottom: 16 },
  circle: {
    width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center', alignItems: 'center',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 12,
  },
  circleIn: { backgroundColor: '#6366F1', shadowColor: '#6366F1' },
  circleOut: { backgroundColor: '#EF4444', shadowColor: '#EF4444' },
  circleDone: { backgroundColor: '#10B981', shadowColor: '#10B981' },
  circleText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  circleStore: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },

  statusText: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginBottom: 16 },

  /* ── Divider ── */
  divider: { height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 32, marginBottom: 24 },

  /* ── Time Row ── */
  timeRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24, marginBottom: 8 },
  timeBlock: { alignItems: 'center' },
  timeValue: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  timeLabel: { fontSize: 10, fontWeight: '600', color: '#9CA3AF', letterSpacing: 1 },

  /* ── Shift Card ── */
  shiftCard: {
    backgroundColor: '#F9FAFB', marginHorizontal: 20, marginTop: 24,
    padding: 20, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB',
  },
  shiftCardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  shiftTimeRange: { fontSize: 18, fontWeight: '600', color: '#6366F1', marginBottom: 4 },
  shiftDate: { fontSize: 14, color: '#6B7280', marginBottom: 2 },
  shiftLocation: { fontSize: 13, color: '#9CA3AF' },
  emptyText: { fontSize: 14, color: '#6B7280' },

  /* ── Recap Banner ── */
  recapBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF7ED', marginHorizontal: 20, marginTop: 16,
    padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FDBA74',
  },
  recapBannerTitle: { fontSize: 15, fontWeight: '700', color: '#9A3412', marginBottom: 2 },
  recapBannerText: { fontSize: 13, color: '#C2410C' },
  recapBannerBtn: { fontSize: 15, fontWeight: '700', color: '#EA580C' },
});
