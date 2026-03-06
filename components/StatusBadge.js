import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../theme';

const CONFIG = {
  critical: { label: 'CRITICAL', bg: COLORS.criticalBg, color: COLORS.critical, dot: COLORS.critical },
  warning:  { label: 'WARNING',  bg: COLORS.warningBg,  color: COLORS.warning,  dot: COLORS.warning  },
  normal:   { label: 'NORMAL',   bg: COLORS.normalBg,   color: COLORS.normal,   dot: COLORS.normal   },
  cooldown: { label: 'COOLDOWN', bg: COLORS.cooldownBg, color: COLORS.cooldown, dot: COLORS.cooldown },
  offline:  { label: 'OFFLINE',  bg: '#f1f5f9',         color: COLORS.textMuted, dot: COLORS.textMuted },
};

export default function StatusBadge({ level = 'normal', small = false }) {
  const c = CONFIG[level] || CONFIG.normal;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, small && styles.small]}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.label, { color: c.color }, small && styles.smallText]}>
        {c.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  small: { paddingHorizontal: 7, paddingVertical: 3 },
  dot:   { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  smallText: { fontSize: 9 },
});
