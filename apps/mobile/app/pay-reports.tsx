import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, RefreshControl, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { fetchWithAuth } from '../utils/apiClient';

interface ShiftRow {
  id: string;
  date: string | null;
  store: string;
  market: string | null;
  storeTimezone: string;
  clockIn: string | null;
  clockOut: string | null;
  breakTimeMinutes: number;
  assignedHours: number;
  workedHours: number;
  rate: number;
  reimbursement: number;
  reimbursementPending: boolean;
  hoursPending: boolean;
  bonus: number;
  shiftPay: number;
  totalPay: number;
  taxablePay: number;
}

interface CycleReport {
  cycleId: string;
  cycleLabel: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  summary: {
    assignedHours: number;
    workedHours: number;
    currentHourlyWage: number;
    reimbursement: number;
    bonus: number;
    totalWage: number;
    totalPayForCycle: number | null;
    taxablePay: number | null;
  };
  shifts: ShiftRow[];
}

interface Employee {
  name: string;
  email: string;
  role: string;
}

// Timezone-aware time formatting — server-side `toLocaleTimeString` can't be trusted to
// honor `timeZone` consistently across engines, same rationale as AdminDashboard.tsx's
// identically-named helper (duplicated locally here per this codebase's convention of
// per-screen formatters rather than a shared one).
const formatTime = (dateStr: string | null, timeZone?: string) => {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '--';
  const zoned = timeZone ? new Date(d.toLocaleString('en-US', { timeZone })) : d;
  return zoned.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// `date` is a UTC-midnight calendar marker, not a real clock time — format it in UTC so it
// always shows the intended calendar day regardless of the viewer's own device timezone
// (same rationale as ShiftCard.tsx's date formatting).
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
};

const formatMoney = (val?: number | null) => {
  if (val === undefined || val === null) return 'N/A';
  return '$' + val.toFixed(2);
};

const formatHours = (val?: number | null) => {
  if (val === undefined || val === null) return '0.00h';
  return val.toFixed(2) + 'h';
};

const formatBreak = (mins: number) => (mins > 0 ? `${Math.round(mins)} min` : '--');

const formatUpdatedAt = (d: Date) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function ShiftMiniCard({ shift }: { shift: ShiftRow }) {
  return (
    <View style={styles.shiftCard}>
      <View style={styles.shiftCardHeader}>
        <Text style={styles.shiftDate}>{formatDate(shift.date)}</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.shiftPay}>{formatMoney(shift.totalPay)}</Text>
          {shift.hoursPending && (
            <Text style={styles.shiftFieldPending}>Awaiting recap</Text>
          )}
        </View>
      </View>
      <Text style={styles.shiftStore}>{shift.store}{shift.market ? ` · ${shift.market}` : ''}</Text>

      <View style={styles.shiftGrid}>
        <View style={styles.shiftField}>
          <Text style={styles.shiftFieldLabel}>CLOCK IN</Text>
          <Text style={styles.shiftFieldValue}>{formatTime(shift.clockIn, shift.storeTimezone)}</Text>
        </View>
        <View style={styles.shiftField}>
          <Text style={styles.shiftFieldLabel}>CLOCK OUT</Text>
          <Text style={styles.shiftFieldValue}>{formatTime(shift.clockOut, shift.storeTimezone)}</Text>
        </View>
        <View style={styles.shiftField}>
          <Text style={styles.shiftFieldLabel}>BREAK</Text>
          <Text style={styles.shiftFieldValue}>{formatBreak(shift.breakTimeMinutes)}</Text>
        </View>
        <View style={styles.shiftField}>
          <Text style={styles.shiftFieldLabel}>HOURS</Text>
          {shift.hoursPending ? (
            <Text style={styles.shiftFieldPending}>Recap needed</Text>
          ) : (
            <Text style={styles.shiftFieldValue}>{formatHours(shift.workedHours)}</Text>
          )}
        </View>
        <View style={styles.shiftField}>
          <Text style={styles.shiftFieldLabel}>RATE/HR</Text>
          <Text style={styles.shiftFieldValue}>{formatMoney(shift.rate)}</Text>
        </View>
        <View style={styles.shiftField}>
          <Text style={styles.shiftFieldLabel}>BONUS</Text>
          <Text style={styles.shiftFieldValue}>{formatMoney(shift.bonus)}</Text>
        </View>
        <View style={styles.shiftField}>
          <Text style={styles.shiftFieldLabel}>REIMB.</Text>
          {shift.reimbursementPending ? (
            <Text style={styles.shiftFieldPending}>Pending</Text>
          ) : (
            <Text style={styles.shiftFieldValue}>{formatMoney(shift.reimbursement)}</Text>
          )}
        </View>
        <View style={styles.shiftField}>
          <Text style={styles.shiftFieldLabel}>TAXABLE</Text>
          <Text style={styles.shiftFieldValue}>{formatMoney(shift.taxablePay)}</Text>
        </View>
      </View>
    </View>
  );
}

function CycleCard({
  cycle, expanded, onToggle, updatedAt,
}: {
  cycle: CycleReport;
  expanded: boolean;
  onToggle: () => void;
  updatedAt: Date | null;
}) {
  const s = cycle.summary;
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={onToggle} activeOpacity={0.7}>
        <View style={{ flex: 1 }}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cycleLabel}>{cycle.cycleLabel}</Text>
            {cycle.isCurrent && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>CURRENT</Text>
              </View>
            )}
          </View>
          {cycle.isCurrent && updatedAt && (
            <Text style={styles.updatedText}>Updated {formatUpdatedAt(updatedAt)} — pull to refresh</Text>
          )}
        </View>
        <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
      </TouchableOpacity>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>ASSIGNED</Text>
          <Text style={styles.statValue}>{formatHours(s.assignedHours)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>WORKED</Text>
          <Text style={styles.statValue}>{formatHours(s.workedHours)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>PAY RATE</Text>
          <Text style={styles.statValue}>{formatMoney(s.currentHourlyWage)}/hr</Text>
        </View>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>REIMB.</Text>
          <Text style={styles.statValue}>{formatMoney(s.reimbursement)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>BONUS</Text>
          <Text style={styles.statValue}>{formatMoney(s.bonus)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>TOTAL WAGE</Text>
          <Text style={styles.statValue}>{formatMoney(s.totalWage)}</Text>
        </View>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>TOTAL PAY FOR CYCLE</Text>
        <Text style={styles.totalValue}>{formatMoney(s.totalPayForCycle)}</Text>
      </View>
      <View style={styles.taxableRow}>
        <Text style={styles.taxableLabel}>Taxable Pay (excludes reimbursement)</Text>
        <Text style={styles.taxableValue}>{formatMoney(s.taxablePay)}</Text>
      </View>

      {expanded && (
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>Detailed Shift Breakdown</Text>
          {cycle.shifts.length === 0 ? (
            <View style={styles.emptyShifts}>
              <Text style={styles.emptyShiftsText}>No shifts found for this pay cycle.</Text>
            </View>
          ) : (
            cycle.shifts.map((shift) => <ShiftMiniCard key={shift.id} shift={shift} />)
          )}
        </View>
      )}
    </View>
  );
}

export default function PayReportsScreen() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [cycles, setCycles] = useState<CycleReport[]>([]);
  const [expandedCycleId, setExpandedCycleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const res = await fetchWithAuth('/worker/pay-reports');
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      const fetchedCycles: CycleReport[] = data.cycles || [];
      setEmployee(data.employee || null);
      setCycles(fetchedCycles);
      setUpdatedAt(new Date());
      // Default to the current cycle expanded (API returns it first) so a worker's
      // active-period earnings are visible immediately, without clobbering a choice the
      // worker already made on a manual refresh.
      setExpandedCycleId((prev) => prev ?? fetchedCycles[0]?.cycleId ?? null);
    } catch (e) {
      console.log('Failed fetching pay reports', e);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Pay Reports</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#6366F1" />
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>⚠️</Text>
          <Text style={styles.emptyTitle}>Couldn't load your pay reports</Text>
          <Text style={styles.emptyText}>Check your connection and try again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadData()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor="#6366F1" />}
        >
          {employee && (
            <Text style={styles.subtitle}>Last 3 pay cycles for {employee.name}</Text>
          )}
          {cycles.map((cycle) => (
            <CycleCard
              key={cycle.cycleId}
              cycle={cycle}
              expanded={expandedCycleId === cycle.cycleId}
              onToggle={() => setExpandedCycleId((prev) => (prev === cycle.cycleId ? null : cycle.cycleId))}
              updatedAt={updatedAt}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  backBtn: { padding: 4, minWidth: 60 },
  backText: { fontSize: 17, color: '#6366F1', fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  scrollContent: { padding: 16, paddingBottom: 40 },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 16 },

  emptyState: { alignItems: 'center', marginTop: 100, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 44, marginBottom: 14 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#374151', marginBottom: 6, textAlign: 'center' },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 20 },
  retryBtn: { backgroundColor: '#6366F1', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cycleLabel: { fontSize: 16, fontWeight: '800', color: '#111827' },
  badge: { backgroundColor: '#EEF2FF', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10 },
  badgeText: { color: '#6366F1', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  updatedText: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  chevron: { fontSize: 18, color: '#9CA3AF', paddingLeft: 8 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statBox: { flex: 1 },
  statLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 14, color: '#111827', fontWeight: '600' },

  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#ECFDF5', borderRadius: 10, padding: 12, marginTop: 8,
  },
  totalLabel: { fontSize: 11, fontWeight: '700', color: '#059669', letterSpacing: 0.5 },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#059669' },

  taxableRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 10, paddingHorizontal: 2,
  },
  taxableLabel: { fontSize: 12, color: '#6B7280' },
  taxableValue: { fontSize: 13, color: '#374151', fontWeight: '600' },

  breakdownSection: { marginTop: 16, borderTopWidth: 1, borderColor: '#F3F4F6', paddingTop: 14 },
  breakdownTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10 },

  emptyShifts: { padding: 20, alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 10 },
  emptyShiftsText: { color: '#9CA3AF', fontSize: 13 },

  shiftCard: {
    backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  shiftCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  shiftDate: { fontSize: 13, fontWeight: '700', color: '#111827' },
  shiftPay: { fontSize: 14, fontWeight: '800', color: '#111827' },
  shiftStore: { fontSize: 12, color: '#6B7280', marginBottom: 10 },

  shiftGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  shiftField: { width: '25%', marginBottom: 8, paddingRight: 4 },
  shiftFieldLabel: { fontSize: 9, color: '#9CA3AF', fontWeight: '700', letterSpacing: 0.3, marginBottom: 2 },
  shiftFieldValue: { fontSize: 12, color: '#374151', fontWeight: '600' },
  shiftFieldPending: { fontSize: 12, color: '#B45309', fontWeight: '600', fontStyle: 'italic' },
});
