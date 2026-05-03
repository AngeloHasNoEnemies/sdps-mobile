// screens/DashboardScreen.js — Task 5: Mobile UI displaying API data
// Task 8: Loading state, error handling, empty state, unauthorized handling

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../theme';
import { apiGet } from '../services/api';

function StatTile({ icon, label, value, color }) {
  return (
    <View style={[tile.wrap, { borderTopColor: color }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[tile.value, { color }]}>{value}</Text>
      <Text style={tile.label}>{label}</Text>
    </View>
  );
}

const tile = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: 12, alignItems: 'center', borderTopWidth: 3, borderWidth: 1, borderColor: COLORS.border, marginHorizontal: 3 },
  value: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  label: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.6, textAlign: 'center', marginTop: 2 },
});

// Task 8: Reusable loading component
function LoadingState() {
  return (
    <View style={s.stateContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={s.stateText}>Loading dashboard data...</Text>
      <Text style={s.stateSubText}>Fetching from SDPS API</Text>
    </View>
  );
}

// Task 8: Reusable error component
function ErrorState({ message, onRetry, onLogout }) {
  const isUnauthorized = message === 'UNAUTHORIZED';
  return (
    <View style={s.stateContainer}>
      <View style={[s.stateIcon, { backgroundColor: isUnauthorized ? COLORS.warningBg : COLORS.criticalBg }]}>
        <Ionicons
          name={isUnauthorized ? 'lock-closed' : 'cloud-offline-outline'}
          size={36}
          color={isUnauthorized ? COLORS.warning : COLORS.critical}
        />
      </View>
      <Text style={s.stateTitle}>
        {isUnauthorized ? 'Unauthorized Access' : 'Connection Error'}
      </Text>
      <Text style={s.stateText}>
        {isUnauthorized
          ? 'Your session has expired. Please log in again.'
          : message || 'Failed to load data. Check your network connection.'}
      </Text>
      {isUnauthorized ? (
        <TouchableOpacity style={[s.retryBtn, { backgroundColor: COLORS.warning }]} onPress={onLogout}>
          <Ionicons name="log-in-outline" size={16} color="#fff" />
          <Text style={s.retryText}>Go to Login</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={s.retryBtn} onPress={onRetry}>
          <Ionicons name="refresh-outline" size={16} color="#fff" />
          <Text style={s.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Task 8: Reusable empty state component
function EmptyState() {
  return (
    <View style={s.stateContainer}>
      <View style={[s.stateIcon, { backgroundColor: COLORS.normalBg }]}>
        <Ionicons name="checkmark-circle" size={36} color={COLORS.normal} />
      </View>
      <Text style={s.stateTitle}>No Locations Found</Text>
      <Text style={s.stateText}>No drainage locations have been added yet. Add locations via the SDPS admin panel.</Text>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  // Task 8: All three state variables required by the error-handling pattern
  const [locations,  setLocations]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Task 5 & 7: Fetch locations from API (READ)
  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const data = await apiGet('/locations/');
      setLocations(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  // Task 8: Loading state
  if (loading) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <View>
          <Text style={s.headerSub}>Smart Drainage Protection System</Text>
          <Text style={s.headerTitle}>Dashboard</Text>
        </View>
      </View>
      <LoadingState />
    </SafeAreaView>
  );

  // Task 8: Error + Unauthorized handling
  if (error) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <View>
          <Text style={s.headerSub}>Smart Drainage Protection System</Text>
          <Text style={s.headerTitle}>Dashboard</Text>
        </View>
      </View>
      <ErrorState message={error} onRetry={fetchData} onLogout={handleLogout} />
    </SafeAreaView>
  );

  // Derived stats from API data
  const criticalCount = locations.filter(l => l.status === 'critical').length;
  const warningCount  = locations.filter(l => l.status === 'warning').length;
  const activeCount   = locations.filter(l => l.status === 'active').length;
  const totalAlerts   = locations.reduce((sum, l) => sum + (l.active_alerts_count || 0), 0);
  const systemLevel   = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'normal';

  const bannerColors = {
    critical: { bg: COLORS.criticalBg, border: COLORS.criticalBdr, text: COLORS.critical },
    warning:  { bg: COLORS.warningBg,  border: COLORS.warningBdr,  text: COLORS.warning  },
    normal:   { bg: COLORS.normalBg,   border: COLORS.normalBdr,   text: COLORS.normal   },
  };
  const bc = bannerColors[systemLevel];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerSub}>Smart Drainage Protection System</Text>
          <Text style={s.headerTitle}>Dashboard</Text>
        </View>
        <View style={s.headerRight}>
          <View style={s.apiBadge}>
            <View style={s.apiBadgeDot} />
            <Text style={s.apiBadgeText}>API</Text>
          </View>
          <TouchableOpacity style={s.alertBtn} onPress={() => navigation.navigate('Alerts')}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} />
            {totalAlerts > 0 && (
              <View style={s.alertDot}>
                <Text style={s.alertDotText}>{totalAlerts}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Task 8: Empty state */}
        {locations.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Status Banner */}
            <View style={[s.banner, { backgroundColor: bc.bg, borderColor: bc.border }]}>
              <Ionicons
                name={systemLevel === 'critical' ? 'alert-circle' : systemLevel === 'warning' ? 'warning' : 'checkmark-circle'}
                size={22} color={bc.text}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[s.bannerTitle, { color: bc.text }]}>
                  {systemLevel === 'critical' ? 'CRITICAL — Immediate Action Required'
                   : systemLevel === 'warning' ? 'WARNING — Some Locations Need Attention'
                   : 'All Systems Normal'}
                </Text>
                <Text style={s.bannerSub}>{locations.length} locations loaded from API</Text>
              </View>
            </View>

            {/* Stat Tiles — Task 5: derived from real API data */}
            <View style={s.tileRow}>
              <StatTile icon="alert-circle-outline" label="CRITICAL"  value={criticalCount}       color={COLORS.critical} />
              <StatTile icon="warning-outline"       label="WARNING"   value={warningCount}        color={COLORS.warning}  />
              <StatTile icon="radio-outline"         label="ACTIVE"    value={activeCount}         color={COLORS.normal}   />
              <StatTile icon="notifications-outline" label="ALERTS"    value={totalAlerts}         color={COLORS.primary}  />
            </View>

            {/* Location Cards — Task 5: real API data displayed in mobile UI */}
            <Text style={s.sectionTitle}>DRAINAGE LOCATIONS</Text>
            {locations.map(loc => (
              <View key={loc.id} style={s.locationCard}>
                <View style={[s.locationAccent, {
                  backgroundColor: loc.status === 'critical' ? COLORS.critical
                    : loc.status === 'warning' ? COLORS.warning
                    : COLORS.normal,
                }]} />
                <View style={s.locationBody}>
                  <View style={s.locationTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.locationName}>{loc.name}</Text>
                      <Text style={s.locationAddr}>{loc.address}</Text>
                    </View>
                    <View style={[s.statusPill, {
                      backgroundColor: loc.status === 'critical' ? COLORS.criticalBg
                        : loc.status === 'warning' ? COLORS.warningBg : COLORS.normalBg,
                      borderColor: loc.status === 'critical' ? COLORS.criticalBdr
                        : loc.status === 'warning' ? COLORS.warningBdr : COLORS.normalBdr,
                    }]}>
                      <Text style={[s.statusPillText, {
                        color: loc.status === 'critical' ? COLORS.critical
                          : loc.status === 'warning' ? COLORS.warning : COLORS.normal,
                      }]}>
                        {(loc.status || 'active').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={s.locationMeta}>
                    {loc.latest_water_level != null && (
                      <View style={s.metaItem}>
                        <Ionicons name="water-outline" size={12} color={COLORS.primary} />
                        <Text style={s.metaText}>Water: {loc.latest_water_level} cm</Text>
                      </View>
                    )}
                    <View style={s.metaItem}>
                      <Ionicons name="notifications-outline" size={12} color={COLORS.warning} />
                      <Text style={s.metaText}>Alerts: {loc.active_alerts_count || 0}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Quick Links */}
        <TouchableOpacity style={s.quickBtn} onPress={() => navigation.navigate('Alerts')}>
          <Ionicons name="notifications" size={20} color={COLORS.warning} />
          <Text style={s.quickBtnText}>View Alerts</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={[s.quickBtn, { marginTop: 8 }]} onPress={() => navigation.navigate('SensorData')}>
          <Ionicons name="hardware-chip" size={20} color={COLORS.primary} />
          <Text style={s.quickBtnText}>Sensor Data</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerSub:   { fontSize: 10, color: COLORS.primary, fontWeight: '700', letterSpacing: 0.8, marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  apiBadge:    { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.normalBg, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.normalBdr, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8 },
  apiBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.normal, marginRight: 4 },
  apiBadgeText:{ fontSize: 10, fontWeight: '700', color: COLORS.normal },
  alertBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  alertDot:    { position: 'absolute', top: 6, right: 6, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.critical, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.bgCard },
  alertDotText:{ fontSize: 8, fontWeight: '800', color: '#fff' },
  scroll:      { flex: 1, paddingHorizontal: 16 },
  banner:      { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, borderWidth: 1, padding: 14, marginTop: 16, marginBottom: 14 },
  bannerTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  bannerSub:   { fontSize: 11, color: COLORS.textMuted },
  tileRow:     { flexDirection: 'row', marginBottom: 20, marginHorizontal: -3 },
  sectionTitle:{ fontSize: 11, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 10 },
  locationCard:{ flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: 10 },
  locationAccent: { width: 4 },
  locationBody:{ flex: 1, padding: 14 },
  locationTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  locationName:{ fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  locationAddr:{ fontSize: 12, color: COLORS.textMuted },
  statusPill:  { borderRadius: RADIUS.full, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  statusPillText: { fontSize: 10, fontWeight: '800' },
  locationMeta:{ flexDirection: 'row' },
  metaItem:    { flexDirection: 'row', alignItems: 'center', marginRight: 14 },
  metaText:    { fontSize: 11, color: COLORS.textSecondary, marginLeft: 4 },
  quickBtn:    { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: 14 },
  quickBtnText:{ flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginLeft: 12 },
  // States
  stateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  stateIcon:      { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  stateTitle:     { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  stateText:      { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  stateSubText:   { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  retryBtn:       { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 20, paddingVertical: 10, marginTop: 18 },
  retryText:      { fontSize: 14, fontWeight: '700', color: '#fff', marginLeft: 6 },
});
