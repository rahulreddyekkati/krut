import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { router } from 'expo-router';
import { fetchWithAuth } from '../utils/apiClient';
import AdminDrawer from './AdminDrawer';
import { useNotificationCount } from '../hooks/useNotificationCount';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { count } = useNotificationCount();
  const [stats, setStats] = useState({ totalJobs: 0, activeWorkers: 0, pendingRecaps: 0 });
  const [activeWorkersDetails, setActiveWorkersDetails] = useState<any[]>([]);
  const [pendingRecapsDetails, setPendingRecapsDetails] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = async () => {
    try {
      const statsRes = await fetchWithAuth('/admin/dashboard-stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      const detailsRes = await fetchWithAuth('/admin/dashboard-details');
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        setActiveWorkersDetails(detailsData.activeWorkers || []);
        setPendingRecapsDetails(detailsData.pendingRecaps || []);
      }
    } catch (e) {
      console.log('Error loading admin dashboard data', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 60000); // 60 seconds auto refresh
    return () => clearInterval(interval);
  }, []);

  const formatTimeStr = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.menuBtn}>
            <Text style={styles.menuIcon}>≡</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.brand}>Workforce OS</Text>
            <Text style={styles.subtitle}>{user?.name || 'Admin'}</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
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
            <Text style={styles.iconLogout}>↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Jobs</Text>
            <Text style={[styles.statValue, { color: '#6366F1' }]}>{stats.totalJobs}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Workers</Text>
            <Text style={[styles.statValue, { color: '#22C55E' }]}>{stats.activeWorkers}</Text>
            <View style={[styles.statDot, { backgroundColor: '#22C55E' }]} />
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending Recaps</Text>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.pendingRecaps}</Text>
            <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
          </View>
        </View>

        {/* Quick Actions Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(admin)/recaps')}>
            <Text style={styles.actionBtnText}>Recaps</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(admin)/users')}>
            <Text style={styles.actionBtnText}>Workers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(admin)/reports')}>
            <Text style={styles.actionBtnText}>Reports</Text>
          </TouchableOpacity>
        </View>

        {/* Active Workers Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Workers</Text>
          <View style={[styles.sectionDot, { backgroundColor: '#22C55E' }]} />
        </View>

        {activeWorkersDetails.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No workers currently clocked in</Text>
          </View>
        ) : (
          activeWorkersDetails.map((worker: any) => (
            <View key={worker.id} style={styles.listCard}>
              <View style={styles.listCardContent}>
                <Text style={styles.listCardTitle}>{worker.workerName || worker.worker?.name}</Text>
                <Text style={styles.listCardSubtitle}>{worker.storeName}</Text>
                <Text style={styles.listCardSubtitle}>Clocked in at {formatTimeStr(worker.clockIn)}</Text>
              </View>
              <View style={[styles.listDot, { backgroundColor: '#22C55E' }]} />
            </View>
          ))
        )}

        {/* Pending Recaps Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Recaps</Text>
          <View style={[styles.sectionDot, { backgroundColor: '#F59E0B' }]} />
        </View>

        {pendingRecapsDetails.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No pending recaps</Text>
          </View>
        ) : (
          pendingRecapsDetails.map((recap: any) => (
            <View key={recap.id} style={styles.listCard}>
              <View style={styles.listCardContent}>
                <Text style={styles.listCardTitle}>{recap.workerName || recap.worker?.name}</Text>
                <Text style={styles.listCardSubtitle}>{recap.storeName} • {recap.marketName}</Text>
                <Text style={styles.listCardSubtitle}>Clock In: {formatTimeStr(recap.clockIn)}</Text>
                <Text style={styles.listCardSubtitle}>Clock Out: {formatTimeStr(recap.clockOut)}</Text>
                <View style={styles.pendingPill}>
                  <Text style={styles.pendingPillText}>PENDING</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.viewBtn} onPress={() => router.push(`/(admin)/recap-detail/${recap.recapId || recap.id}`)}>
                <Text style={styles.viewBtnText}>View</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

      </ScrollView>

      {drawerOpen && <AdminDrawer onClose={() => setDrawerOpen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingBottom: 14, paddingHorizontal: 20,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E5E7EB',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  menuBtn: { marginRight: 15, padding: 4 },
  menuIcon: { fontSize: 28, color: '#111827' },
  brand: { fontSize: 20, fontWeight: '800', color: '#6366F1' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#F9FAFB',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6'
  },
  iconEmoji: { fontSize: 18 },
  iconLogout: { fontSize: 18, color: '#EF4444', fontWeight: '700' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  scrollContent: { padding: 16, paddingBottom: 40 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
    position: 'relative'
  },
  statLabel: { fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4 },

  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  actionBtn: {
    flex: 1, borderWidth: 1, borderColor: '#6366F1', borderRadius: 8, paddingVertical: 10, alignItems: 'center',
    backgroundColor: '#fff'
  },
  actionBtnText: { color: '#6366F1', fontSize: 14, fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  sectionDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },

  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { color: '#9CA3AF', fontSize: 14 },

  listCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center',
    marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  listCardContent: { flex: 1 },
  listCardTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 4 },
  listCardSubtitle: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  listDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 16 },

  pendingPill: {
    backgroundColor: '#FEF3C7', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20, alignSelf: 'flex-start', marginTop: 6,
  },
  pendingPillText: { color: '#92400E', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  viewBtn: { backgroundColor: '#6366F1', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8, marginLeft: 16 },
  viewBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' }
});
