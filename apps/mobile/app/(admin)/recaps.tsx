import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { fetchWithAuth } from '../../utils/apiClient';
import { router } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function RecapsScreen() {
  const [activeTab, setActiveTab] = useState(0); // 0: Pending, 1: Incomplete, 2: Reviewed
  const [refreshing, setRefreshing] = useState(false);

  // Tab 1 Data
  const [pendingRecaps, setPendingRecaps] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);

  // Tab 2 Data
  const [incompleteRecaps, setIncompleteRecaps] = useState<any[]>([]);
  const [loadingIncomplete, setLoadingIncomplete] = useState(true);
  const [sentReminders, setSentReminders] = useState<Record<string, boolean>>({});

  // Tab 3 Data
  const [reviewedRecaps, setReviewedRecaps] = useState<any[]>([]);
  const [loadingReviewed, setLoadingReviewed] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date();
  });
  const dateString = selectedDate.toISOString().split('T')[0];

  const fetchPending = async () => {
    setLoadingPending(true);
    try {
        const res = await fetchWithAuth(`/admin/recaps?status=PENDING&noLimit=true`);
        if (res.ok) {
            const data = await res.json();
            const sorted = (data.recaps || []).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setPendingRecaps(sorted);
        }
    } catch (e) {
        console.error("Failed to fetch pending recaps", e);
    }
    setLoadingPending(false);
  };

  const fetchIncomplete = async () => {
    setLoadingIncomplete(true);
    try {
        const res = await fetchWithAuth(`/admin/recaps/incomplete`);
        if (res.ok) {
            const data = await res.json();
            setIncompleteRecaps(Array.isArray(data) ? data : (data.incomplete || []));
        }
    } catch (e) {
        console.error("Failed to fetch incomplete recaps", e);
    }
    setLoadingIncomplete(false);
  };

  const fetchReviewed = async () => {
    setLoadingReviewed(true);
    try {
        const res = await fetchWithAuth(`/admin/recaps?status=APPROVED,REJECTED&date=${dateString}`);
        if (res.ok) {
            const data = await res.json();
            setReviewedRecaps(data.recaps || []);
        }
    } catch (e) {
        console.error("Failed to fetch reviewed recaps", e);
    }
    setLoadingReviewed(false);
  };

  const loadData = async () => {
    if (activeTab === 0) await fetchPending();
    else if (activeTab === 1) await fetchIncomplete();
    else if (activeTab === 2) await fetchReviewed();
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 2) fetchReviewed();
  }, [selectedDate]);

  const handleSendReminder = async (assignment: any) => {
    try {
        const title = "Recap Reminder";
        const message = `Please submit your recap for your shift at ${assignment.storeName} on ${new Date(assignment.shiftDate).toLocaleDateString()}. It has been ${assignment.hoursOverdue} hours since you clocked out.`;
        
        const res = await fetchWithAuth('/notifications', {
            method: "POST",
            body: JSON.stringify({ recipientId: assignment.workerId, title, message, type: "RECAP_REMINDER" })
        });
        
        if (res.ok) {
            setSentReminders(prev => ({ ...prev, [assignment.id]: true }));
        } else {
            Alert.alert("Error", "Failed to send reminder");
        }
    } catch (e) {
        console.error(e);
        Alert.alert("Error", "Network error sending reminder");
    }
  };

  const formatMoney = (val?: number) => {
    if (val === undefined || val === null) return '-';
    return '$' + val.toFixed(2);
  };

  const getRelativeTime = (isoString: string) => {
    if (!isoString) return "Unknown";
    const ms = new Date().getTime() - new Date(isoString).getTime();
    const mins = Math.floor(ms / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "Just now";
  };

  const getOverdueColor = (hours: number) => {
    if (hours > 48) return '#EF4444';
    if (hours > 24) return '#F59E0B';
    return '#6B7280';
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Recaps</Text>
          <Text style={styles.headerSubtitle}>Review and approve submitted recaps.</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {["Pending Review", "Incomplete", "Reviewed"].map((label, i) => (
                <TouchableOpacity 
                    key={i} 
                    style={[styles.tab, activeTab === i && styles.tabActive]}
                    onPress={() => setActiveTab(i)}
                >
                    <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
                        {label} {i === 0 && pendingRecaps.length > 0 && `(${pendingRecaps.length})`}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {/* PENDING VIEW */}
        {activeTab === 0 && (
           <>
             {loadingPending && !refreshing ? (
                 <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6366F1" />
             ) : pendingRecaps.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>✅</Text>
                    <Text style={styles.emptyTitle}>All caught up!</Text>
                    <Text style={styles.emptyText}>No recaps are waiting for your review.</Text>
                </View>
             ) : (
                pendingRecaps.map((r: any) => (
                    <View key={r.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.userName}>{r.workerName}</Text>
                                <Text style={styles.storeName}>{r.storeName} • {r.marketName}</Text>
                            </View>
                            <Text style={styles.subTimeText}>{getRelativeTime(r.createdAt)}</Text>
                        </View>
                        <View style={styles.statsRow}>
                            <View style={styles.statCell}>
                                <Text style={styles.statLabel}>REIMBURSEMENT</Text>
                                <Text style={styles.statValue}>{formatMoney(r.reimbursement)}</Text>
                            </View>
                            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push(`/(admin)/recap-detail/${r.id}`)}>
                                <Text style={styles.primaryBtnText}>View</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
             )}
           </>
        )}

        {/* INCOMPLETE VIEW */}
        {activeTab === 1 && (
           <>
             {loadingIncomplete && !refreshing ? (
                 <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6366F1" />
             ) : incompleteRecaps.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🎉</Text>
                    <Text style={styles.emptyTitle}>All recaps submitted!</Text>
                    <Text style={styles.emptyText}>Every worker has submitted their recap.</Text>
                </View>
             ) : (
                incompleteRecaps.map((a: any) => {
                    const isCritical = a.hoursOverdue > 48;
                    const isUrgent = a.hoursOverdue > 24 && !isCritical;
                    const overdueColor = isCritical ? '#EF4444' : (isUrgent ? '#F59E0B' : '#6B7280');
                    const isSent = sentReminders[a.id];

                    return (
                    <View key={a.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.userName}>{a.workerName}</Text>
                                <Text style={styles.storeName}>{a.storeName} • {a.market || a.marketName}</Text>
                            </View>
                            <Text style={{ fontSize: 13, fontWeight: a.hoursOverdue > 24 ? '700' : '500', color: getOverdueColor(a.hoursOverdue) }}>
                                {a.hoursOverdue}h overdue
                            </Text>
                        </View>
                        <View style={styles.statsRow}>
                            <View style={styles.statCell}>
                                <Text style={styles.statLabel}>SHIFT DATE</Text>
                                <Text style={styles.statValue}>{a.shiftDate ? new Date(a.shiftDate).toLocaleDateString() : '—'}</Text>
                            </View>
                            <TouchableOpacity 
                                style={[styles.reminderBtn, isSent && styles.reminderBtnSent]} 
                                onPress={() => handleSendReminder(a)}
                                disabled={isSent}
                            >
                                <Text style={[styles.reminderBtnText, isSent && styles.reminderBtnTextSent]}>
                                    {isSent ? "Sent ✓" : "Send Reminder"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )})
             )}
           </>
        )}

        {/* REVIEWED VIEW */}
        {activeTab === 2 && (
           <>
             <View style={[styles.filterRow, { alignItems: 'center', gap: 8 }]}>
                <Text style={styles.dateText}>Showing:</Text>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  onChange={onDateChange}
                />
             </View>
             {loadingReviewed && !refreshing ? (
                 <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6366F1" />
             ) : reviewedRecaps.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No reviewed recaps found for this date.</Text>
                </View>
             ) : (
                reviewedRecaps.map((r: any) => (
                    <View key={r.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.userName}>{r.workerName}</Text>
                                <Text style={styles.storeName}>{r.storeName} • {r.marketName}</Text>
                            </View>
                            <View style={[styles.badge, r.status === 'APPROVED' ? styles.badgeApproved : styles.badgeRejected]}>
                                <Text style={[styles.badgeText, r.status === 'APPROVED' ? styles.textApproved : styles.textRejected]}>
                                    {r.status}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.statsRow}>
                            <View style={styles.statCell}>
                                <Text style={styles.statLabel}>REIMBURSEMENT</Text>
                                <Text style={styles.statValue}>{formatMoney(r.reimbursement)}</Text>
                            </View>
                        </View>
                    </View>
                ))
             )}
           </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingBottom: 14, paddingHorizontal: 20,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E5E7EB',
  },
  headerBtn: { marginRight: 15, padding: 4 },
  headerIcon: { fontSize: 24, color: '#111827' },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  
  tabsContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E5E7EB' },
  tabsScroll: { paddingHorizontal: 16, flexDirection: 'row' },
  tab: { paddingVertical: 14, paddingHorizontal: 12, marginRight: 12 },
  tabActive: { borderBottomWidth: 2, borderColor: '#6366F1' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { fontSize: 14, fontWeight: '800', color: '#6366F1' },

  scrollContent: { padding: 16, paddingBottom: 40 },
  
  filterRow: {
    flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16
  },
  dateText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  userName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  storeName: { fontSize: 13, color: '#6B7280' },
  subTimeText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 20 },
  badgeApproved: { backgroundColor: '#DCFCE7' },
  badgeRejected: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  textApproved: { color: '#166534' },
  textRejected: { color: '#991B1B' },
  
  statsRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#F3F4F6', paddingTop: 12, marginTop: 4 },
  statCell: { flex: 1 },
  statLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
  
  primaryBtn: { backgroundColor: '#6366F1', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8 },
  primaryBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  reminderBtn: { backgroundColor: '#F59E0B', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  reminderBtnSent: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  reminderBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  reminderBtnTextSent: { color: '#9CA3AF' },
  
  emptyState: { padding: 40, alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  emptyText: { color: '#6B7280', fontSize: 14, textAlign: 'center' },
});
