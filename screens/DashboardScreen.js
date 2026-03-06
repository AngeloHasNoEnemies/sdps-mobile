import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SENSORS, getLevel } from '../theme';
import SensorCard from '../components/SensorCard';
import StatusBadge from '../components/StatusBadge';

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
  wrap: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 3,
  },
  value: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  label: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.6, textAlign: 'center', marginTop: 2 },
});

export default function DashboardScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1400);
  };

  const criticalCount = SENSORS.filter(s => {
    const w  = getLevel(s.waterLevel, s.waterWarningThreshold, s.waterCriticalThreshold);
    const wa = getLevel(s.wasteLevel, s.wasteWarningThreshold, s.wasteCriticalThreshold);
    return w === 'critical' || wa === 'critical';
  }).length;

  const warningCount = SENSORS.filter(s => {
    const w  = getLevel(s.waterLevel, s.waterWarningThreshold, s.waterCriticalThreshold);
    const wa = getLevel(s.wasteLevel, s.wasteWarningThreshold, s.wasteCriticalThreshold);
    const overall = (w === 'critical' || wa === 'critical') ? 'critical'
      : (w === 'warning' || wa === 'warning') ? 'warning' : 'normal';
    return overall === 'warning';
  }).length;

  const cooldownCount = SENSORS.filter(s => s.alertCooldownSeconds > 0).length;
  const onlineCount   = SENSORS.filter(s => s.online).length;
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
        <TouchableOpacity style={s.alertBtn} onPress={() => navigation.navigate('Alerts')}>
          <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} />
          {criticalCount > 0 && (
            <View style={s.alertDot}>
              <Text style={s.alertDotText}>{criticalCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Status Banner */}
        <View style={[s.banner, { backgroundColor: bc.bg, borderColor: bc.border }]}>
          <Ionicons
            name={systemLevel === 'critical' ? 'alert-circle' : systemLevel === 'warning' ? 'warning' : 'checkmark-circle'}
            size={22} color={bc.text}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[s.bannerTitle, { color: bc.text }]}>
              {systemLevel === 'critical' ? 'CRITICAL — Immediate Action Required'
               : systemLevel === 'warning' ? 'WARNING — Elevated Water/Waste Levels'
               : 'All Systems Normal'}
            </Text>
            <Text style={s.bannerSub}>{onlineCount}/{SENSORS.length} sensors online · Updated just now</Text>
          </View>
          <StatusBadge level={systemLevel} small />
        </View>

        {/* Stat Tiles */}
        <View style={s.tileRow}>
          <StatTile icon="alert-circle-outline" label="CRITICAL"  value={criticalCount}  color={COLORS.critical} />
          <StatTile icon="warning-outline"       label="WARNING"   value={warningCount}   color={COLORS.warning}  />
          <StatTile icon="timer-outline"         label="COOLDOWN"  value={cooldownCount}  color={COLORS.cooldown} />
          <StatTile icon="radio-outline"         label="ONLINE"    value={onlineCount}    color={COLORS.normal}   />
        </View>

        {/* Sensor Overview */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>SENSOR OVERVIEW</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SensorData')}>
            <Text style={s.seeAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        {SENSORS.map(sensor => (
          <SensorCard
            key={sensor.id}
            sensor={sensor}
            compact
            onPress={() => navigation.navigate('SensorData', { sensorId: sensor.id })}
          />
        ))}

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
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerSub:   { fontSize: 10, color: COLORS.primary, fontWeight: '700', letterSpacing: 0.8, marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  alertBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  alertDot: {
    position: 'absolute', top: 6, right: 6,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: COLORS.critical,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.bgCard,
  },
  alertDotText: { fontSize: 8, fontWeight: '800', color: '#fff' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  banner: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: RADIUS.lg, borderWidth: 1,
    padding: 14, marginTop: 16, marginBottom: 14,
  },
  bannerTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  bannerSub:   { fontSize: 11, color: COLORS.textMuted },
  tileRow:       { flexDirection: 'row', marginBottom: 20, marginHorizontal: -3 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },
  seeAll:       { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  quickBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, padding: 14,
  },
  quickBtnText: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginLeft: 12 },
});
