import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { fetchWithAuth } from '../utils/apiClient';
import { useNotificationCount } from '../hooks/useNotificationCount';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Infer icon and accent from the notification title / message text since the
// DB model has no "type" field — we match on keywords in the title.
function getNotifMeta(title: string, message: string): { icon: string; color: string } {
  const t = (title + ' ' + message).toLowerCase();
  if (t.includes('recap')) return { icon: '📋', color: '#FEF3C7' };
  if (t.includes('message') || t.includes('chat')) return { icon: '💬', color: '#EDE9FE' };
  if (t.includes('shift') && (t.includes('assign') || t.includes('schedul')))
    return { icon: '📅', color: '#DBEAFE' };
  if (t.includes('release') || t.includes('open shift')) return { icon: '🔄', color: '#D1FAE5' };
  if (t.includes('clock') || t.includes('check')) return { icon: '🕐', color: '#FEE2E2' };
  if (t.includes('break')) return { icon: '☕', color: '#F3F4F6' };
  if (t.includes('approved') || t.includes('accept')) return { icon: '✅', color: '#D1FAE5' };
  if (t.includes('reject') || t.includes('denied')) return { icon: '❌', color: '#FEE2E2' };
  return { icon: '🔔', color: '#EEF2FF' };
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { refetch: refetchCount } = useNotificationCount();

  const loadNotifications = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetchWithAuth('/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markRead = async (ids: string[]) => {
    try {
      const res = await fetchWithAuth('/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
        refetchCount();
      }
    } catch {
      // silently ignore
    }
  };

  const handleTap = (item: Notification) => {
    // Mark as read first
    markRead([item.id]);

    // Navigate to relevant screen based on content keywords
    const t = (item.title + ' ' + item.message).toLowerCase();
    if (t.includes('recap')) {
      router.push('/(tabs)'); // Worker goes home to see pending recap banner
    } else if (t.includes('message') || t.includes('chat')) {
      router.push('/(tabs)/messages');
    } else if (t.includes('shift') || t.includes('release') || t.includes('open shift')) {
      router.push('/(tabs)/my-shifts');
    }
    // Otherwise just dismiss (mark read)
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const { icon, color } = getNotifMeta(item.title, item.message);
    return (
      <TouchableOpacity
        style={styles.notifItem}
        onPress={() => handleTap(item)}
        activeOpacity={0.75}
      >
        <View style={[styles.notifIcon, { backgroundColor: color }]}>
          <Text style={{ fontSize: 22 }}>{icon}</Text>
        </View>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.notifBody} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.notifTime}>{getTimeAgo(item.createdAt)}</Text>
        </View>
        <View style={styles.unreadDot} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 ? (
          <TouchableOpacity
            onPress={() => markRead(notifications.map((n) => n.id))}
            style={styles.clearBtn}
          >
            <Text style={styles.clearAll}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#6366F1" />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={styles.emptyTitle}>You're all caught up!</Text>
          <Text style={styles.emptyText}>No unread notifications right now.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 }}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadNotifications(true)}
              tintColor="#6366F1"
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: { padding: 4, minWidth: 60 },
  backText: { fontSize: 17, color: '#6366F1', fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  clearBtn: { minWidth: 80, alignItems: 'flex-end' },
  clearAll: { fontSize: 13, color: '#6B7280', fontWeight: '500' },

  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 19, fontWeight: '700', color: '#374151', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },

  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notifIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 3 },
  notifBody: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, color: '#D1D5DB', fontWeight: '500' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    marginLeft: 8,
  },
});
