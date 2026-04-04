import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { router } from 'expo-router';
import { fetchWithAuth } from '../../utils/apiClient';
import ShiftCard from '../../components/ShiftCard';

export default function MyShiftsTab() {
  const { token, signOut } = useAuth();
  const [shifts, setShifts] = useState<{upcoming: any[], currentCycle: any[]}>({ upcoming: [], currentCycle: [] });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (token) loadShifts();
  }, [token]);

  const loadShifts = async () => {
    setFetching(true);
    try {
      const res = await fetchWithAuth('/jobs/my-shifts');
      const data = await res.json();
      if (!data.error) setShifts(data);
    } catch (e) {
      console.log("Failed fetching shifts", e);
    } finally {
      setFetching(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ─── Navbar ─── */}
      <View style={styles.navbar}>
        <View>
          <Text style={styles.brand}>Workforce OS</Text>
          <Text style={styles.userName}>My Shifts</Text>
        </View>
        <View style={styles.navIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconEmoji}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconEmoji}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={signOut}>
            <Text style={styles.logoutIcon}>↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      {fetching && shifts.upcoming.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6366F1" />
      ) : (
        <FlatList
          data={shifts.upcoming}
          keyExtractor={(item, index) => item.id || `shift-${index}`}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={fetching} onRefresh={loadShifts} />}
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
  userName: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  navIcons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  iconEmoji: { fontSize: 18 },
  logoutIcon: { fontSize: 18, color: '#EF4444', fontWeight: '700' },

  listContent: { padding: 16 },
  emptyState: { padding: 40, alignItems: 'center', marginTop: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 4 },
  emptyText: { color: '#6B7280', fontSize: 14 },
});
