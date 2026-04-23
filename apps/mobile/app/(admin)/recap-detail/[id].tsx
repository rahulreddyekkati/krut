import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { fetchWithAuth } from '../../../utils/apiClient';

export default function AdminRecapDetail() {
  const { id } = useLocalSearchParams();
  const [recap, setRecap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [managerNotes, setManagerNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRecap();
  }, [id]);

  const fetchRecap = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`/admin/recaps/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRecap(data);
        if (data.managerReview) {
          setManagerNotes(data.managerReview);
        }
      } else {
        Alert.alert('Error', 'Failed to load recap details');
        router.back();
      }
    } catch (e) {
      Alert.alert('Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!managerNotes.trim()) {
      Alert.alert('Missing Info', 'Please add manager review notes before approving or rejecting.');
      return;
    }

    if (action === 'REJECT') {
      Alert.alert(
        'Confirm Rejection',
        'Are you sure you want to reject this recap? The worker will be notified and asked to resubmit.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reject', style: 'destructive', onPress: () => submitAction(action) }
        ]
      );
    } else {
      submitAction(action);
    }
  };

  const submitAction = async (action: 'APPROVE' | 'REJECT') => {
    setActionLoading(true);
    const endpoint = `/admin/recaps/${id}/${action.toLowerCase()}`;
    try {
      const res = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          managerNotes: managerNotes.trim()
        })
      });

      if (res.ok) {
        Alert.alert('Success', `Recap successfully ${action.toLowerCase()}d.`, [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        const data = await res.json();
        Alert.alert('Error', data.error || 'Failed to process recap');
      }
    } catch {
      Alert.alert('Network Error', 'Failed to submit action');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString();
  };

  const getRushBadge = (level: string) => {
    if (level === 'SLOW') return { bg: '#D1FAE5', text: '#065F46', label: 'Slow 🐢' };
    if (level === 'MEDIUM') return { bg: '#FEF3C7', text: '#92400E', label: 'Medium ⚡' };
    return { bg: '#FEE2E2', text: '#991B1B', label: 'Busy 🔥' };
  };

  if (loading || !recap) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const isPending = recap.status === 'PENDING';
  const rushBadge = getRushBadge(recap.rushLevel);

  let receiptUris: string[] = [];
  try {
    if (recap.receiptUrl) receiptUris = JSON.parse(recap.receiptUrl);
  } catch(e) {}

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recap Details</Text>
        <View style={[styles.statusBadge, isPending ? styles.badgePending : recap.status === 'APPROVED' ? styles.badgeApproved : styles.badgeRejected]}>
          <Text style={[styles.statusBadgeText, isPending ? styles.textPending : recap.status === 'APPROVED' ? styles.textApproved : styles.textRejected]}>
            {recap.status}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>SHIFT INFORMATION</Text>
          <View style={styles.row}><Text style={styles.label}>Worker</Text><Text style={styles.val}>{recap.workerName}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Store</Text><Text style={styles.val}>{recap.storeName}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Market</Text><Text style={styles.val}>{recap.marketName}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Date</Text><Text style={styles.val}>{formatDate(recap.shiftDate || recap.createdAt)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Clock In</Text><Text style={styles.val}>{formatTime(recap.clockIn)}</Text></View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}><Text style={styles.label}>Clock Out</Text><Text style={styles.val}>{formatTime(recap.clockOut)}</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>RUSH LEVEL</Text>
          <View style={[styles.rushPill, { backgroundColor: rushBadge.bg }]}>
            <Text style={[styles.rushText, { color: rushBadge.text }]}>{rushBadge.label}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>SALES SUMMARY</Text>
          <View style={styles.row}><Text style={styles.label}>Customers Sampled</Text><Text style={styles.val}>{recap.consumersSampled || 0}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Receipt Total</Text><Text style={styles.val}>${parseFloat(recap.receiptTotal || '0').toFixed(2)}</Text></View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}><Text style={styles.label}>Reimbursement Total</Text><Text style={[styles.val, { color: '#10B981' }]}>${parseFloat(recap.reimbursement || '0').toFixed(2)}</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>CUSTOMER FEEDBACK</Text>
          <Text style={styles.feedbackText}>{recap.customerFeedback || "No feedback provided."}</Text>
        </View>

        {recap.skus && recap.skus.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>INVENTORY</Text>
            {recap.skus.map((sku: any, i: number) => (
              <View key={i} style={[styles.row, i === recap.skus.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.label}>{sku.skuName}</Text>
                <Text style={styles.val}>{sku.bottlesSold} sold</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>RECEIPT</Text>
          {receiptUris.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {receiptUris.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.receiptImg} />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.feedbackText}>No receipt attached</Text>
          )}
        </View>

        <View style={[styles.card, { borderColor: '#818CF8', borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: '#6366F1' }]}>MANAGER'S REVIEW</Text>
          {isPending ? (
            <TextInput
              style={styles.reviewInput}
              multiline
              placeholder="Add manager review notes before approving or rejecting..."
              value={managerNotes}
              onChangeText={setManagerNotes}
            />
          ) : (
            <Text style={styles.feedbackText}>{managerNotes || "No manager notes provided."}</Text>
          )}
        </View>

        {isPending && (
          <View style={styles.actionBlock}>
            <TouchableOpacity 
              style={[styles.btnAction, styles.btnReject, actionLoading && { opacity: 0.5 }]} 
              onPress={() => handleAction('REJECT')}
              disabled={actionLoading}
            >
              <Text style={styles.textReject}>Reject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.btnAction, styles.btnApprove, actionLoading && { opacity: 0.5 }]} 
              onPress={() => handleAction('APPROVE')}
              disabled={actionLoading}
            >
              <Text style={styles.textApprove}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 60, paddingBottom: 15, paddingHorizontal: 20,
    backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderColor: '#E5E7EB',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  backBtnText: { fontSize: 24, color: '#374151' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  badgePending: { backgroundColor: '#FEF3C7' },
  textPending: { color: '#92400E', fontSize: 12, fontWeight: '700' },
  badgeApproved: { backgroundColor: '#D1FAE5' },
  textApproved: { color: '#065F46', fontSize: 12, fontWeight: '700' },
  badgeRejected: { backgroundColor: '#FEE2E2' },
  textRejected: { color: '#991B1B', fontSize: 12, fontWeight: '700' },
  
  scroll: { padding: 15 },
  card: {
    backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15,
  },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#6B7280', letterSpacing: 0.5, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  label: { fontSize: 14, color: '#6B7280', textTransform: 'uppercase' },
  val: { fontSize: 14, fontWeight: '600', color: '#111827' },
  rushPill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  rushText: { fontSize: 13, fontWeight: '700' },
  feedbackText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  receiptImg: { width: 150, height: 200, borderRadius: 8, marginRight: 10, backgroundColor: '#E5E7EB' },
  reviewInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10,
    minHeight: 80, textAlignVertical: 'top', fontSize: 14, color: '#111827',
  },
  
  actionBlock: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnAction: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnReject: { borderWidth: 1, borderColor: '#EF4444', backgroundColor: '#fff' },
  textReject: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
  btnApprove: { backgroundColor: '#10B981' },
  textApprove: { color: '#fff', fontSize: 15, fontWeight: '700' }
});
