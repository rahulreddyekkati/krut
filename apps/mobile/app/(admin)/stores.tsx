import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, ActivityIndicator, TextInput, Alert, Modal
} from 'react-native';
import * as Location from 'expo-location';
import { fetchWithAuth } from '../../utils/apiClient';
import { router } from 'expo-router';

interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  marketId: string;
  market: { name: string };
  _count: { jobs: number };
}

const EMPTY_FORM = { name: '', address: '', latitude: '', longitude: '', radius: '100', marketId: '' };

export default function StoresScreen() {
  const [stores, setStores] = useState<Store[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Market picker inside form modal
  const [formView, setFormView] = useState<'form' | 'marketPicker'>('form');

  // ── Data ──────────────────────────────────────────────────────────────────

  const loadData = async () => {
    try {
      const [storesRes, marketsRes] = await Promise.all([
        fetchWithAuth('/stores'),
        fetchWithAuth('/markets'),
      ]);
      if (storesRes.ok) setStores(await storesRes.json());
      if (marketsRes.ok) {
        const d = await marketsRes.json();
        setMarkets(d.markets || d || []);
      }
    } catch (e) {
      console.log('Error loading stores', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };
  useEffect(() => { loadData(); }, []);

  // ── Location ──────────────────────────────────────────────────────────────

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setForm(prev => ({
        ...prev,
        latitude: loc.coords.latitude.toFixed(6),
        longitude: loc.coords.longitude.toFixed(6),
      }));
    } catch {
      Alert.alert('Error', 'Could not get current location. Please enter coordinates manually.');
    } finally {
      setGettingLocation(false);
    }
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingStore(null);
    setForm({ ...EMPTY_FORM });
    setFormView('form');
    setShowForm(true);
  };

  const openEdit = (store: Store) => {
    setEditingStore(store);
    setForm({
      name: store.name,
      address: store.address,
      latitude: store.latitude.toString(),
      longitude: store.longitude.toString(),
      radius: store.radius.toString(),
      marketId: store.marketId,
    });
    setFormView('form');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Store name is required');
    if (!form.address.trim()) return Alert.alert('Error', 'Address is required');
    if (!form.latitude || !form.longitude) return Alert.alert('Error', 'Latitude and longitude are required');
    if (!form.marketId) return Alert.alert('Error', 'Please select a market');

    setSaving(true);
    try {
      const url = editingStore ? `/stores/${editingStore.id}` : '/stores';
      const method = editingStore ? 'PUT' : 'POST';
      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify({
          name: form.name.trim(),
          address: form.address.trim(),
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          radius: parseFloat(form.radius) || 100,
          marketId: form.marketId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowForm(false);
        setEditingStore(null);
        loadData();
      } else {
        Alert.alert('Error', data.error || 'Failed to save store');
      }
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (store: Store) => {
    Alert.alert(
      'Delete Store',
      store._count.jobs > 0
        ? `Cannot delete "${store.name}" — it has ${store._count.jobs} job(s) linked to it.`
        : `Delete "${store.name}"? This cannot be undone.`,
      store._count.jobs > 0
        ? [{ text: 'OK' }]
        : [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete', style: 'destructive',
              onPress: async () => {
                try {
                  const res = await fetchWithAuth(`/stores/${store.id}`, { method: 'DELETE' });
                  if (res.ok) loadData();
                  else { const d = await res.json(); Alert.alert('Error', d.error || 'Failed to delete'); }
                } catch { Alert.alert('Error', 'Network error'); }
              }
            }
          ]
    );
  };

  const selectedMarket = markets.find(m => m.id === form.marketId);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Store Management</Text>
          <Text style={styles.headerSubtitle}>View, add and edit store locations.</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6366F1" />
        ) : stores.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏪</Text>
            <Text style={styles.emptyTitle}>No Stores Yet</Text>
            <Text style={styles.emptyText}>Tap "+ Add" to create your first store.</Text>
          </View>
        ) : (
          stores.map(store => (
            <View key={store.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <View style={styles.marketBadge}>
                    <Text style={styles.marketBadgeText}>{store.market?.name}</Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(store)}>
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(store)}>
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.address}>{store.address}</Text>

              <View style={styles.cardMeta}>
                <Text style={styles.metaItem}>📍 {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}</Text>
                <Text style={styles.metaItem}>📏 {store.radius}m radius</Text>
                <Text style={styles.metaItem}>💼 {store._count?.jobs ?? 0} job{store._count?.jobs !== 1 ? 's' : ''}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── Add / Edit Modal ── */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>

            {/* Market picker sub-view */}
            {formView === 'marketPicker' && (
              <>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setFormView('form')} style={styles.pickerBack}>
                    <Text style={styles.pickerBackText}>← Back</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Select Market</Text>
                </View>
                <ScrollView style={{ maxHeight: 400 }}>
                  {markets.map(m => (
                    <TouchableOpacity key={m.id} style={styles.modalItem}
                      onPress={() => { setForm(prev => ({ ...prev, marketId: m.id })); setFormView('form'); }}>
                      <Text style={[styles.modalItemText, form.marketId === m.id && styles.modalItemActive]}>
                        {m.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Main form */}
            {formView === 'form' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>{editingStore ? 'Edit Store' : 'New Store'}</Text>

                <Text style={styles.label}>Store Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Downtown Store A"
                  value={form.name}
                  onChangeText={v => setForm(prev => ({ ...prev, name: v }))}
                />

                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full street address"
                  value={form.address}
                  onChangeText={v => setForm(prev => ({ ...prev, address: v }))}
                  multiline
                />

                {/* Lat / Lng with location button */}
                <View style={styles.coordRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.label}>Latitude</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="37.7749"
                      value={form.latitude}
                      onChangeText={v => setForm(prev => ({ ...prev, latitude: v }))}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.label}>Longitude</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="-122.4194"
                      value={form.longitude}
                      onChangeText={v => setForm(prev => ({ ...prev, longitude: v }))}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                </View>

                {/* Use current location button */}
                <TouchableOpacity
                  style={styles.locationBtn}
                  onPress={getCurrentLocation}
                  disabled={gettingLocation}
                >
                  {gettingLocation ? (
                    <ActivityIndicator size="small" color="#6366F1" />
                  ) : (
                    <Text style={styles.locationBtnText}>📍 Use Current Location</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.label}>Radius (meters)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="100"
                      value={form.radius}
                      onChangeText={v => setForm(prev => ({ ...prev, radius: v }))}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.label}>Market</Text>
                    <TouchableOpacity style={styles.selectBtn} onPress={() => setFormView('marketPicker')}>
                      <Text style={styles.selectText}>
                        {selectedMarket ? selectedMarket.name : 'Select Market'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={[styles.primaryBtn, { flex: 1 }]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    {saving ? <ActivityIndicator color="#fff" /> : (
                      <Text style={styles.primaryBtnText}>{editingStore ? 'Save Changes' : 'Create Store'}</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { flex: 1 }]}
                    onPress={() => { setShowForm(false); setEditingStore(null); }}
                    disabled={saving}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
  headerBtn: { marginRight: 14, padding: 4 },
  headerIcon: { fontSize: 24, color: '#111827' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  addBtn: {
    backgroundColor: '#6366F1', paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 8,
  },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  scrollContent: { padding: 16, paddingBottom: 40 },

  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#6B7280' },

  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  storeName: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 6 },
  marketBadge: {
    backgroundColor: '#EEF2FF', paddingVertical: 3, paddingHorizontal: 10,
    borderRadius: 12, alignSelf: 'flex-start',
  },
  marketBadgeText: { color: '#6366F1', fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  cardActions: { flexDirection: 'row', gap: 8, marginLeft: 12 },
  editBtn: {
    backgroundColor: '#F3F4F6', paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB',
  },
  editBtnText: { color: '#374151', fontSize: 13, fontWeight: '600' },
  deleteBtn: {
    backgroundColor: '#FEE2E2', paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 8,
  },
  deleteBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },

  address: { fontSize: 13, color: '#6B7280', marginBottom: 10 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, borderTopWidth: 1, borderColor: '#F3F4F6', paddingTop: 10 },
  metaItem: { fontSize: 12, color: '#6B7280' },

  // Form modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16, textAlign: 'center' },

  pickerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pickerBack: { paddingRight: 12, paddingVertical: 4 },
  pickerBackText: { fontSize: 14, color: '#6366F1', fontWeight: '600' },
  modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalItemText: { fontSize: 15, color: '#374151', textAlign: 'center' },
  modalItemActive: { color: '#6366F1', fontWeight: '700' },

  label: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12,
    fontSize: 14, color: '#111827', backgroundColor: '#F9FAFB', marginBottom: 12,
  },
  row: { flexDirection: 'row' },
  coordRow: { flexDirection: 'row' },
  selectBtn: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12,
    backgroundColor: '#F9FAFB', justifyContent: 'center', marginBottom: 12,
  },
  selectText: { fontSize: 14, color: '#111827' },

  locationBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#6366F1', borderRadius: 8,
    paddingVertical: 10, marginBottom: 16, backgroundColor: '#F5F3FF',
    minHeight: 42,
  },
  locationBtnText: { color: '#6366F1', fontSize: 14, fontWeight: '700' },

  formActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  primaryBtn: {
    backgroundColor: '#6366F1', paddingVertical: 13, borderRadius: 8, alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    backgroundColor: '#F3F4F6', paddingVertical: 13, borderRadius: 8, alignItems: 'center',
  },
  cancelBtnText: { color: '#374151', fontSize: 15, fontWeight: '600' },
});
