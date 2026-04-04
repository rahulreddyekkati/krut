import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { fetchWithAuth } from '../../utils/apiClient';
import ShiftCard from '../../components/ShiftCard';
import { router } from 'expo-router';

export default function Marketplace() {
  const { signOut } = useAuth();
  const [shifts, setShifts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const loadOpenShifts = async () => {
    setFetching(true);
    try {
      const res = await fetchWithAuth('/jobs/open-shifts');
      const data = await res.json();
      if (!data.error) setShifts(data.shifts || []);
    } catch (e) {
      console.log("Failed fetching open shifts", e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadOpenShifts();
  }, []);

  const handleRequestShift = async (shiftId: string, date?: string) => {
    try {
      const res = await fetchWithAuth(`/jobs/${shiftId}/actions`, {
        method: "POST",
        body: JSON.stringify({ action: "ACCEPT", date })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "You have requested this shift.");
        loadOpenShifts();
      } else {
        Alert.alert("Error", data.error || "Failed to request shift.");
      }
    } catch(e) {
      Alert.alert("Network Error");
    }
  };

  return (
    <View style={styles.container}>
      {/* ─── Navbar ─── */}
      <View style={styles.navbar}>
        <View>
          <Text style={styles.brand}>Workforce OS</Text>
          <Text style={styles.userName}>Open Shifts</Text>
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

      {fetching && shifts.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6366F1" />
      ) : (
        <FlatList
          data={shifts}
          keyExtractor={(item, index) => item.id || `open-${index}`}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={fetching} onRefresh={loadOpenShifts} />}
          ListEmptyComponent={
             <View style={styles.emptyState}>
               <Text style={styles.emptyEmoji}>🔍</Text>
               <Text style={styles.emptyTitle}>No Open Shifts</Text>
               <Text style={styles.emptyText}>Check back later for available shifts in your market.</Text>
             </View>
          }
          renderItem={({ item }) => (
            <ShiftCard 
              shift={item} 
              onPress={() => {
                 Alert.alert(
                   "Request Shift",
                   `Would you like to request this shift at ${item.job?.store?.name}?`,
                   [
                     { text: "Cancel", style: "cancel" },
                     { text: "Request", onPress: () => handleRequestShift(item.jobId, item.date) }
                   ]
                 );
              }} 
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
  emptyText: { color: '#6B7280', fontSize: 14, textAlign: 'center' },
});
