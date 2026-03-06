import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

function getBarColor(value, warn, crit) {
  if (value >= crit) return COLORS.critical;
  if (value >= warn) return COLORS.warning;
  return COLORS.primary;
}

export default function LevelBar({ value, warningThreshold, criticalThreshold, label, unit = '%' }) {
  const color   = getBarColor(value, warningThreshold, criticalThreshold);
  const pct     = Math.min(Math.max(value, 0), 100);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{value}{unit}</Text>
      </View>

      {/* Bar track */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>

      {/* Threshold labels */}
      <View style={styles.thresholdRow}>
        <Text style={styles.thresholdLabel}>
          <Text style={{ color: COLORS.warning }}>▲ </Text>
          Warn {warningThreshold}{unit}
        </Text>
        <Text style={styles.thresholdLabel}>
          <Text style={{ color: COLORS.critical }}>▲ </Text>
          Crit {criticalThreshold}{unit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { marginBottom: 14 },
  labelRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label:       { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  value:       { fontSize: 16, fontWeight: '800' },
  track:       { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  fill:        { height: '100%', borderRadius: 4 },
  thresholdRow:{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  thresholdLabel: { fontSize: 10, color: COLORS.textMuted },
});
