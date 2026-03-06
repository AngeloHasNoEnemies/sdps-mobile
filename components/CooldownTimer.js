import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../theme';

export default function CooldownTimer({ initialSeconds = 0, onExpire }) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => { setRemaining(initialSeconds); }, [initialSeconds]);

  useEffect(() => {
    if (remaining <= 0) { onExpire && onExpire(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  if (remaining <= 0) return null;

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const display = `${m}:${s.toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <Ionicons name="timer-outline" size={13} color={COLORS.cooldown} />
      <Text style={styles.label}>Alert Cooldown</Text>
      <Text style={styles.timer}>{display}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cooldownBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cooldownBdr,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  label: { fontSize: 11, color: COLORS.cooldown, fontWeight: '600', flex: 1, marginLeft: 8 },
  timer: { fontSize: 14, fontWeight: '800', color: COLORS.cooldown },
});
