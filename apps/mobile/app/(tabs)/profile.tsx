import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { router } from 'expo-router';

export default function ProfileTab() {
  const { signOut, user } = useAuth();

  return (
    <View style={styles.container}>
      {/* ─── Navbar ─── */}
      <View style={styles.navbar}>
        <View>
          <Text style={styles.brand}>Kruto Tastes</Text>
          <Text style={styles.navSubtitle}>Profile</Text>
        </View>
        <View style={styles.navIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/messages')}>
            <Text style={styles.iconEmoji}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
            <Text style={styles.iconEmoji}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={signOut}>
            <Text style={styles.logoutIcon}>↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'W'}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Worker'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'WORKER'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notifications')}>
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuText}>Notifications</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          {/* Pay History and Settings — coming soon */}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Kruto Tastes v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { paddingBottom: 60 },

  /* ── Navbar ── */
  navbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingBottom: 14, paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderColor: '#F3F4F6',
  },
  brand: { fontSize: 20, fontWeight: '800', color: '#6366F1' },
  navSubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  navIcons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  iconEmoji: { fontSize: 18 },
  logoutIcon: { fontSize: 18, color: '#EF4444', fontWeight: '700' },

  /* ── Avatar ── */
  avatarSection: { alignItems: 'center', paddingTop: 32, paddingBottom: 24, backgroundColor: '#fff', marginBottom: 12 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 6 },
  roleBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 11, fontWeight: '700', color: '#6366F1', letterSpacing: 1 },

  /* ── Menu ── */
  menuSection: { marginTop: 8, marginHorizontal: 16 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 18, borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '500', color: '#374151' },
  menuArrow: { fontSize: 22, color: '#D1D5DB' },

  logoutButton: {
    marginHorizontal: 16, marginTop: 24, padding: 16, borderRadius: 12,
    backgroundColor: '#FEE2E2', alignItems: 'center',
  },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },

  version: { textAlign: 'center', color: '#D1D5DB', fontSize: 12, marginTop: 24 },
});
