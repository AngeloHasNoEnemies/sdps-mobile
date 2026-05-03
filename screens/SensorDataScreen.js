// screens/SensorDataScreen.js — Task 5 & 7: READ sensor data from API
// Task 8: Loading, error, empty state handling

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, FlatList, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../theme';
import { apiGet, apiPut, apiDelete, apiPatch } from '../services/api';

const FILTERS = ['All', 'Active', 'Critical', 'Maintenance', 'Offline'];

export default function SensorDataScreen({ navigation, route }) {
  const [locations,    setLocations]    = useState([]);
  const [sensorData,   setSensorData]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  // Task 7: READ — fetch locations + latest sensor readings
  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [locs, sensors] = await Promise.all([
        apiGet('/locations/'),
        apiGet('/sensor-data/'),
      ]);
      setLocations(Array.isArray(locs) ? locs : (locs.results || []));
      setSensorData(Array.isArray(sensors) ? sensors : (sensors.results || []));
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Task 7: UPDATE location status
  const handleUpdateStatus = (loc) => {
    const nextStatus = loc.status === 'active' ? 'maintenance' : 'active';
    Alert.alert(
      'Update Status',
      `Change "${loc.name}" status to "${nextStatus}"?\n\nThis calls PUT /api/locations/${loc.id}/`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              await apiPut(`/locations/${loc.id}/`, {
                name: loc.name,
                address: loc.address,
                latitude: loc.latitude,
                longitude: loc.longitude,
                status: nextStatus,
              });
              setLocations(prev => prev.map(l => l.id === loc.id ? { ...l, status: nextStatus } : l));
              Alert.alert('Updated', `Status changed to "${nextStatus}".`);
            } catch (err) {
              Alert.alert('Error', `Update failed: ${err.message}`);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  // Task 8: Loading state
  if (loading) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Sensor Data</Text>
      </View>
      <View style={s.stateContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={s.stateText}>Fetching sensor readings from API...</Text>
      </View>
    </SafeAreaView>
  );

  // Task 8: Error & Unauthorized
  if (error) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Sensor Data</Text>
      </View>
      <View style={s.stateContainer}>
        <Ionicons
          name={error === 'UNAUTHORIZED' ? 'lock-closed' : 'cloud-offline-outline'}
          size={48}
          color={error === 'UNAUTHORIZED' ? COLORS.warning : COLORS.critical}
        />
        <Text style={s.stateTitle}>
          {error === 'UNAUTHORIZED' ? 'Session Expired' : 'Connection Failed'}
        </Text>
        <Text style={s.stateText}>
          {error === 'UNAUTHORIZED' ? 'Your token is invalid. Please log in again.' : error}
        </Text>
        {error === 'UNAUTHORIZED' ? (
          <TouchableOpacity style={[s.retryBtn, { backgroundColor: COLORS.warning }]} onPress={handleLogout}>
            <Text style={s.retryText}>Go to Login</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.retryBtn} onPress={fetchData}>
            <Ionicons name="refresh-outline" size={16} color="#fff" />
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );

  const filtered = locations.filter(l => {
    if (activeFilter === 'All') return true;
    return l.status === activeFilter.toLowerCase();
  });

  const onlineCount   = locations.filter(l => l.status !== 'offline').length;
  const critCount     = locations.filter(l => l.status === 'critical').length;
  const totalReadings = sensorData.length;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Sensor Data</Text>
        <View style={s.onlinePill}>
          <View style={s.onlineDot} />
          <Text style={s.onlineText}>{onlineCount}/{locations.length} Active</Text>
        </View>
      </View>

      {/* Summary Row */}
      <View style={s.summaryRow}>
        <View style={[s.summaryItem, { borderLeftColor: COLORS.primary }]}>
          <Ionicons name="location-outline" size={14} color={COLORS.primary} />
          <Text style={[s.summaryVal, { color: COLORS.primary }]}>{locations.length}</Text>
          <Text style={s.summaryLbl}>LOCATIONS</Text>
        </View>
        <View style={[s.summaryItem, { borderLeftColor: COLORS.normal }]}>
          <Ionicons name="hardware-chip-outline" size={14} color={COLORS.normal} />
          <Text style={[s.summaryVal, { color: COLORS.normal }]}>{totalReadings}</Text>
          <Text style={s.summaryLbl}>READINGS</Text>
        </View>
        <View style={[s.summaryItem, { borderLeftColor: COLORS.critical }]}>
          <Ionicons name="alert-circle-outline" size={14} color={COLORS.critical} />
          <Text style={[s.summaryVal, { color: COLORS.critical }]}>{critCount}</Text>
          <Text style={s.summaryLbl}>CRITICAL</Text>
        </View>
        <View style={[s.summaryItem, { borderLeftColor: COLORS.textMuted }]}>
          <Ionicons name="analytics-outline" size={14} color={COLORS.textMuted} />
          <Text style={[s.summaryVal, { color: COLORS.textSecondary }]}>{sensorData.length > 0 ? Math.round(sensorData.reduce((a,b) => a + (b.water_level || 0), 0) / sensorData.length) : 0}%</Text>
          <Text style={s.summaryLbl}>AVG WATER</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.filterChip, activeFilter === f && s.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[s.filterText, activeFilter === f && s.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Task 8: Empty state */}
      {locations.length === 0 ? (
        <View style={s.stateContainer}>
          <Ionicons name="hardware-chip-outline" size={48} color={COLORS.textMuted} />
          <Text style={s.stateTitle}>No Sensor Data</Text>
          <Text style={s.stateText}>No locations or sensor readings found in the API.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={s.emptyText}>No locations in this category.</Text>}
          renderItem={({ item: loc }) => {
            const statusColor = loc.status === 'critical' ? COLORS.critical
              : loc.status === 'maintenance' ? COLORS.warning
              : loc.status === 'offline' ? COLORS.textMuted
              : COLORS.normal;

            // Find latest sensor reading for this location
            const reading = sensorData.find(s => s.location === loc.id || s.location_id === loc.id);

            return (
              <View style={[s.locationCard, { borderLeftColor: statusColor }]}>
                <View style={s.locTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.locName}>{loc.name}</Text>
                    <Text style={s.locAddr}>{loc.address}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: statusColor + '18', borderColor: statusColor }]}>
                    <Text style={[s.statusBadgeText, { color: statusColor }]}>
                      {(loc.status || 'active').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {reading && (
                  <View style={s.readingRow}>
                    <View style={s.readingItem}>
                      <Ionicons name="water-outline" size={12} color={COLORS.primary} />
                      <Text style={s.readingLabel}>Water Level</Text>
                      <Text style={[s.readingValue, { color: COLORS.primary }]}>
                        {reading.water_level != null ? `${reading.water_level} cm` : 'N/A'}
                      </Text>
                    </View>
                    <View style={s.readingItem}>
                      <Ionicons name="speedometer-outline" size={12} color={COLORS.warning} />
                      <Text style={s.readingLabel}>Flow Rate</Text>
                      <Text style={[s.readingValue, { color: COLORS.warning }]}>
                        {reading.flow_rate != null ? `${reading.flow_rate} L/s` : 'N/A'}
                      </Text>
                    </View>
                  </View>
                )}

                {loc.latest_water_level != null && !reading && (
                  <View style={s.readingRow}>
                    <View style={s.readingItem}>
                      <Ionicons name="water-outline" size={12} color={COLORS.primary} />
                      <Text style={s.readingLabel}>Latest Water Level</Text>
                      <Text style={[s.readingValue, { color: COLORS.primary }]}>{loc.latest_water_level} cm</Text>
                    </View>
                  </View>
                )}

                {/* Task 7: UPDATE button */}
                <TouchableOpacity style={s.updateBtn} onPress={() => handleUpdateStatus(loc)}>
                  <Ionicons name="create-outline" size={13} color={COLORS.primary} />
                  <Text style={s.updateBtnText}>
                    Update Status → {loc.status === 'active' ? 'maintenance' : 'active'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.bg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  onlinePill:  { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.normalBg, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.normalBdr, paddingHorizontal: 10, paddingVertical: 4 },
  onlineDot:   { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.normal, marginRight: 5 },
  onlineText:  { fontSize: 11, fontWeight: '700', color: COLORS.normal },
  summaryRow:  { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summaryItem: { flex: 1, backgroundColor: COLORS.bg, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3, padding: 10, alignItems: 'center', marginHorizontal: 3 },
  summaryVal:  { fontSize: 16, fontWeight: '800', marginTop: 3 },
  summaryLbl:  { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.5, marginTop: 2 },
  filterRow:   { paddingHorizontal: 16, paddingVertical: 10 },
  filterChip:  { paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  filterText:  { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.primary },
  list:        { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  emptyText:   { textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 14 },
  locationCard:{ backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4, padding: 14, marginBottom: 10 },
  locTop:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  locName:     { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  locAddr:     { fontSize: 12, color: COLORS.textMuted },
  statusBadge: { borderRadius: RADIUS.full, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  readingRow:  { flexDirection: 'row', backgroundColor: COLORS.bg, borderRadius: RADIUS.sm, padding: 10, marginBottom: 10 },
  readingItem: { flex: 1, alignItems: 'center' },
  readingLabel:{ fontSize: 10, color: COLORS.textMuted, marginTop: 3, marginBottom: 2 },
  readingValue:{ fontSize: 14, fontWeight: '800' },
  updateBtn:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: RADIUS.sm, backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.border },
  updateBtnText: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginLeft: 6 },
  stateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  stateTitle:  { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginTop: 12, marginBottom: 8 },
  stateText:   { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  retryBtn:    { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 20, paddingVertical: 10, marginTop: 18 },
  retryText:   { fontSize: 14, fontWeight: '700', color: '#fff', marginLeft: 6 },
});
