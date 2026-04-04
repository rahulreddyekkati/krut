import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { fetchWithAuth } from '../../utils/apiClient';

export default function SubmitRecap() {
  const { id, date } = useLocalSearchParams();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!notes.trim()) {
      Alert.alert("Missing Info", "Please enter a brief recap of your shift.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/jobs/${id}/recaps`, {
        method: "POST",
        body: JSON.stringify({ notes, date, expenses: [] }) // MVP sends empty expenses array natively
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
      Alert.alert("Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
           <Text style={styles.title}>Submit Shift Recap</Text>
           <Text style={styles.subtitle}>Log your notes before ending your day</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.label}>Shift Notes / Summary</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={6}
            placeholder="What happened during your shift? Any incidents or highlights?"
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.disabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
             {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Recap</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={() => router.replace('/(tabs)')}
            disabled={loading}
          >
             <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { flexGrow: 1, padding: 20, paddingTop: 60 },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  textArea: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, minHeight: 120, marginBottom: 20 },
  button: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.7 },
  skipButton: { marginTop: 16, alignItems: 'center', padding: 12 },
  skipText: { color: '#6B7280', fontSize: 16, fontWeight: '500' }
});
