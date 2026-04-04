import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { fetchWithAuth } from '../../utils/apiClient';

export default function ShiftDetails() {
  const { id, date } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [clockActionLoading, setClockActionLoading] = useState(false);
  
  // Hardcoded for demo MVP, real app fetches job status from /api/jobs/[id]
  const [hasClockedIn, setHasClockedIn] = useState(false);

  // In reality, you'd fetch the explicit shift details on mount here.

  const handleClockIn = async () => {
    setClockActionLoading(true);
    try {
      const res = await fetchWithAuth(`/jobs/${id}/clock-in`, {
        method: "POST",
        body: JSON.stringify({ date })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "You have clocked in.");
        setHasClockedIn(true);
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
        Alert.alert("Success", "You have clocked out.", [
           { text: "Log Recap", onPress: () => router.replace({ pathname: "/recap/[id]", params: { id, date } }) }
        ]);
        setHasClockedIn(false);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Shift Details</Text>
        <View style={{width: 50}} />
      </View>

      <View style={styles.card}>
        <Text style={styles.jobId}>Job ID: {id}</Text>
        <Text style={styles.dateLabel}>Date Indicator: {date}</Text>
        
        <View style={styles.actions}>
          {!hasClockedIn ? (
            <TouchableOpacity 
              style={[styles.button, styles.clockIn]} 
              onPress={handleClockIn}
              disabled={clockActionLoading}
            >
               {clockActionLoading ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>Clock In</Text>}
            </TouchableOpacity>
          ) : (
             <TouchableOpacity 
              style={[styles.button, styles.clockOut]} 
              onPress={handleClockOut}
              disabled={clockActionLoading}
            >
               {clockActionLoading ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>Clock Out</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  jobId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 32,
  },
  actions: {
    marginTop: 20,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  clockIn: {
    backgroundColor: '#10B981',
  },
  clockOut: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  }
});
