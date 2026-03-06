import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, getLevel } from '../theme';
import StatusBadge from './StatusBadge';
import LevelBar from './LevelBar';
import CooldownTimer from './CooldownTimer';

function getOverall(sensor) {
  if (!sensor.online) return 'offline';
  const wL  = getLevel(sensor.waterLevel, sensor.waterWarningThreshold, sensor.waterCriticalThreshold);
  const waL = getLevel(sensor.wasteLevel, sensor.wasteWarningThreshold, sensor.wasteCriticalThreshold);
  if (wL === 'critical' || waL === 'critical') return 'critical';
  if (wL === 'warning'  || waL === 'warning')  return 'warning';
  if (sensor.alertCooldownSeconds > 0)          return 'cooldown';
  return 'normal';
}

function getAccent(overall) {
  if (overall === 'critical') return COLORS.critical;
  if (overall === 'warning')  return COLORS.warning;
  if (overall === 'cooldown') return COLORS.cooldown;
  if (overall === 'offline')  return COLORS.textMuted;
  return COLORS.primary;
}

export default function SensorCard({ sensor, compact = false, onPress }) {
  const wL      = getLevel(sensor.waterLevel, sensor.waterWarningThreshold, sensor.waterCriticalThreshold);
  const waL     = getLevel(sensor.wasteLevel, sensor.wasteWarningThreshold, sensor.wasteCriticalThreshold);
  const overall = getOverall(sensor);
  const accent  = getAccent(overall);

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { borderLeftColor: accent }]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <Text style={[styles.compactId, { color: accent }]}>{sensor.id}</Text>
        <View style={styles.compactInfo}>
          <Text style={styles.compactName}>{sensor.name}</Text>
          <Text style={styles.compactLoc}>{sensor.location}</Text>
        </View>
        <View style={styles.compactRight}>
          <View style={styles.compactMetrics}>
            <Text style={[
              styles.compactVal,
              wL === 'critical' ? { color: COLORS.critical } :
              wL === 'warning'  ? { color: COLORS.warning  } :
              { color: COLORS.primary }
            ]}>
              💧 {sensor.waterLevel}%
            </Text>
            <Text style={[
              styles.compactVal,
              waL === 'critical' ? { color: COLORS.critical } :
              waL === 'warning'  ? { color: COLORS.warning  } :
              { color: COLORS.textMuted }
            ]}>
              🗑 {sensor.wasteLevel}%
            </Text>
          </View>
          <StatusBadge level={overall} small />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: accent }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.idBadge, { backgroundColor: accent + '18' }]}>
          <Text style={[styles.idText, { color: accent }]}>{sensor.id}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.sensorName}>{sensor.name}</Text>
          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={11} color={COLORS.textMuted} />
            <Text style={styles.locText}>{sensor.location}</Text>
          </View>
        </View>
        <StatusBadge level={overall} />
      </View>

      <View style={styles.divider} />

      <LevelBar
        label="Water Level"
        value={sensor.waterLevel}
        warningThreshold={sensor.waterWarningThreshold}
        criticalThreshold={sensor.waterCriticalThreshold}
      />
      <LevelBar
        label="Waste Accumulation"
        value={sensor.wasteLevel}
        warningThreshold={sensor.wasteWarningThreshold}
        criticalThreshold={sensor.wasteCriticalThreshold}
      />

      {sensor.alertCooldownSeconds > 0 && (
        <CooldownTimer initialSeconds={sensor.alertCooldownSeconds} />
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons
            name="radio-outline"
            size={12}
            color={sensor.online ? COLORS.normal : COLORS.textMuted}
          />
          <Text style={[styles.footerText, { color: sensor.online ? COLORS.normal : COLORS.textMuted }]}>
            {sensor.online ? 'Online' : 'Offline'}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
          <Text style={styles.footerText}>{sensor.lastUpdated}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  idBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  idText:     { fontSize: 12, fontWeight: '800' },
  headerInfo: { flex: 1 },
  sensorName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  locRow:     { flexDirection: 'row', alignItems: 'center' },
  locText:    { fontSize: 11, color: COLORS.textMuted, marginLeft: 3 },
  divider:    { height: 1, backgroundColor: COLORS.border, marginBottom: 14 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 11, color: COLORS.textMuted, marginLeft: 5 },

  // Compact
  compactCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactId:      { fontSize: 11, fontWeight: '800', minWidth: 24, marginRight: 10 },
  compactInfo:    { flex: 1 },
  compactName:    { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 1 },
  compactLoc:     { fontSize: 10, color: COLORS.textMuted },
  compactRight:   { alignItems: 'flex-end' },
  compactMetrics: { flexDirection: 'row', marginBottom: 4 },
  compactVal:     { fontSize: 11, fontWeight: '700', marginLeft: 8 },
});
