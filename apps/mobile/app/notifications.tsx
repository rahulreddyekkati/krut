import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { fetchWithAuth } from '../utils/apiClient';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (e) {
      console.log('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (ids: string[]) => {
    try {
      const res = await fetchWithAuth('/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
      }
    } catch (e) {
      console.log('Failed to mark as read', e);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'SHIFT_ASSIGNED': return '📅';
      case 'SHIFT_RELEASED': return '🔄';
      case 'MESSAGE': return '💬';
      case 'RECAP_DUE': return '📋';
      default: return '🔔';
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 ? (
          <TouchableOpacity onPress={() => markAsRead(notifications.map((n) => n.id))}>
            <Text style={styles.clearAll}>Clear All</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6366F1" />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyText}>You have no new notifications.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.notifItem}
              onPress={() => markAsRead([item.id])}
              activeOpacity={0.7}
            >
              <View style={styles.notifIcon}>
                <Text style={{ fontSize: 22 }}>{getNotifIcon(item.type)}</Text>
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{item.title || item.type?.replace(/_/g, ' ')}</Text>
                <Text style={styles.notifBody} numberOfLines={2}>{item.message || item.body}</Text>
                <Text style={styles.notifTime}>{getTimeAgo(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 58, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F3F4F6',
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 18, color: '#6366F1', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  clearAll: { fontSize: 14, color: '#EF4444', fontWeight: '600' },

  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 4 },
  emptyText: { fontSize: 14, color: '#6B7280' },

  notifItem: {
    flexDirection: 'row', padding: 14, borderRadius: 12,
    marginBottom: 8, backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#EEF2FF',
  },
  notifIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  notifBody: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  notifTime: { fontSize: 11, color: '#D1D5DB' },
});
