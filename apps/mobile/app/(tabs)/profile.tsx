import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';

export default function ProfileTab() {
  const { signOut } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>W</Text>
        </View>
        <Text style={styles.name}>Worker</Text>
        <Text style={styles.role}>WORKER</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={styles.menuText}>My Recaps</Text>
          <Text style={styles.menuArrow}>›</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuText}>Pay History</Text>
          <Text style={styles.menuArrow}>›</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>📄</Text>
          <Text style={styles.menuText}>Training Materials</Text>
          <Text style={styles.menuArrow}>›</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Notifications</Text>
          <Text style={styles.menuArrow}>›</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Workforce OS v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { paddingBottom: 60 },

  avatarSection: { alignItems: 'center', paddingTop: 70, paddingBottom: 32, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E5E7EB' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  role: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', letterSpacing: 1 },

  menuSection: { marginTop: 24, marginHorizontal: 16 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 18, borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '500', color: '#374151' },
  menuArrow: { fontSize: 22, color: '#D1D5DB' },

  logoutButton: {
    marginHorizontal: 16, marginTop: 32, padding: 16, borderRadius: 12,
    backgroundColor: '#FEE2E2', alignItems: 'center',
  },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },

  version: { textAlign: 'center', color: '#D1D5DB', fontSize: 12, marginTop: 24 },
});
