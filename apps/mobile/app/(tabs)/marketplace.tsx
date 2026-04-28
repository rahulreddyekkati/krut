import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { fetchWithAuth } from '../../utils/apiClient';
import { router } from 'expo-router';

const formatTimeStr = (t?: string) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
};

export default function Marketplace() {
  const { signOut } = useAuth();
  const [shifts, setShifts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const loadOpenShifts = async () => {
    setFetching(true);
    try {
      const res = await fetchWithAuth('/jobs/open-shifts');
      const data = await res.json();
      setShifts(data.shifts || []);
    } catch {
      console.log("Failed fetching open shifts");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { loadOpenShifts(); }, []);

  const handleRequest = async (assignment: any) => {
    if (assignment.alreadyRequested) return;
    Alert.alert(
      "Request Shift",
      `Request shift at ${assignment.job?.store?.name} on ${assignment.date
        ? new Date(assignment.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
        : '?'}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request", onPress: async () => {
            try {
              const res = await fetchWithAuth('/jobs/actions', {
                method: "POST",
                body: JSON.stringify({ action: "ACCEPT", assignmentId: assignment.id })
              });
              const data = await res.json();
              if (res.ok) {
                Alert.alert("Success", "Request submitted! You'll be notified when approved.");
                loadOpenShifts();
              } else {
                Alert.alert("Error", data.error || "Failed to request shift.");
              }
            } catch {
              Alert.alert("Network Error", "Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <View>
          <Text style={styles.brand}>Kruto Tastes</Text>
          <Text style={styles.userName}>Open Shifts</Text>
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

      {fetching && shifts.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6366F1" />
      ) : (
        <FlatList
          data={shifts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={fetching} onRefresh={loadOpenShifts} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No Open Shifts</Text>
              <Text style={styles.emptyText}>No shifts available in your market right now.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const dateStr = item.date
              ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
              : '';
            const start = formatTimeStr(item.job?.startTimeStr);
            const end = formatTimeStr(item.job?.endTimeStr);
            return (
              <View style={styles.card}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardDate}>{dateStr}</Text>
                  <Text style={styles.cardStore}>{item.job?.store?.name || 'Store'}</Text>
                  <Text style={styles.cardTime}>{start} - {end}</Text>
                  <Text style={styles.cardMarket}>{item.job?.market?.name || ''}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.requestBtn, item.alreadyRequested && styles.requestBtnDone]}
                  onPress={() => handleRequest(item)}
                  disabled={item.alreadyRequested}
                >
                  <Text style={styles.requestBtnText}>
                    {item.alreadyRequested ? 'Requested' : 'Request'}
                  </Text>
                </TouchableOpacity>
              </View>
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
  userName: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  navIcons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#F9FAFB',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6',
  },
  iconEmoji: { fontSize: 18 },
  logoutIcon: { fontSize: 18, color: '#EF4444', fontWeight: '700' },
  listContent: { padding: 16 },
  emptyState: { padding: 40, alignItems: 'center', marginTop: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 4 },
  emptyText: { color: '#6B7280', fontSize: 14, textAlign: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardInfo: { flex: 1 },
  cardDate: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 3 },
  cardStore: { fontSize: 14, color: '#6B7280', marginBottom: 3 },
  cardTime: { fontSize: 14, fontWeight: '600', color: '#6366F1', marginBottom: 2 },
  cardMarket: { fontSize: 12, color: '#9CA3AF' },
  requestBtn: {
    backgroundColor: '#6366F1', paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 10, marginLeft: 12,
  },
  requestBtnDone: { backgroundColor: '#9CA3AF' },
  requestBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
