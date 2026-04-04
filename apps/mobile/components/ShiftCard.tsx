import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ShiftCard({ shift, onPress }: { shift: any, onPress?: () => void }) {
  const isRecurring = shift.isRecurring;
  
  // Basic date parsing logic mirroring the web app
  let displayDate = "";
  if (shift.date) {
    const d = new Date(shift.date);
    displayDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } else if (isRecurring) {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    displayDate = `${days[shift.dayOfWeek]}s (Recurring)`;
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.date}>{displayDate}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{shift.job?.store?.name || 'Assigned Store'}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.role}>{shift.job?.role || 'Shift'}</Text>
        <Text style={styles.time}>{shift.job?.startTime} - {shift.job?.endTime}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    flexDirection: 'column',
  },
  role: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#6B7280',
  }
});
