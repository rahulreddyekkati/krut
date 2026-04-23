import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { fetchWithAuth } from '../utils/apiClient';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = 280;

type NavItemProps = {
  label: string;
  target?: string;
  active?: boolean;
  onPress: () => void;
  showBadge?: boolean;
};

const NavItem = ({ label, active, onPress, showBadge }: NavItemProps) => (
  <TouchableOpacity 
    style={[styles.navItem, active && styles.navItemActive]} 
    onPress={onPress}
  >
    <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
    {showBadge && <View style={styles.badge} />}
  </TouchableOpacity>
);

export default function AdminDrawer({ onClose }: { onClose: () => void }) {
  const { signOut } = useAuth();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [pendingRecapCount, setPendingRecapCount] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    const fetchCounts = () => {
      fetchWithAuth('/admin/notifications/counts')
        .then(r => r.json())
        .then(data => setPendingRecapCount(data.pendingRecaps ?? 0))
        .catch(() => {});
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => onClose());
  };

  const navigateTo = (path: string) => {
    handleClose();
    if (path === '/') return; // Stays on home tab
    setTimeout(() => {
      router.push(path as any);
    }, 250);
  };

  const handleLogout = async () => {
    handleClose();
    await signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.overlayContainer}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>
      
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Portal</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
             <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navContainer}>
          <NavItem label="Dashboard" active={true} onPress={() => navigateTo('/')} />
          <NavItem label="Markets" onPress={() => navigateTo('/(admin)/markets')} />
          <NavItem label="Stores" onPress={() => navigateTo('/(admin)/stores')} />
          <NavItem label="Users" onPress={() => navigateTo('/(admin)/users')} />
          <NavItem label="Jobs" onPress={() => navigateTo('/(admin)/jobs')} />
          <NavItem label="Inventory Items" onPress={() => navigateTo('/(admin)/inventory')} />
          <NavItem label="Reports" onPress={() => navigateTo('/(admin)/reports')} />
          <NavItem label="Messages" onPress={() => navigateTo('/messages')} />
          <NavItem label="Recaps" showBadge={pendingRecapCount > 0} onPress={() => navigateTo('/(admin)/recaps')} />
          <NavItem label="Shift Release Approvals" onPress={() => navigateTo('/(admin)/shift-releases')} />
          <NavItem label="Released Shifts" onPress={() => navigateTo('/(admin)/released-shifts')} />
          
          <View style={styles.divider} />

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    width: DRAWER_WIDTH, backgroundColor: '#ffffff',
    shadowColor: '#000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
    borderBottomWidth: 1, borderColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#6366F1' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  closeIcon: { fontSize: 16, color: '#6B7280', fontWeight: 'bold' },
  
  navContainer: { paddingVertical: 12 },
  navItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20,
    marginHorizontal: 12, borderRadius: 8,
    marginBottom: 2,
  },
  navItemActive: { backgroundColor: '#EEF2FF' },
  navText: { fontSize: 15, color: '#374151', fontWeight: '500' },
  navTextActive: { color: '#6366F1', fontWeight: '700' },
  badge: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444',
    marginLeft: 8, marginTop: 2,
  },
  
  divider: { height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 20, marginVertical: 16 },
  
  logoutBtn: {
    marginHorizontal: 20, paddingVertical: 14, paddingHorizontal: 20,
    backgroundColor: '#FEE2E2', borderRadius: 8,
  },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '600' }
});
