import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SENSORS, getLevel } from '../theme';
import SensorCard from '../components/SensorCard';
import StatusBadge from '../components/StatusBadge';

const FILTERS = ['All', 'Critical', 'Warning', 'Normal', 'Cooldown'];

function getOverall(sensor) {
  if (!sensor.online) return 'offline';
  const wL  = getLevel(sensor.waterLevel, sensor.waterWarningThreshold, sensor.waterCriticalThreshold);
  const waL = getLevel(sensor.wasteLevel, sensor.wasteWarningThreshold, sensor.wasteCriticalThreshold);
  if (wL === 'critical' || waL === 'critical') return 'critical';
  if (wL === 'warning'  || waL === 'warning')  return 'warning';
  if (sensor.alertCooldownSeconds > 0)          return 'cooldown';
  return 'normal';
}

export default function SensorDataScreen({ route }) {
  const focusedId = route?.params?.sensorId ?? null;
  const [activeFilter, setActiveFilter] = useState('All');
  const [expanded, setExpanded] = useState(focusedId ? { [focusedId]: true } : {});

  const toggleExpand = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const filtered = SENSORS.filter(s => {
    if (activeFilter === 'All')      return true;
    if (activeFilter === 'Cooldown') return s.alertCooldownSeconds > 0;
    return getOverall(s) === activeFilter.toLowerCase();
  });

  const totalWater  = Math.round(SENSORS.reduce((a, s) => a + s.waterLevel,  0) / SENSORS.length);
  const totalWaste  = Math.round(SENSORS.reduce((a, s) => a + s.wasteLevel,  0) / SENSORS.length);
  const onlineCount = SENSORS.filter(s => s.online).length;
  const critCount   = SENSORS.filter(s => getOverall(s) === 'critical').length;
  const cdCount     = SENSORS.filter(s => s.alertCooldownSeconds > 0).length;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Sensor Data</Text>
        <View style={s.onlinePill}>
          <View style={s.onlineDot} />
          <Text style={s.onlineText}>{onlineCount}/{SENSORS.length} Online</Text>
        </View>
      </View>

      {/* Summary Row */}
      <View style={s.summaryRow}>
        <View style={[s.summaryItem, { borderLeftColor: COLORS.primary }]}>
          <Ionicons name="water-outline" size={14} color={COLORS.primary} />
          <Text style={[s.summaryVal, { color: COLORS.primary }]}>{totalWater}%</Text>
          <Text style={s.summaryLbl}>AVG WATER</Text>
        </View>
        <View style={[s.summaryItem, { borderLeftColor: COLORS.textMuted }]}>
          <Ionicons name="trash-outline" size={14} color={COLORS.textMuted} />
          <Text style={[s.summaryVal, { color: COLORS.textSecondary }]}>{totalWaste}%</Text>
          <Text style={s.summaryLbl}>AVG WASTE</Text>
        </View>
        <View style={[s.summaryItem, { borderLeftColor: COLORS.critical }]}>
          <Ionicons name="alert-circle-outline" size={14} color={COLORS.critical} />
          <Text style={[s.summaryVal, { color: COLORS.critical }]}>{critCount}</Text>
          <Text style={s.summaryLbl}>CRITICAL</Text>
        </View>
        <View style={[s.summaryItem, { borderLeftColor: COLORS.cooldown }]}>
          <Ionicons name="timer-outline" size={14} color={COLORS.cooldown} />
          <Text style={[s.summaryVal, { color: COLORS.cooldown }]}>{cdCount}</Text>
          <Text style={s.summaryLbl}>COOLDOWN</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={s.filterWrapper}>
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
      </View>

      {/* Sensor List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={s.emptyText}>No sensors in this category.</Text>}
        renderItem={({ item: sensor }) => {
          const isExpanded = expanded[sensor.id] ?? (sensor.id === focusedId);
          const overall    = getOverall(sensor);
          const accentColor =
            overall === 'critical' ? COLORS.critical :
            overall === 'warning'  ? COLORS.warning  :
            overall === 'cooldown' ? COLORS.cooldown  :
            overall === 'offline'  ? COLORS.textMuted :
            COLORS.primary;

          if (isExpanded) {
            return (
              <SensorCard
                sensor={sensor}
                compact={false}
                onPress={() => toggleExpand(sensor.id)}
              />
            );
          }

          const wL  = getLevel(sensor.waterLevel, sensor.waterWarningThreshold, sensor.waterCriticalThreshold);
          const waL = getLevel(sensor.wasteLevel, sensor.wasteWarningThreshold, sensor.wasteCriticalThreshold);

          return (
            <TouchableOpacity
              style={[s.collapsedRow, { borderLeftColor: accentColor }]}
              onPress={() => toggleExpand(sensor.id)}
              activeOpacity={0.75}
            >
              <View style={[s.collapsedId, { backgroundColor: accentColor + '18' }]}>
                <Text style={[s.collapsedIdText, { color: accentColor }]}>{sensor.id}</Text>
              </View>
              <View style={s.collapsedInfo}>
                <Text style={s.collapsedName}>{sensor.name}</Text>
                <Text style={s.collapsedLoc}>{sensor.location}</Text>
              </View>
              <View style={s.collapsedRight}>
                <View style={s.collapsedMetrics}>
                  <Text style={[
                    s.metricPill,
                    wL === 'critical' ? { color: COLORS.critical, backgroundColor: COLORS.criticalBg } :
                    wL === 'warning'  ? { color: COLORS.warning,  backgroundColor: COLORS.warningBg  } :
                    { color: COLORS.primary, backgroundColor: COLORS.primaryLight },
                  ]}>
                    💧 {sensor.waterLevel}%
                  </Text>
                  <Text style={[
                    s.metricPill,
                    waL === 'critical' ? { color: COLORS.critical, backgroundColor: COLORS.criticalBg } :
                    waL === 'warning'  ? { color: COLORS.warning,  backgroundColor: COLORS.warningBg  } :
                    { color: COLORS.textSecondary, backgroundColor: COLORS.bg },
                  ]}>
                    🗑 {sensor.wasteLevel}%
                  </Text>
                </View>
                <StatusBadge level={overall} small />
              </View>
              <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  onlinePill:  {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.normalBg, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.normalBdr,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  onlineDot:  { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.normal, marginRight: 5 },
  onlineText: { fontSize: 11, fontWeight: '700', color: COLORS.normal },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  summaryItem: {
    flex: 1, backgroundColor: COLORS.bg, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3,
    padding: 10, alignItems: 'center', marginHorizontal: 3,
  },
  summaryVal:  { fontSize: 16, fontWeight: '800', marginTop: 3 },
  summaryLbl:  { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.5, marginTop: 2 },
  filterWrapper: {
    height: 50,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterRow:   { paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, marginRight: 8,
    borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  filterText:       { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.primary },
  list:      { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 14 },
  collapsedRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3,
    padding: 12, marginBottom: 8,
  },
  collapsedId:      { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  collapsedIdText:  { fontSize: 11, fontWeight: '800' },
  collapsedInfo:    { flex: 1 },
  collapsedName:    { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  collapsedLoc:     { fontSize: 10, color: COLORS.textMuted },
  collapsedRight:   { alignItems: 'flex-end' },
  collapsedMetrics: { flexDirection: 'row', marginBottom: 4 },
  metricPill:       { fontSize: 10, fontWeight: '700', paddingHorizontal: 7, paddingVertical: 2, borderRadius: RADIUS.full, marginLeft: 4 },
});