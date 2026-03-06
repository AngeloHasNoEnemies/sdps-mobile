import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SENSORS, getLevel, formatCooldown } from '../theme';
import StatusBadge from '../components/StatusBadge';

function buildAlerts(sensors) {
  const alerts = [];
  sensors.forEach(s => {
    const wL  = getLevel(s.waterLevel, s.waterWarningThreshold, s.waterCriticalThreshold);
    const waL = getLevel(s.wasteLevel, s.wasteWarningThreshold, s.wasteCriticalThreshold);

    if (wL !== 'normal') alerts.push({
      id: `${s.id}-w`, sensorId: s.id, sensorName: s.name,
      location: s.location, type: 'water', level: wL,
      message: `Water level ${wL.toUpperCase()} at ${s.waterLevel}% — exceeds ${wL === 'critical' ? s.waterCriticalThreshold : s.waterWarningThreshold}% threshold`,
      value: s.waterLevel,
      threshold: wL === 'critical' ? s.waterCriticalThreshold : s.waterWarningThreshold,
      cooldown: s.alertCooldownSeconds, time: s.lastUpdated,
    });

    if (waL !== 'normal') alerts.push({
      id: `${s.id}-wa`, sensorId: s.id, sensorName: s.name,
      location: s.location, type: 'waste', level: waL,
      message: `Waste accumulation ${waL.toUpperCase()} at ${s.wasteLevel}% — exceeds ${waL === 'critical' ? s.wasteCriticalThreshold : s.wasteWarningThreshold}% threshold`,
      value: s.wasteLevel,
      threshold: waL === 'critical' ? s.wasteCriticalThreshold : s.wasteWarningThreshold,
      cooldown: s.alertCooldownSeconds, time: s.lastUpdated,
    });
  });
  return alerts.sort((a, b) => a.level === b.level ? 0 : a.level === 'critical' ? -1 : 1);
}

const FILTERS = ['All', 'Critical', 'Warning', 'Water', 'Waste'];

export default function AlertsScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const allAlerts     = buildAlerts(SENSORS);
  const criticalCount = allAlerts.filter(a => a.level === 'critical').length;
  const warningCount  = allAlerts.filter(a => a.level === 'warning').length;

  const filtered = allAlerts.filter(a => {
    if (activeFilter === 'All')      return true;
    if (activeFilter === 'Critical') return a.level === 'critical';
    if (activeFilter === 'Warning')  return a.level === 'warning';
    if (activeFilter === 'Water')    return a.type  === 'water';
    if (activeFilter === 'Waste')    return a.type  === 'waste';
    return true;
  });

  const renderAlert = ({ item: alert }) => {
    const isC    = alert.level === 'critical';
    const color  = isC ? COLORS.critical : COLORS.warning;
    const bg     = isC ? COLORS.criticalBg : COLORS.warningBg;
    const border = isC ? COLORS.criticalBdr : COLORS.warningBdr;

    return (
      <TouchableOpacity
        style={[s.alertCard, { backgroundColor: bg, borderColor: border }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('SensorData', { sensorId: alert.sensorId })}
      >
        <View style={[s.accentBar, { backgroundColor: color }]} />
        <View style={s.alertBody}>
          {/* Top row */}
          <View style={s.alertTopRow}>
            <View style={[s.alertIconWrap, { backgroundColor: color + '18' }]}>
              <Ionicons name={alert.type === 'water' ? 'water' : 'trash'} size={14} color={color} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={s.alertSensor}>{alert.sensorName}</Text>
              <Text style={s.alertLoc}>{alert.location}</Text>
            </View>
            <StatusBadge level={alert.level} small />
          </View>

          {/* Message */}
          <Text style={[s.alertMessage, { color }]}>{alert.message}</Text>

          {/* Value bar */}
          <View style={s.alertValueRow}>
            <View style={s.alertBarTrack}>
              <View style={[s.alertBarFill, { width: `${alert.value}%`, backgroundColor: color }]} />
            </View>
            <Text style={[s.alertPct, { color }]}>{alert.value}%</Text>
          </View>

          {/* Footer */}
          <View style={s.alertFooter}>
            <View style={s.alertFooterLeft}>
              <Ionicons name="time-outline" size={11} color={COLORS.textMuted} />
              <Text style={[s.alertTime, { marginLeft: 4 }]}>{alert.time}</Text>
            </View>
            {alert.cooldown > 0 && (
              <View style={s.cooldownPill}>
                <Ionicons name="timer-outline" size={11} color={COLORS.cooldown} />
                <Text style={[s.cooldownText, { marginLeft: 4 }]}>
                  Cooldown: {formatCooldown(alert.cooldown)}
                </Text>
              </View>
            )}
            <View style={s.viewSensor}>
              <Text style={s.viewSensorText}>View Sensor </Text>
              <Ionicons name="chevron-forward" size={11} color={COLORS.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
          {warningCount > 0 && (
            <View style={[s.headerBadge, { backgroundColor: COLORS.warningBg, borderColor: COLORS.warningBdr, marginLeft: 6 }]}>
              <Text style={[s.headerBadgeText, { color: COLORS.warning }]}>{warningCount} Warning</Text>
            </View>
          )}
        </View>
      </View>

      {allAlerts.length === 0 ? (
        <View style={s.emptyState}>
          <Ionicons name="checkmark-circle" size={56} color={COLORS.normal} />
          <Text style={s.emptyTitle}>No Active Alerts</Text>
          <Text style={s.emptySub}>All drainage sensors are within normal thresholds.</Text>
        </View>
      ) : (
        <>
          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f}
                style={[s.filterChip, activeFilter === f && s.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[s.filterText, activeFilter === f && s.filterTextActive]}>
                  {f}
                  {f === 'Critical' && criticalCount > 0 ? ` (${criticalCount})` : ''}
                  {f === 'Warning'  && warningCount  > 0 ? ` (${warningCount})`  : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={renderAlert}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={s.emptyFilter}>No alerts for this filter.</Text>}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle:     { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, flex: 1 },
  headerBadges:    { flexDirection: 'row' },
  headerBadge:     { borderRadius: RADIUS.full, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  headerBadgeText: { fontSize: 10, fontWeight: '800' },
  filterRow: { paddingHorizontal: 16, paddingVertical: 12 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, marginRight: 8,
    borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  filterText:       { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.primary },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  alertCard: {
    borderRadius: RADIUS.lg, borderWidth: 1,
    flexDirection: 'row', overflow: 'hidden', marginBottom: 10,
  },
  accentBar:      { width: 4 },
  alertBody:      { flex: 1, padding: 14 },
  alertTopRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  alertIconWrap:  { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  alertSensor:    { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 1 },
  alertLoc:       { fontSize: 10, color: COLORS.textMuted },
  alertMessage:   { fontSize: 12, fontWeight: '600', marginBottom: 10, lineHeight: 17 },
  alertValueRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  alertBarTrack:  { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden', marginRight: 10 },
  alertBarFill:   { height: '100%', borderRadius: 3 },
  alertPct:       { fontSize: 14, fontWeight: '800', minWidth: 40 },
  alertFooter:    { flexDirection: 'row', alignItems: 'center' },
  alertFooterLeft:{ flexDirection: 'row', alignItems: 'center', flex: 1 },
  alertTime:      { fontSize: 10, color: COLORS.textMuted },
  cooldownPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.cooldownBg, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.cooldownBdr,
    paddingHorizontal: 8, paddingVertical: 2, marginRight: 8,
  },
  cooldownText:   { fontSize: 10, color: COLORS.cooldown, fontWeight: '700' },
  viewSensor:     { flexDirection: 'row', alignItems: 'center' },
  viewSensorText: { fontSize: 10, color: COLORS.primary, fontWeight: '700' },
  emptyState:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle:  { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginTop: 12 },
  emptySub:    { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyFilter: { textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 14 },
});
