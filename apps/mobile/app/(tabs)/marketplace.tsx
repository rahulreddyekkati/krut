import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl, Alert } from 'react-native';
import { fetchWithAuth } from '../../utils/apiClient';
import ShiftCard from '../../components/ShiftCard';

export default function Marketplace() {
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
        loadOpenShifts(); // Refresh
      } else {
        Alert.alert("Error", data.error || "Failed to request shift.");
      }
    } catch(e) {
      Alert.alert("Network Error");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Open Shifts</Text>
        <Text style={styles.subtitle}>Claim available requests in your market</Text>
      </View>

      {fetching && shifts.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#4F46E5" />
      ) : (
        <FlatList
          data={shifts}
          keyExtractor={(item, index) => item.id || `open-${index}`}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={fetching} onRefresh={loadOpenShifts} />}
          ListEmptyComponent={
             <View style={styles.emptyState}>
               <Text style={styles.emptyText}>There are no open shifts in your market.</Text>
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
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280' },
  listContent: { padding: 16 },
  emptyState: { padding: 24, alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#6B7280', fontSize: 16 }
});
