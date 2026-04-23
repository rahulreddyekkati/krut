import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { fetchWithAuth } from '../../utils/apiClient';
import { router } from 'expo-router';

export default function ReportsScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const startObj = new Date();
  startObj.setDate(startObj.getDate() - 14); // 2 weeks back
  const endObj = new Date(); // today
  
  const startDate = startObj.toISOString().split('T')[0];
  const endDate = endObj.toISOString().split('T')[0];

  const loadData = async () => {
    try {
      const res = await fetchWithAuth(`/admin/reports/payroll?startDate=${startDate}&endDate=${endDate}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.report || data || []);
      }
    } catch (e) {
      console.log('Failed fetching payroll report', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatMoney = (val?: number) => {
    if (val === undefined || val === null) return '-';
    return '$' + val.toFixed(2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>System Reports</Text>
          <Text style={styles.headerSubtitle}>Export Sales and Payroll data.</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tab, styles.tabActive]}>
            <Text style={styles.tabTextActive}>Pay Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Analytics</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
           <Text style={styles.dateText}>{startObj.toLocaleDateString()} - {endObj.toLocaleDateString()}</Text>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6366F1" />
        ) : reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No payroll data available.</Text>
          </View>
        ) : (
          reports.map((r: any, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.userName}>{r.userName || r.workerName || 'Unknown'}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{r.role || 'WORKER'}</Text>
                </View>
              </View>
              
              <Text style={styles.locationText}>{r.markets?.join(', ') || r.marketName || 'No Location'}</Text>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>PAY / HR</Text>
                  <Text style={styles.statValue}>{formatMoney(r.hourlyWage)}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>WORKED</Text>
                  <Text style={styles.statValue}>{r.totalWorkedHours?.toFixed(1) || '0'}h</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>REIMB.</Text>
                  <Text style={styles.statValue}>{formatMoney(r.totalReimbursements)}</Text>
                </View>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>PAY FOR CYCLE</Text>
                <Text style={styles.totalValue}>{formatMoney(r.totalPay)}</Text>
              </View>
            </View>
          ))
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
  
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  tab: { paddingVertical: 12, paddingHorizontal: 16, marginRight: 8 },
  tabActive: { borderBottomWidth: 2, borderColor: '#6366F1' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { fontSize: 14, fontWeight: '700', color: '#6366F1' },
  
  filterRow: { marginBottom: 16, flexDirection: 'row', justifyContent: 'flex-end' },
  dateText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  userName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  badge: { backgroundColor: '#EEF2FF', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  badgeText: { color: '#6366F1', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  
  locationText: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statBox: { flex: 1 },
  statLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#F3F4F6', paddingTop: 12 },
  totalLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 1 },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#10B981' },
  
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
});
