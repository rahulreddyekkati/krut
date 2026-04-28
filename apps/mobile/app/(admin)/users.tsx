"use client";
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, ActivityIndicator, TextInput, Alert, Modal, Share
} from 'react-native';
import { fetchWithAuth } from '../../utils/apiClient';
import { router } from 'expo-router';

const WEEKDAYS = [
  { label: 'Sun', value: 0 }, { label: 'Mon', value: 1 }, { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 }, { label: 'Thu', value: 4 }, { label: 'Fri', value: 5 }, { label: 'Sat', value: 6 },
];

export default function UsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Invite form ──────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('WORKER');
  const [wage, setWage] = useState('20.00');
  const [marketId, setMarketId] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [inviteMarketModalVisible, setInviteMarketModalVisible] = useState(false);

  // ── Edit user ────────────────────────────────────────────────────────────
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editWage, setEditWage] = useState('');
  const [editMarketId, setEditMarketId] = useState('');
  const [saving, setSaving] = useState(false);
  const [editRoleModalVisible, setEditRoleModalVisible] = useState(false);
  const [editMarketModalVisible, setEditMarketModalVisible] = useState(false);

  // ── Assign shift modal ───────────────────────────────────────────────────
  const [assignModalUser, setAssignModalUser] = useState<any>(null);
  const [assignMode, setAssignMode] = useState<'recurring' | 'specific'>('recurring');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [specificDate, setSpecificDate] = useState('');
  const [cycleLabel, setCycleLabel] = useState('');
  const [assigning, setAssigning] = useState(false);
  // 'main' | 'storePicker' | 'jobPicker' — switches view inside a single Modal
  const [assignView, setAssignView] = useState<'main' | 'storePicker' | 'jobPicker'>('main');

  // ── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchWithAuth('/cycle/current').then(r => r.json()).then(d => {
      if (d.label) setCycleLabel(d.label);
    }).catch(() => {});
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, marketsRes, storesRes, jobsRes] = await Promise.all([
        fetchWithAuth('/users'),
        fetchWithAuth('/markets'),
        fetchWithAuth('/stores'),
        fetchWithAuth('/jobs'),
      ]);
      if (usersRes.ok) setUsers((await usersRes.json()) || []);
      if (marketsRes.ok) { const d = await marketsRes.json(); setMarkets(d.markets || d || []); }
      if (storesRes.ok) { const d = await storesRes.json(); setStores(Array.isArray(d) ? d : (d.stores || [])); }
      if (jobsRes.ok) { const d = await jobsRes.json(); setJobs(Array.isArray(d) ? d : (d.jobs || [])); }
    } catch (e) {
      console.log('Failed fetching users data', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };
  useEffect(() => { loadData(); }, []);

  // ── Invite ───────────────────────────────────────────────────────────────
  const handleInvite = async () => {
    if (!email) return Alert.alert('Error', 'Email is required');
    setInviting(true);
    setInviteLink('');
    try {
      const payload: any = { email, role };
      if (wage) payload.hourlyWage = parseFloat(wage);
      if (marketId && (role === 'WORKER' || role === 'MARKET_MANAGER')) payload.marketId = marketId;

      const res = await fetchWithAuth('/invites', { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        setInviteLink(data.inviteLink || '');
        setEmail('');
        setWage('20.00');
        setMarketId('');
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

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `You've been invited to Kruto Tastes! Set up your account here:\n${inviteLink}`,
        url: inviteLink,
      });
    } catch { }
  };

  // ── Edit user ────────────────────────────────────────────────────────────
  const startEdit = (u: any) => {
    setEditingUserId(u.id);
    setEditRole(u.role);
    setEditWage(u.hourlyWage?.toString() || '');
    setEditMarketId(u.market?.id || u.managedMarket?.id || u.marketId || u.managedMarketId || '');
  };

  const cancelEdit = () => { setEditingUserId(null); };

  const handleSaveEdit = async (userId: string) => {
    setSaving(true);
    try {
      const res = await fetchWithAuth(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          role: editRole,
          hourlyWage: editWage ? parseFloat(editWage) : null,
          marketId: (editRole === 'WORKER' || editRole === 'MARKET_MANAGER') ? editMarketId || null : null,
          managedMarketId: editRole === 'MARKET_MANAGER' ? editMarketId || null : null,
        }),
      });
      if (res.ok) {
        setEditingUserId(null);
        loadData();
      } else {
        const d = await res.json();
        Alert.alert('Error', d.error || 'Failed to update');
      }
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = (userId: string, name: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete "${name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetchWithAuth(`/users/${userId}`, { method: 'DELETE' });
              if (res.ok) { setEditingUserId(null); loadData(); }
              else { const d = await res.json(); Alert.alert('Error', d.error || 'Failed to delete'); }
            } catch { Alert.alert('Error', 'Network error'); }
          }
        }
      ]
    );
  };

  // ── Assign shift ─────────────────────────────────────────────────────────
  const filteredJobs = selectedStoreId
    ? jobs.filter(j => j.storeId === selectedStoreId || j.store?.id === selectedStoreId)
    : jobs;
  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const selectedStore = stores.find(s => s.id === selectedStoreId);

  const toggleWeekday = (day: number) => {
    setSelectedWeekdays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const openAssignModal = (u: any) => {
    setAssignModalUser(u);
    setAssignMode('recurring');
    setSelectedStoreId('');
    setSelectedJobId('');
    setSelectedWeekdays([]);
    setSpecificDate('');
    setAssignView('main');
  };

  const handleAssignJob = async () => {
    if (!selectedJobId) return Alert.alert('Error', 'Please select a job');
    if (assignMode === 'recurring' && selectedWeekdays.length === 0)
      return Alert.alert('Error', 'Please select at least one day');
    if (assignMode === 'specific' && !specificDate)
      return Alert.alert('Error', 'Please enter a date (YYYY-MM-DD)');

    setAssigning(true);
    try {
      const payload: any = { jobId: selectedJobId };
      if (assignMode === 'recurring') {
        payload.selectedDays = selectedWeekdays;
        payload.isRecurring = true;
      } else {
        payload.date = specificDate;
      }

      const res = await fetchWithAuth(`/users/${assignModalUser.id}/assignments`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        const created = data.created?.length ?? (data.count ?? 0);
        const skipped = data.skipped?.length ?? 0;
        let msg = `${created} shift${created !== 1 ? 's' : ''} assigned to ${assignModalUser.name}.`;
        if (skipped > 0) msg += ` ${skipped} skipped (already assigned).`;
        Alert.alert('Success', msg);
        setAssignModalUser(null);
      } else {
        Alert.alert('Error', data.error || 'Failed to assign shift');
      }
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setAssigning(false);
    }
  };

  const formatMoney = (val?: number) => (val == null ? '-' : '$' + val.toFixed(2));

  // ── Render ────────────────────────────────────────────────────────────────
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
        {/* ── Invite Card ── */}
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
                placeholder="20.00"
                value={wage}
                onChangeText={setWage}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {(role === 'WORKER' || role === 'MARKET_MANAGER') && (
            <View style={{ marginTop: 4 }}>
              <Text style={styles.label}>{role === 'MARKET_MANAGER' ? 'Managed Market' : 'Market Assignment'}</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setInviteMarketModalVisible(true)}>
                <Text style={styles.selectText}>
                  {marketId ? markets.find(m => m.id === marketId)?.name || 'Selected' : 'Select Market'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.primaryBtn} onPress={handleInvite} disabled={inviting}>
            {inviting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Create & Send Invite</Text>}
          </TouchableOpacity>

          {/* Invite link shown after creation */}
          {!!inviteLink && (
            <View style={styles.inviteLinkBox}>
              <Text style={styles.inviteLinkLabel}>Invite link ready:</Text>
              <Text style={styles.inviteLinkText} numberOfLines={2}>{inviteLink}</Text>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShareInvite}>
                <Text style={styles.shareBtnText}>Share Invite</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>ACTIVE ACCOUNTS</Text>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6366F1" />
        ) : users.length === 0 ? (
          <View style={styles.emptyState}><Text style={styles.emptyText}>No users found.</Text></View>
        ) : (
          users.map((u: any) => {
            const isEditing = editingUserId === u.id;
            const payForCycle = ((u.workedHours || 0) * (u.hourlyWage || 0) + (u.totalReimbursement || 0));
            return (
              <View key={u.id} style={styles.userRow}>
                {/* Name / email / role */}
                <View style={styles.userHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{u.name || 'Pending Invite'}</Text>
                    <Text style={styles.userEmail}>{u.email}</Text>
                  </View>
                  {!isEditing ? (
                    <View style={styles.headerActions}>
                      <View style={styles.roleBadge}>
                        <Text style={styles.badgeText}>{u.role}</Text>
                      </View>
                      <TouchableOpacity onPress={() => startEdit(u)} style={styles.editIcon}>
                        <Text style={styles.editIconText}>✎</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>

                {/* Inline edit form */}
                {isEditing ? (
                  <View style={styles.editForm}>
                    <Text style={styles.label}>Role</Text>
                    <TouchableOpacity style={styles.selectBtn} onPress={() => setEditRoleModalVisible(true)}>
                      <Text style={styles.selectText}>{editRole}</Text>
                    </TouchableOpacity>

                    {(editRole === 'WORKER' || editRole === 'MARKET_MANAGER') && (
                      <>
                        <Text style={styles.label}>{editRole === 'MARKET_MANAGER' ? 'Managed Market' : 'Market'}</Text>
                        <TouchableOpacity style={styles.selectBtn} onPress={() => setEditMarketModalVisible(true)}>
                          <Text style={styles.selectText}>
                            {editMarketId ? markets.find(m => m.id === editMarketId)?.name || 'Selected' : 'Select Market'}
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}

                    <Text style={styles.label}>Pay Rate ($/hr)</Text>
                    <TextInput
                      style={styles.input}
                      value={editWage}
                      onChangeText={setEditWage}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                    />

                    <View style={styles.editActions}>
                      <TouchableOpacity
                        style={[styles.primaryBtn, { flex: 1, marginTop: 0 }]}
                        onPress={() => handleSaveEdit(u.id)}
                        disabled={saving}
                      >
                        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Save</Text>}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.cancelBtn, { flex: 1 }]}
                        onPress={cancelEdit}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteUser(u.id, u.name)}
                      >
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    {/* Stats row */}
                    <View style={styles.userStats}>
                      <View style={styles.statCell}>
                        <Text style={styles.statLabel}>MARKET</Text>
                        <Text style={styles.statValue}>{u.market?.name || u.managedMarket?.name || '-'}</Text>
                      </View>
                      <View style={styles.statCell}>
                        <Text style={styles.statLabel}>PAY RATE</Text>
                        <Text style={styles.statValue}>{formatMoney(u.hourlyWage)}/hr</Text>
                      </View>
                      {u.role === 'WORKER' && (
                        <>
                          <View style={styles.statCell}>
                            <Text style={styles.statLabel}>WORKED</Text>
                            <Text style={styles.statValue}>{u.workedHours ?? 0}h</Text>
                          </View>
                          <View style={styles.statCell}>
                            <Text style={styles.statLabel}>PAY</Text>
                            <Text style={[styles.statValue, { color: '#22C55E' }]}>${payForCycle.toFixed(2)}</Text>
                          </View>
                        </>
                      )}
                    </View>

                    {u.role === 'WORKER' && (
                      <TouchableOpacity style={styles.assignBtn} onPress={() => openAssignModal(u)}>
                        <Text style={styles.assignBtnText}>+ Assign Shift</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ── Role Modal (Invite) ── */}
      <Modal visible={roleModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Role</Text>
            {['WORKER', 'MARKET_MANAGER', 'ADMIN'].map(r => (
              <TouchableOpacity key={r} style={styles.modalItem}
                onPress={() => { setRole(r); setMarketId(''); setRoleModalVisible(false); }}>
                <Text style={[styles.modalItemText, role === r && styles.modalItemActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setRoleModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Market Modal (Invite) ── */}
      <Modal visible={inviteMarketModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Market</Text>
            <TouchableOpacity style={styles.modalItem}
              onPress={() => { setMarketId(''); setInviteMarketModalVisible(false); }}>
              <Text style={styles.modalItemText}>None / Unassigned</Text>
            </TouchableOpacity>
            {markets.map(m => (
              <TouchableOpacity key={m.id} style={styles.modalItem}
                onPress={() => { setMarketId(m.id); setInviteMarketModalVisible(false); }}>
                <Text style={[styles.modalItemText, marketId === m.id && styles.modalItemActive]}>{m.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setInviteMarketModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Role Modal (Edit) ── */}
      <Modal visible={editRoleModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Role</Text>
            {['WORKER', 'MARKET_MANAGER', 'ADMIN'].map(r => (
              <TouchableOpacity key={r} style={styles.modalItem}
                onPress={() => { setEditRole(r); setEditMarketId(''); setEditRoleModalVisible(false); }}>
                <Text style={[styles.modalItemText, editRole === r && styles.modalItemActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setEditRoleModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Market Modal (Edit) ── */}
      <Modal visible={editMarketModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Market</Text>
            <TouchableOpacity style={styles.modalItem}
              onPress={() => { setEditMarketId(''); setEditMarketModalVisible(false); }}>
              <Text style={styles.modalItemText}>None / Unassigned</Text>
            </TouchableOpacity>
            {markets.map(m => (
              <TouchableOpacity key={m.id} style={styles.modalItem}
                onPress={() => { setEditMarketId(m.id); setEditMarketModalVisible(false); }}>
                <Text style={[styles.modalItemText, editMarketId === m.id && styles.modalItemActive]}>{m.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setEditMarketModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Assign Shift Modal (single modal, view switches internally) ── */}
      <Modal visible={!!assignModalUser} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: '94%', maxHeight: '85%' }]}>

            {/* ── Store picker view ── */}
            {assignView === 'storePicker' && (
              <>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setAssignView('main')} style={styles.pickerBack}>
                    <Text style={styles.pickerBackText}>← Back</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Select Store</Text>
                </View>
                <ScrollView style={{ maxHeight: 400 }}>
                  <TouchableOpacity style={styles.modalItem}
                    onPress={() => { setSelectedStoreId(''); setSelectedJobId(''); setAssignView('main'); }}>
                    <Text style={[styles.modalItemText, !selectedStoreId && styles.modalItemActive]}>All Stores</Text>
                  </TouchableOpacity>
                  {stores.map(s => (
                    <TouchableOpacity key={s.id} style={styles.modalItem}
                      onPress={() => { setSelectedStoreId(s.id); setSelectedJobId(''); setAssignView('main'); }}>
                      <Text style={[styles.modalItemText, selectedStoreId === s.id && styles.modalItemActive]}>{s.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* ── Job picker view ── */}
            {assignView === 'jobPicker' && (
              <>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setAssignView('main')} style={styles.pickerBack}>
                    <Text style={styles.pickerBackText}>← Back</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Select Job</Text>
                </View>
                <ScrollView style={{ maxHeight: 400 }}>
                  {filteredJobs.length === 0 ? (
                    <Text style={[styles.modalItemText, { color: '#9CA3AF', paddingVertical: 20, textAlign: 'center' }]}>No jobs found</Text>
                  ) : (
                    filteredJobs.map(j => (
                      <TouchableOpacity key={j.id} style={styles.modalItem}
                        onPress={() => { setSelectedJobId(j.id); setAssignView('main'); }}>
                        <Text style={[styles.modalItemText, selectedJobId === j.id && styles.modalItemActive]}>
                          {j.store?.name || 'Store'} • {j.startTimeStr}–{j.endTimeStr}
                        </Text>
                        {j.store?.market?.name && (
                          <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 2 }}>{j.store.market.name}</Text>
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </>
            )}

            {/* ── Main assign view ── */}
            {assignView === 'main' && (
              <>
                <Text style={styles.modalTitle}>Assign Shift</Text>
                {assignModalUser && (
                  <Text style={styles.assignModalSubtitle}>{assignModalUser.name}</Text>
                )}

                {/* Mode toggle */}
                <View style={styles.modeToggle}>
                  <TouchableOpacity
                    style={[styles.modeBtn, assignMode === 'recurring' && styles.modeBtnActive]}
                    onPress={() => setAssignMode('recurring')}
                  >
                    <Text style={[styles.modeBtnText, assignMode === 'recurring' && styles.modeBtnTextActive]}>Weekly Recurring</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modeBtn, assignMode === 'specific' && styles.modeBtnActive]}
                    onPress={() => setAssignMode('specific')}
                  >
                    <Text style={[styles.modeBtnText, assignMode === 'specific' && styles.modeBtnTextActive]}>Specific Date</Text>
                  </TouchableOpacity>
                </View>

                {/* Store filter */}
                <Text style={styles.label}>Filter by Store (optional)</Text>
                <TouchableOpacity style={styles.selectBtn} onPress={() => setAssignView('storePicker')}>
                  <Text style={styles.selectText}>{selectedStore ? selectedStore.name : 'All Stores'}</Text>
                </TouchableOpacity>

                {/* Job picker */}
                <Text style={styles.label}>Select Job</Text>
                <TouchableOpacity style={styles.selectBtn} onPress={() => setAssignView('jobPicker')}>
                  <Text style={styles.selectText}>
                    {selectedJob
                      ? `${selectedJob.store?.name || 'Store'} • ${selectedJob.startTimeStr}–${selectedJob.endTimeStr}`
                      : 'Select a job...'}
                  </Text>
                </TouchableOpacity>

                {/* Recurring: weekday picker */}
                {assignMode === 'recurring' && (
                  <>
                    <Text style={styles.label}>Days of Week</Text>
                    <View style={styles.weekdayRow}>
                      {WEEKDAYS.map(d => (
                        <TouchableOpacity
                          key={d.value}
                          style={[styles.dayBtn, selectedWeekdays.includes(d.value) && styles.dayBtnActive]}
                          onPress={() => toggleWeekday(d.value)}
                        >
                          <Text style={[styles.dayBtnText, selectedWeekdays.includes(d.value) && styles.dayBtnTextActive]}>
                            {d.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {selectedWeekdays.length > 0 && selectedJob && cycleLabel ? (
                      <Text style={styles.previewText}>Creates shifts for selected days within {cycleLabel}</Text>
                    ) : null}
                  </>
                )}

                {/* Specific: date input */}
                {assignMode === 'specific' && (
                  <>
                    <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="2026-05-01"
                      value={specificDate}
                      onChangeText={setSpecificDate}
                      keyboardType="numbers-and-punctuation"
                    />
                  </>
                )}

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  <TouchableOpacity
                    style={[styles.primaryBtn, { flex: 1, marginTop: 0 }]}
                    onPress={handleAssignJob}
                    disabled={assigning}
                  >
                    {assigning ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Assign</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { flex: 1 }]}
                    onPress={() => setAssignModalUser(null)}
                    disabled={assigning}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

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
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  scrollContent: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 14 },

  label: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 14,
    color: '#111827', backgroundColor: '#F9FAFB', marginBottom: 12,
  },
  row: { flexDirection: 'row' },
  selectBtn: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12,
    backgroundColor: '#F9FAFB', justifyContent: 'center', marginBottom: 12,
  },
  selectText: { fontSize: 14, color: '#111827' },

  primaryBtn: {
    backgroundColor: '#6366F1', paddingVertical: 13, borderRadius: 8,
    alignItems: 'center', marginTop: 12,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    backgroundColor: '#F3F4F6', paddingVertical: 13, borderRadius: 8, alignItems: 'center',
  },
  cancelBtnText: { color: '#374151', fontSize: 15, fontWeight: '600' },
  deleteBtn: {
    backgroundColor: '#FEE2E2', paddingVertical: 13, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center',
  },
  deleteBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '700' },

  inviteLinkBox: {
    marginTop: 14, padding: 12, backgroundColor: '#F0FDF4', borderRadius: 8,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  inviteLinkLabel: { fontSize: 11, fontWeight: '700', color: '#15803D', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  inviteLinkText: { fontSize: 12, color: '#166534', marginBottom: 10 },
  shareBtn: {
    backgroundColor: '#22C55E', paddingVertical: 9, borderRadius: 8, alignItems: 'center',
  },
  shareBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 1, marginBottom: 12, marginTop: 4 },

  userRow: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
  },
  userHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  userEmail: { fontSize: 12, color: '#6B7280' },
  roleBadge: { backgroundColor: '#EEF2FF', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 12 },
  badgeText: { color: '#6366F1', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  editIcon: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  editIconText: { fontSize: 14, color: '#6B7280' },

  editForm: { marginTop: 4 },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 12 },

  userStats: {
    flexDirection: 'row', flexWrap: 'wrap',
    borderTopWidth: 1, borderColor: '#F3F4F6', paddingTop: 10, gap: 4,
  },
  statCell: { flex: 1, minWidth: '22%' },
  statLabel: { fontSize: 9, color: '#9CA3AF', fontWeight: '700', letterSpacing: 0.5, marginBottom: 3, textTransform: 'uppercase' },
  statValue: { fontSize: 13, color: '#111827', fontWeight: '600' },

  assignBtn: {
    marginTop: 12, borderWidth: 1, borderColor: '#6366F1', borderRadius: 8,
    paddingVertical: 8, alignItems: 'center', backgroundColor: '#F5F3FF',
  },
  assignBtnText: { color: '#6366F1', fontSize: 13, fontWeight: '700' },

  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 14 },

  // Assign modal
  modeToggle: {
    flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 10,
    padding: 3, marginBottom: 14,
  },
  modeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  modeBtnTextActive: { color: '#111827' },
  weekdayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  dayBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  dayBtnActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  dayBtnText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  dayBtnTextActive: { color: '#fff' },
  previewText: { fontSize: 11, color: '#6B7280', marginBottom: 4, fontStyle: 'italic' },
  assignModalSubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 14 },
  cycleLabel: { fontSize: 12, color: '#6366F1', fontWeight: '600', textAlign: 'center', marginBottom: 12 },

  pickerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pickerBack: { paddingRight: 12, paddingVertical: 4 },
  pickerBackText: { fontSize: 14, color: '#6366F1', fontWeight: '600' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 10, textAlign: 'center' },
  modalItem: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalItemText: { fontSize: 15, color: '#374151', textAlign: 'center' },
  modalItemActive: { color: '#6366F1', fontWeight: '700' },
  modalCloseBtn: { marginTop: 14, paddingVertical: 12, alignItems: 'center' },
  modalCloseText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
});
