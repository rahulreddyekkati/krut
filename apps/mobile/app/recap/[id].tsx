import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { fetchWithAuth } from '../../utils/apiClient';
import { useAuth } from '../../providers/AuthProvider';

const RUSH_OPTIONS = [
  { label: 'Very Busy', emoji: '🔥', value: 'VERY_BUSY' },
  { label: 'Medium', emoji: '⚡', value: 'MEDIUM' },
  { label: 'Slow', emoji: '🐢', value: 'SLOW' },
];

export default function SubmitRecap() {
  const { id, date, assignmentId } = useLocalSearchParams();
  const { user } = useAuth();

  // Form state
  const [rushLevel, setRushLevel] = useState('');
  const [customersSampled, setCustomersSampled] = useState('0');
  const [receiptTotal, setReceiptTotal] = useState('0.00');
  const [reimbursementTotal, setReimbursementTotal] = useState('0.00');
  const [customerFeedback, setCustomerFeedback] = useState('');
  const [receiptImages, setReceiptImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Shift info
  const [shiftInfo, setShiftInfo] = useState<any>(null);

  useEffect(() => {
    loadShiftInfo();
  }, []);

  const loadShiftInfo = async () => {
    try {
      const res = await fetchWithAuth('/jobs/my-shifts');
      if (res.ok) {
        const data = await res.json();
        const allShifts = [
          ...(data.currentCycle || []),
          ...(data.upcoming || []),
        ];
        // Find the matching assignment - prefer exact assignmentId match
        let match = null;
        if (assignmentId) {
          match = allShifts.find((a: any) => a.id === assignmentId);
        }
        // Fallback: find by jobId with clockOut (the pending recap one)
        if (!match) {
          match = allShifts.find((a: any) =>
            a.jobId === id && a.clockOut
          );
        }
        // Final fallback: any match on jobId
        if (!match) {
          match = allShifts.find((a: any) => a.jobId === id);
        }
        if (match) setShiftInfo(match);
      }
    } catch (e) {
      console.log('Failed to load shift info', e);
    }
  };

  const pickReceiptImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload receipts.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets) {
      setReceiptImages(prev => [...prev, ...result.assets.map(a => `data:image/jpeg;base64,${a.base64}`)]);
    }
  };

  const takeReceiptPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take receipt photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets) {
      setReceiptImages(prev => [...prev, ...result.assets.map(a => `data:image/jpeg;base64,${a.base64}`)]);
    }
  };

  const removeImage = (index: number) => {
    setReceiptImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!rushLevel) {
      Alert.alert("Missing Info", "Please select the rush level.");
      return;
    }

    setLoading(true);
    try {
      const body: any = {
        jobId: id,
        rushLevel,
        customersSampled,
        receiptTotal,
        reimbursementTotal,
        customerFeedback,
        receiptUrl: JSON.stringify(receiptImages),
      };
      if (assignmentId) body.assignmentId = assignmentId;

      const res = await fetchWithAuth('/worker/submit-recap', {
        method: "POST",
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "Your recap has been submitted successfully!", [
          { text: "OK", onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        Alert.alert("Error", data.error || "Failed to submit recap");
      }
    } catch {
      Alert.alert("Network Error", "Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatClockTime = (dt: string | null | undefined) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dt: string | null | undefined) => {
    if (!dt) return date ? String(date) : '—';
    return new Date(dt).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
    });
  };

  // Get market name from either upcoming or currentCycle data
  const marketName = shiftInfo?.job?.market?.name || '—';
  const storeName = shiftInfo?.job?.store?.name || '—';
  const clockIn = shiftInfo?.clockIn;
  const clockOut = shiftInfo?.clockOut;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Recaps</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Shift Info Card ─── */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Worker</Text>
            <Text style={styles.infoValue}>{user?.name || 'Worker'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Market</Text>
            <Text style={styles.infoValue}>{marketName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Store</Text>
            <Text style={styles.infoValue}>{storeName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(shiftInfo?.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Clock In</Text>
            <Text style={styles.infoValue}>{formatClockTime(clockIn)}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Clock Out</Text>
            <Text style={styles.infoValue}>{formatClockTime(clockOut)}</Text>
          </View>
        </View>

        {/* ─── Rush Level ─── */}
        <Text style={styles.sectionTitle}>HOW WAS THE RUSH?</Text>
        <View style={styles.rushRow}>
          {RUSH_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.rushOption, rushLevel === opt.value && styles.rushOptionActive]}
              onPress={() => setRushLevel(opt.value)}
            >
              <Text style={styles.rushEmoji}>{opt.emoji}</Text>
              <Text style={[styles.rushLabel, rushLevel === opt.value && styles.rushLabelActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Sales Summary ─── */}
        <Text style={styles.sectionTitle}>SALES SUMMARY</Text>

        <Text style={styles.fieldLabel}>Customers Sampled</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={customersSampled}
            onChangeText={setCustomersSampled}
            keyboardType="number-pad"
            placeholder="0"
          />
        </View>

        <Text style={styles.fieldLabel}>Receipt Total</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputPrefix}>$</Text>
          <TextInput
            style={[styles.input, { paddingLeft: 24 }]}
            value={receiptTotal}
            onChangeText={setReceiptTotal}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        <Text style={styles.fieldLabel}>Reimbursement Total</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputPrefix}>$</Text>
          <TextInput
            style={[styles.input, { paddingLeft: 24 }]}
            value={reimbursementTotal}
            onChangeText={setReimbursementTotal}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        {/* ─── Upload Receipts ─── */}
        <Text style={styles.sectionTitle}>UPLOAD RECEIPTS</Text>
        <View style={styles.uploadRow}>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickReceiptImage}>
            <Text style={styles.uploadBtnEmoji}>📁</Text>
            <Text style={styles.uploadBtnText}>Choose Files</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadBtn} onPress={takeReceiptPhoto}>
            <Text style={styles.uploadBtnEmoji}>📷</Text>
            <Text style={styles.uploadBtnText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {receiptImages.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {receiptImages.map((uri, i) => (
              <View key={i} style={styles.imageThumb}>
                <Image source={{ uri }} style={styles.thumbImage} />
                <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(i)}>
                  <Text style={styles.removeImgText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
        {receiptImages.length === 0 && (
          <Text style={styles.noFilesText}>No files chosen</Text>
        )}

        {/* ─── Customer Feedback ─── */}
        <Text style={styles.sectionTitle}>CUSTOMER FEEDBACK</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="Any notes or customer feedback from today's shift..."
          placeholderTextColor="#9CA3AF"
          value={customerFeedback}
          onChangeText={setCustomerFeedback}
          textAlignVertical="top"
        />

        {/* ─── Submit ─── */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Recap</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.replace('/(tabs)')}
          disabled={loading}
        >
          <Text style={styles.skipBtnText}>Skip for now</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { flexGrow: 1, padding: 20, paddingTop: 60 },

  /* Header */
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB',
    justifyContent: 'center', alignItems: 'center',
  },
  closeBtnText: { fontSize: 16, color: '#374151', fontWeight: '600' },

  /* Info Card */
  infoCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 4,
    borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: '#F3F4F6',
  },
  infoLabel: { fontSize: 15, color: '#6B7280' },
  infoValue: { fontSize: 15, fontWeight: '700', color: '#111827' },

  /* Section */
  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: '#374151',
    letterSpacing: 1, marginBottom: 12, marginTop: 8,
  },

  /* Rush Level */
  rushRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  rushOption: {
    flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff',
  },
  rushOptionActive: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  rushEmoji: { fontSize: 24, marginBottom: 6 },
  rushLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  rushLabelActive: { color: '#6366F1' },

  /* Fields */
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputWrapper: { position: 'relative', marginBottom: 16 },
  inputPrefix: {
    position: 'absolute', left: 12, top: 14, fontSize: 15, color: '#9CA3AF', zIndex: 1,
  },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    padding: 12, fontSize: 15, color: '#111827',
  },

  /* Upload Receipts */
  uploadRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  uploadBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
  },
  uploadBtnEmoji: { fontSize: 16 },
  uploadBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  noFilesText: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 16 },
  imageScroll: { marginBottom: 16 },
  imageThumb: { position: 'relative', marginRight: 10 },
  thumbImage: { width: 80, height: 80, borderRadius: 8 },
  removeImgBtn: {
    position: 'absolute', top: -6, right: -6,
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#EF4444',
    justifyContent: 'center', alignItems: 'center',
  },
  removeImgText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  /* Text area */
  textArea: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    padding: 12, fontSize: 15, color: '#111827', minHeight: 100, marginBottom: 24,
  },

  /* Submit */
  submitBtn: {
    backgroundColor: '#6366F1', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginBottom: 12,
  },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipBtnText: { color: '#6B7280', fontSize: 15, fontWeight: '500' },
});
