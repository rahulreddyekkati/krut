import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, TextInput, Alert, Modal } from 'react-native';
import { fetchWithAuth } from '../../utils/apiClient';
import { router } from 'expo-router';

export default function UsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Invite Form
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('WORKER');
  const [wage, setWage] = useState('');
  const [marketId, setMarketId] = useState('');
  const [inviting, setInviting] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [marketModalVisible, setMarketModalVisible] = useState(false);

  const loadData = async () => {
    try {
      const [usersRes, marketsRes] = await Promise.all([
        fetchWithAuth('/users'), // Fallback to raw path as requested
        fetchWithAuth('/markets')
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || data || []);
      }
      if (marketsRes.ok) {
        const data = await marketsRes.json();
        setMarkets(data.markets || data || []);
      }
    } catch (e) {
      console.log('Failed fetching users data', e);
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

  const handleInvite = async () => {
    if (!email) return Alert.alert('Error', 'Email is required');
    setInviting(true);
    try {
      const payload: any = { email, role };
      if (wage) payload.hourlyWage = parseFloat(wage);
      if (marketId && role === 'WORKER') payload.marketId = marketId;

      const res = await fetchWithAuth('/invites', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Invite sent successfully');
        setEmail('');
        setWage('');
        loadData();
      } else {
        Alert.alert('Error', data.error || 'Failed to send invite');
      }
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setInviting(false);
    }
  };

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
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>Onboard team members and manage accounts.</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Invite Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Invite Team Member</Text>
          
          <Text style={styles.label}>Email Address</Text>
          <TextInput 
            style={styles.input} 
            placeholder="worker@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Role</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setRoleModalVisible(true)}>
                <Text style={styles.selectText}>{role}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Pay Rate ($/hr)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="15.00"
                value={wage}
                onChangeText={setWage}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {role === 'WORKER' && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Market Assignment</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setMarketModalVisible(true)}>
                <Text style={styles.selectText}>
                  {marketId ? markets.find(m => m.id === marketId)?.name || 'Selected' : 'Select Market'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.primaryBtn} onPress={handleInvite} disabled={inviting}>
            {inviting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Create & Send Invite</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>ACTIVE ACCOUNTS</Text>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6366F1" />
        ) : users.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No users found.</Text>
          </View>
        ) : (
          users.map((u: any) => (
            <View key={u.id} style={styles.userRow}>
              <View style={styles.userHeader}>
                <View>
                  <Text style={styles.userName}>{u.name || 'Pending Invite'}</Text>
                  <Text style={styles.userEmail}>{u.email}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{u.role}</Text>
                </View>
              </View>
              <View style={styles.userStats}>
                <View style={styles.statCell}>
                  <Text style={styles.statLabel}>MARKET</Text>
                  <Text style={styles.statValue}>{u.market?.name || '-'}</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statLabel}>PAY RATE</Text>
                  <Text style={styles.statValue}>{formatMoney(u.hourlyWage)}/hr</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Select Role Modal */}
      <Modal visible={roleModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Role</Text>
            {['WORKER', 'MARKET_MANAGER', 'ADMIN'].map(r => (
              <TouchableOpacity 
                key={r} 
                style={styles.modalItem}
                onPress={() => { setRole(r); setRoleModalVisible(false); }}
              >
                <Text style={[styles.modalItemText, role === r && { color: '#6366F1', fontWeight: '700' }]}>{r}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setRoleModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Select Market Modal */}
      <Modal visible={marketModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Market</Text>
            <TouchableOpacity 
                style={styles.modalItem}
                onPress={() => { setMarketId(''); setMarketModalVisible(false); }}
              >
                <Text style={styles.modalItemText}>None / Unassigned</Text>
            </TouchableOpacity>
            {markets.map(m => (
              <TouchableOpacity 
                key={m.id} 
                style={styles.modalItem}
                onPress={() => { setMarketId(m.id); setMarketModalVisible(false); }}
              >
                <Text style={[styles.modalItemText, marketId === m.id && { color: '#6366F1', fontWeight: '700' }]}>{m.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setMarketModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 16 },
  
  label: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', marginBottom: 6, textTransform: 'uppercase' },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 14,
    color: '#111827', backgroundColor: '#F9FAFB', marginBottom: 12
  },
  
  row: { flexDirection: 'row' },
  selectBtn: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12,
    backgroundColor: '#F9FAFB', justifyContent: 'center'
  },
  selectText: { fontSize: 14, color: '#111827' },
  
  primaryBtn: {
    backgroundColor: '#6366F1', paddingVertical: 14, borderRadius: 8,
    alignItems: 'center', marginTop: 12
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  
  userRow: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  userHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  userName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  userEmail: { fontSize: 13, color: '#6B7280' },
  badge: { backgroundColor: '#EEF2FF', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  badgeText: { color: '#6366F1', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  
  userStats: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#F3F4F6', paddingTop: 12 },
  statCell: { flex: 1 },
  statLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 13, color: '#111827', fontWeight: '600' },
  
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16, textAlign: 'center' },
  modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalItemText: { fontSize: 15, color: '#374151', textAlign: 'center' },
  modalCloseBtn: { marginTop: 16, paddingVertical: 12, alignItems: 'center' },
  modalCloseText: { color: '#EF4444', fontSize: 15, fontWeight: '600' }
});
