// screens/AlertsScreen.js — Task 7: Full CRUD (Create, Read, Delete alerts)
// Task 8: Loading, error, empty, unauthorized handling

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  FlatList, ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../theme';
import { apiGet, apiPost, apiDelete } from '../services/api';

const FILTERS = ['All', 'Critical', 'High', 'Medium', 'Low'];

const ALERT_TYPES = [
  { label: 'Flood',       value: 'flood'       },
  { label: 'Blockage',    value: 'blockage'     },
  { label: 'Sensor Fault',value: 'sensor_fault' },
  { label: 'Maintenance', value: 'maintenance'  },
];

const SEVERITIES = [
  { label: 'Low',      value: 'low'      },
  { label: 'Medium',   value: 'medium'   },
  { label: 'High',     value: 'high'     },
  { label: 'Critical', value: 'critical' },
];

export default function AlertsScreen({ navigation }) {
  const [alerts,        setAlerts]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [activeFilter,  setActiveFilter]  = useState('All');
  const [showModal,     setShowModal]     = useState(false);
  const [creating,      setCreating]      = useState(false);

  // Create Alert form state — matches exact API fields from OPTIONS response
  const [newMessage,    setNewMessage]    = useState('');
  const [newLocationId, setNewLocationId] = useState('');
  const [newAlertType,  setNewAlertType]  = useState('flood');
  const [newSeverity,   setNewSeverity]   = useState('medium');

  // Task 7: READ — fetch alerts from API
  const fetchAlerts = useCallback(async () => {
    setError(null);
    try {
      const data = await apiGet('/alerts/');
      setAlerts(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // Task 7: CREATE — POST /api/alerts/ with correct fields
  const handleCreate = async () => {
    if (!newMessage.trim()) {
      Alert.alert('Validation Error', 'Please enter a message.');
      return;
    }
    if (!newLocationId.trim()) {
      Alert.alert('Validation Error', 'Please enter a Location ID.');
      return;
    }
    const locId = parseInt(newLocationId.trim());
    if (isNaN(locId)) {
      Alert.alert('Validation Error', 'Location ID must be a number.');
      return;
    }

    setCreating(true);
    try {
      await apiPost('/alerts/', {
        message:    newMessage.trim(),
        location:   locId,       // integer ID — required
        alert_type: newAlertType, // "flood" | "blockage" | "sensor_fault" | "maintenance"
        severity:   newSeverity,  // "low" | "medium" | "high" | "critical"
      });
      setShowModal(false);
      setNewMessage('');
      setNewLocationId('');
      setNewAlertType('flood');
      setNewSeverity('medium');
      fetchAlerts();
      Alert.alert('Success', 'Alert created successfully (201 Created).');
    } catch (err) {
      Alert.alert('Error', `Failed to create alert: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Task 7: DELETE — DELETE /api/alerts/{id}/
  const handleDelete = (alertId) => {
    Alert.alert(
      'Delete Alert',
      'Remove this alert from the system?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await apiDelete(`/alerts/${alertId}/`);
              setAlerts(prev => prev.filter(a => a.id !== alertId));
            } catch (err) {
              Alert.alert('Error', `Could not delete: ${err.message}`);
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
        <Text style={s.headerTitle}>Alerts</Text>
      </View>
      <View style={s.stateContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={s.stateText}>Loading alerts from API...</Text>
      </View>
    </SafeAreaView>
  );

  // Task 8: Error & Unauthorized
  if (error) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Alerts</Text>
      </View>
      <View style={s.stateContainer}>
        <Ionicons
          name={error === 'UNAUTHORIZED' ? 'lock-closed' : 'cloud-offline-outline'}
          size={48}
          color={error === 'UNAUTHORIZED' ? COLORS.warning : COLORS.critical}
        />
        <Text style={s.stateTitle}>
          {error === 'UNAUTHORIZED' ? 'Unauthorized Access' : 'Failed to Load'}
        </Text>
        <Text style={s.stateText}>
          {error === 'UNAUTHORIZED'
            ? 'Your session expired. Please log in again.'
            : 'Could not connect to the API. Check your server IP.'}
        </Text>
        {error === 'UNAUTHORIZED' ? (
          <TouchableOpacity style={[s.retryBtn, { backgroundColor: COLORS.warning }]} onPress={handleLogout}>
            <Text style={s.retryText}>Go to Login</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.retryBtn} onPress={fetchAlerts}>
            <Ionicons name="refresh-outline" size={16} color="#fff" />
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );

  const severityColor = (sev) => {
    if (sev === 'critical') return COLORS.critical;
    if (sev === 'high')     return '#f97316';
    if (sev === 'medium')   return COLORS.warning;
    return COLORS.normal;
  };
  const severityBg = (sev) => {
    if (sev === 'critical') return COLORS.criticalBg;
    if (sev === 'high')     return '#ffedd5';
    if (sev === 'medium')   return COLORS.warningBg;
    return COLORS.normalBg;
  };
  const severityBdr = (sev) => {
    if (sev === 'critical') return COLORS.criticalBdr;
    if (sev === 'high')     return '#fdba74';
    if (sev === 'medium')   return COLORS.warningBdr;
    return COLORS.normalBdr;
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount     = alerts.filter(a => a.severity === 'high').length;

  const filtered = alerts.filter(a => {
    if (activeFilter === 'All')      return true;
    if (activeFilter === 'Critical') return a.severity === 'critical';
    if (activeFilter === 'High')     return a.severity === 'high';
    if (activeFilter === 'Medium')   return a.severity === 'medium';
    if (activeFilter === 'Low')      return a.severity === 'low';
    return true;
  });

  const renderAlert = ({ item: alert }) => {
    const sev    = alert.severity || 'medium';
    const color  = severityColor(sev);
    const bg     = severityBg(sev);
    const border = severityBdr(sev);

    return (
      <View style={[s.alertCard, { backgroundColor: bg, borderColor: border }]}>
        <View style={[s.accentBar, { backgroundColor: color }]} />
        <View style={s.alertBody}>
          {/* Top row */}
          <View style={s.alertTopRow}>
            <View style={[s.alertIconWrap, { backgroundColor: color + '18' }]}>
              <Ionicons name="notifications" size={14} color={color} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={s.alertSensor}>{alert.location_name || `Location #${alert.location}`}</Text>
              <Text style={s.alertLoc}>
                {alert.alert_type?.replace('_', ' ').toUpperCase()} · ID: {alert.id}
              </Text>
            </View>
            <View style={[s.levelBadge, { backgroundColor: bg, borderColor: border }]}>
              <Text style={[s.levelBadgeText, { color }]}>{sev.toUpperCase()}</Text>
            </View>
          </View>

          {/* Message */}
          <Text style={[s.alertMessage, { color }]}>
            {alert.message || 'No description'}
          </Text>

          {/* Footer */}
          <View style={s.alertFooter}>
            <Ionicons name="time-outline" size={11} color={COLORS.textMuted} />
            <Text style={s.alertTime}>
              {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'Just now'}
            </Text>
            {/* Task 7: DELETE */}
            <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(alert.id)}>
              <Ionicons name="trash-outline" size={13} color={COLORS.critical} />
              <Text style={s.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Alerts</Text>
        <View style={s.headerBadges}>
          {criticalCount > 0 && (
            <View style={[s.headerBadge, { backgroundColor: COLORS.criticalBg, borderColor: COLORS.criticalBdr }]}>
              <Text style={[s.headerBadgeText, { color: COLORS.critical }]}>{criticalCount} Critical</Text>
            </View>
          )}
          {/* Task 7: CREATE button */}
          <TouchableOpacity style={s.createBtn} onPress={() => setShowModal(true)}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={s.createBtnText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Task 8: Empty state */}
      {alerts.length === 0 ? (
        <View style={s.stateContainer}>
          <Ionicons name="checkmark-circle" size={56} color={COLORS.normal} />
          <Text style={s.stateTitle}>No Active Alerts</Text>
          <Text style={s.stateText}>All drainage sensors are within normal thresholds.</Text>
        </View>
      ) : (
        <>
          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow} style={s.filterScrollView}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f}
                style={[s.filterChip, activeFilter === f && s.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[s.filterText, activeFilter === f && s.filterTextActive]}>
                  {f}
                  {f === 'Critical' && criticalCount > 0 ? ` (${criticalCount})` : ''}
                  {f === 'High'     && highCount     > 0 ? ` (${highCount})`     : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filtered}
            keyExtractor={item => String(item.id)}
            renderItem={renderAlert}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={s.emptyFilter}>No alerts for this filter.</Text>}
          />
        </>
      )}

      {/* Task 7: CREATE Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Create New Alert</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Location ID — required integer */}
            <Text style={s.fieldLabel}>LOCATION ID (required)</Text>
            <TextInput
              style={s.modalInput}
              placeholder="e.g. 1  (find via GET /api/locations/)"
              placeholderTextColor={COLORS.textMuted}
              value={newLocationId}
              onChangeText={setNewLocationId}
              keyboardType="numeric"
            />

            {/* Message */}
            <Text style={s.fieldLabel}>MESSAGE (required)</Text>
            <TextInput
              style={[s.modalInput, { height: 70, textAlignVertical: 'top', paddingTop: 10 }]}
              placeholder="Describe the alert..."
              placeholderTextColor={COLORS.textMuted}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />

            {/* Alert Type */}
            <Text style={s.fieldLabel}>ALERT TYPE</Text>
            <View style={s.chipRow}>
              {ALERT_TYPES.map(t => (
                <TouchableOpacity
                  key={t.value}
                  style={[s.chip, newAlertType === t.value && s.chipActive]}
                  onPress={() => setNewAlertType(t.value)}
                >
                  <Text style={[s.chipText, newAlertType === t.value && s.chipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Severity */}
            <Text style={s.fieldLabel}>SEVERITY</Text>
            <View style={s.chipRow}>
              {SEVERITIES.map(sv => (
                <TouchableOpacity
                  key={sv.value}
                  style={[s.chip, newSeverity === sv.value && {
                    backgroundColor: severityBg(sv.value),
                    borderColor:     severityColor(sv.value),
                  }]}
                  onPress={() => setNewSeverity(sv.value)}
                >
                  <Text style={[s.chipText, newSeverity === sv.value && { color: severityColor(sv.value) }]}>
                    {sv.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[s.submitBtn, creating && { opacity: 0.7 }]}
              onPress={handleCreate}
              disabled={creating}
            >
              {creating
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="send-outline" size={16} color="#fff" />}
              <Text style={s.submitBtnText}>
                {creating ? 'Sending...' : 'POST to /api/alerts/'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.bg },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle:  { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, flex: 1 },
  headerBadges: { flexDirection: 'row', alignItems: 'center' },
  headerBadge:  { borderRadius: RADIUS.full, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8 },
  headerBadgeText: { fontSize: 10, fontWeight: '800' },
  createBtn:    { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 6 },
  createBtnText:{ fontSize: 12, fontWeight: '700', color: '#fff', marginLeft: 4 },
  filterScrollView: { flexGrow: 0, flexShrink: 0},
  filterRow:    { paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center'},
  filterChip:   { paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border},
  filterChipActive:  { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  filterText:        { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  filterTextActive:  { color: COLORS.primary },
  list:         { paddingHorizontal: 16, paddingBottom: 24 },
  alertCard:    { borderRadius: RADIUS.lg, borderWidth: 1, flexDirection: 'row', overflow: 'hidden', marginBottom: 10 },
  accentBar:    { width: 4 },
  alertBody:    { flex: 1, padding: 14 },
  alertTopRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  alertIconWrap:{ width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  alertSensor:  { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 1 },
  alertLoc:     { fontSize: 10, color: COLORS.textMuted },
  levelBadge:   { borderRadius: RADIUS.full, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  levelBadgeText: { fontSize: 9, fontWeight: '800' },
  alertMessage: { fontSize: 12, fontWeight: '600', marginBottom: 10, lineHeight: 17 },
  alertFooter:  { flexDirection: 'row', alignItems: 'center' },
  alertTime:    { fontSize: 10, color: COLORS.textMuted, flex: 1, marginLeft: 4 },
  deleteBtn:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, backgroundColor: COLORS.criticalBg, borderWidth: 1, borderColor: COLORS.criticalBdr },
  deleteBtnText:{ fontSize: 10, fontWeight: '700', color: COLORS.critical, marginLeft: 3 },
  stateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  stateTitle:   { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginTop: 12, marginBottom: 8 },
  stateText:    { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  retryBtn:     { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 20, paddingVertical: 10, marginTop: 18 },
  retryText:    { fontSize: 14, fontWeight: '700', color: '#fff', marginLeft: 6 },
  emptyFilter:  { textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:    { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:   { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  fieldLabel:   { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 7 },
  modalInput:   { backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary, marginBottom: 14 },
  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  chip:         { paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg, marginRight: 8, marginBottom: 8 },
  chipActive:   { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  chipText:     { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.primary },
  submitBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 14, marginTop: 4 },
  submitBtnText:{ fontSize: 14, fontWeight: '700', color: '#fff', marginLeft: 8 },
});