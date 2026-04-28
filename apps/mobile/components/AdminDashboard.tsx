import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { router } from 'expo-router';
import { fetchWithAuth } from '../utils/apiClient';
import AdminDrawer from './AdminDrawer';
import { useNotificationCount } from '../hooks/useNotificationCount';

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatTime = (dateStr: string | null) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

type Section = 'jobs' | 'active' | 'recaps' | null;

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { count } = useNotificationCount();

  const [selectedDate, setSelectedDate] = useState<string>(toDateStr(new Date()));
  const [activeSection, setActiveSection] = useState<Section>(null);

  const [stats, setStats] = useState({ totalJobs: 0, activeWorkers: 0, pendingRecaps: 0 });
  const [jobsDetails, setJobsDetails] = useState<any[]>([]);
  const [activeWorkersDetails, setActiveWorkersDetails] = useState<any[]>([]);
  const [pendingRecapsDetails, setPendingRecapsDetails] = useState<any[]>([]);

  const [loadingJobs, setLoadingJobs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const loadStats = useCallback(async (date: string) => {
    try {
      const res = await fetchWithAuth(`/admin/dashboard-stats?date=${date}`);
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.log('Error loading stats', e);
    }
  }, []);

  const loadActiveAndRecaps = useCallback(async (date: string) => {
    try {
      const [activeRes, recapsRes] = await Promise.all([
        fetchWithAuth(`/admin/dashboard-details?type=active&date=${date}`),
        fetchWithAuth(`/admin/dashboard-details?type=recaps&date=${date}`),
      ]);
      if (activeRes.ok) setActiveWorkersDetails((await activeRes.json()).data || []);
      if (recapsRes.ok) setPendingRecapsDetails((await recapsRes.json()).data || []);
    } catch (e) {
      console.log('Error loading details', e);
    }
  }, []);

  const loadJobs = useCallback(async (date: string) => {
    setLoadingJobs(true);
    try {
      const res = await fetchWithAuth(`/admin/dashboard-details?type=jobs&date=${date}`);
      if (res.ok) setJobsDetails((await res.json()).data || []);
    } catch (e) {
      console.log('Error loading jobs', e);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  const loadAll = useCallback(async (date: string) => {
    await Promise.all([
      loadStats(date),
      loadActiveAndRecaps(date),
    ]);
  }, [loadStats, loadActiveAndRecaps]);

  // Reload everything when date changes
  useEffect(() => {
    loadAll(selectedDate);
    if (activeSection === 'jobs') loadJobs(selectedDate);
  }, [selectedDate]);

  // Initial load + 60s auto-refresh on current date
  useEffect(() => {
    loadAll(selectedDate);
    const interval = setInterval(() => loadAll(selectedDate), 60000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll(selectedDate);
    if (activeSection === 'jobs') await loadJobs(selectedDate);
    setRefreshing(false);
  };

  // ── Date navigation ────────────────────────────────────────────────────────

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    setSelectedDate(toDateStr(d));
  };

  const displayDate = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    const isToday = selectedDate === toDateStr(new Date());
    return isToday
      ? 'Today'
      : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // ── Card tap handler ───────────────────────────────────────────────────────

  const handleCardTap = (section: Section) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
      if (section === 'jobs') loadJobs(selectedDate);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.menuBtn}>
            <Text style={styles.menuIcon}>≡</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.brand}>Kruto Tastes</Text>
            <Text style={styles.subtitle}>{user?.name || 'Admin'}</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)/messages')}>
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
        {/* Date Picker */}
        <View style={styles.datePicker}>
          <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateArrow}>
            <Text style={styles.dateArrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.dateLabel}>{displayDate()}</Text>
          <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateArrow}>
            <Text style={styles.dateArrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Stat Cards — tappable */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statCard, activeSection === 'jobs' && styles.statCardActive]}
            onPress={() => handleCardTap('jobs')}
            activeOpacity={0.7}
          >
            <Text style={styles.statLabel}>Total Jobs</Text>
            <Text style={[styles.statValue, { color: '#6366F1' }]}>{stats.totalJobs}</Text>
            <Text style={styles.statTapHint}>{activeSection === 'jobs' ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, activeSection === 'active' && styles.statCardActive]}
            onPress={() => handleCardTap('active')}
            activeOpacity={0.7}
          >
            <View style={[styles.statDot, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.statLabel}>Active Workers</Text>
            <Text style={[styles.statValue, { color: '#22C55E' }]}>{stats.activeWorkers}</Text>
            <Text style={styles.statTapHint}>{activeSection === 'active' ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, activeSection === 'recaps' && styles.statCardActive]}
            onPress={() => handleCardTap('recaps')}
            activeOpacity={0.7}
          >
            <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.statLabel}>Pending Recaps</Text>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.pendingRecaps}</Text>
            <Text style={styles.statTapHint}>{activeSection === 'recaps' ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>

        {/* Jobs Detail */}
        {activeSection === 'jobs' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Jobs</Text>
              <Text style={styles.sectionDateTag}>{displayDate()}</Text>
            </View>
            {loadingJobs ? (
              <ActivityIndicator style={{ marginVertical: 20 }} color="#6366F1" />
            ) : jobsDetails.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No jobs scheduled for this date</Text>
              </View>
            ) : (
              jobsDetails.map((job: any) => (
                <View key={job.id} style={styles.listCard}>
                  <View style={styles.listCardContent}>
                    <Text style={styles.listCardTitle}>{job.storeName}</Text>
                    <Text style={styles.listCardSubtitle}>{job.startTime} – {job.endTime}</Text>
                    <Text style={styles.listCardSubtitle}>{job.marketName}</Text>
                  </View>
                  <Text style={styles.workerTag}>{job.assignedWorker}</Text>
                </View>
              ))
            )}
          </>
        )}

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
        {activeSection === 'active' && (
          <>
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
                    <Text style={styles.listCardTitle}>{worker.workerName}</Text>
                    <Text style={styles.listCardSubtitle}>{worker.storeName}{worker.marketName ? ` • ${worker.marketName}` : ''}</Text>
                    <Text style={styles.listCardSubtitle}>Clocked in at {formatTime(worker.clockIn)}</Text>
                    {worker.shiftEnd && worker.shiftEnd !== '--' && (
                      <Text style={styles.listCardSubtitle}>Shift ends at {worker.shiftEnd}</Text>
                    )}
                  </View>
                  <View style={[styles.listDot, { backgroundColor: '#22C55E' }]} />
                </View>
              ))
            )}
          </>
        )}

        {/* Pending Recaps Section */}
        {activeSection === 'recaps' && (
          <>
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
                    <Text style={styles.listCardTitle}>{recap.workerName}</Text>
                    <Text style={styles.listCardSubtitle}>
                      {recap.storeName}{recap.marketName ? ` • ${recap.marketName}` : ''}
                    </Text>
                    {recap.shiftDate ? (
                      <Text style={styles.listCardSubtitle}>
                        {new Date(recap.shiftDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.incompletePill}>
                    <Text style={styles.incompletePillText}>Incomplete</Text>
                  </View>
                </View>
              ))
            )}
          </>
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
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6',
  },
  iconEmoji: { fontSize: 18 },
  iconLogout: { fontSize: 18, color: '#EF4444', fontWeight: '700' },
  badge: {
    position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444',
    borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center',
    alignItems: 'center', paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  scrollContent: { padding: 16, paddingBottom: 40 },

  // Date picker
  datePicker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16,
    marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  dateArrow: { paddingHorizontal: 16, paddingVertical: 4 },
  dateArrowText: { fontSize: 24, color: '#6366F1', fontWeight: '300' },
  dateLabel: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#111827' },

  // Stat cards
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
    position: 'relative', alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  statCardActive: {
    borderColor: '#6366F1', backgroundColor: '#F5F3FF',
  },
  statLabel: { fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, textAlign: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statTapHint: { fontSize: 10, color: '#9CA3AF' },
  statDot: { position: 'absolute', top: 10, right: 10, width: 7, height: 7, borderRadius: 4 },

  // Quick actions
  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 16, marginTop: 8 },
  actionBtn: {
    flex: 1, borderWidth: 1, borderColor: '#6366F1', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center', backgroundColor: '#fff',
  },
  actionBtnText: { color: '#6366F1', fontSize: 14, fontWeight: '600' },

  // Section headers
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  sectionDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  sectionDateTag: {
    marginLeft: 8, fontSize: 12, color: '#6366F1', fontWeight: '600',
    backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
  },

  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { color: '#9CA3AF', fontSize: 14 },

  listCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  listCardContent: { flex: 1 },
  listCardTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 4 },
  listCardSubtitle: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  listDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 16 },

  workerTag: {
    fontSize: 12, color: '#6366F1', fontWeight: '600',
    backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, marginLeft: 8, flexShrink: 1, textAlign: 'right',
  },

  incompletePill: {
    backgroundColor: '#FEE2E2', paddingVertical: 5, paddingHorizontal: 12,
    borderRadius: 20, marginLeft: 12,
  },
  incompletePillText: { color: '#EF4444', fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
});
