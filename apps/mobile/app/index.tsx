import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { router } from 'expo-router';

export default function Home() {
  const { token, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/login');
    }
  }, [isLoading, token]);

  if (isLoading || !token) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workforce OS Native</Text>
      <Text style={styles.subtitle}>Welcome back!</Text>
      
      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  logoutButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
  }
});
