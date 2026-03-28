import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../theme';

const LANGUAGES  = ['English', 'Filipino', 'Spanish'];
const TIMEZONES  = ['Asia/Manila (GMT+8)', 'Asia/Tokyo (GMT+9)', 'UTC (GMT+0)', 'US/Eastern (GMT-5)'];
const INTERVALS  = ['Every 5 seconds', 'Every 10 seconds', 'Every 30 seconds', 'Every 1 minute'];
const THEMES     = ['Light', 'Dark (Default)', 'System Default'];

function SectionHeader({ icon, title, tag }) {
  return (
    <View style={s.sectionHeader}>
      <Ionicons name={icon} size={16} color={COLORS.primary} />
      <Text style={s.sectionTitle}>{title}</Text>
      {tag && <View style={s.tag}><Text style={s.tagText}>{tag}</Text></View>}
    </View>
  );
}

function FieldLabel({ label }) {
  return <Text style={s.fieldLabel}>{label}</Text>;
}

function SelectRow({ value, options, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={s.selectBox}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.8}
      >
        <Text style={s.selectValue}>{value}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>
      {open && (
        <View style={s.dropdown}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[s.dropdownItem, opt === value && s.dropdownItemActive]}
              onPress={() => { onSelect(opt); setOpen(false); }}
            >
              <Text style={[s.dropdownText, opt === value && s.dropdownTextActive]}>
                {opt}
              </Text>
              {opt === value && (
                <Ionicons name="checkmark" size={14} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function ToggleRow({ icon, label, description, value, onToggle, danger }) {
  const color = danger ? COLORS.critical : COLORS.primary;
  return (
    <View style={s.toggleRow}>
      <View style={[s.toggleIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={14} color={color} />
      </View>
      <View style={s.toggleInfo}>
        <Text style={[s.toggleLabel, danger && { color: COLORS.critical }]}>{label}</Text>
        <Text style={s.toggleDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: danger ? COLORS.critical + '88' : COLORS.primary + '88' }}
        thumbColor={value ? (danger ? COLORS.critical : COLORS.primary) : COLORS.textMuted}
        ios_backgroundColor={COLORS.border}
      />
    </View>
  );
}

function SaveButton({ label, onPress }) {
  return (
    <TouchableOpacity style={s.saveBtn} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name="save-outline" size={15} color="#fff" />
      <Text style={s.saveBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  // User Profile
  const [displayName, setDisplayName] = useState('Admin');
  const [email,       setEmail]       = useState('admin@sdps.local');
  const [language,    setLanguage]    = useState('English');
  const [timezone,    setTimezone]    = useState('Asia/Manila (GMT+8)');

  // Notification Preferences
  const [inAppNotif,    setInAppNotif]    = useState(true);
  const [emailAlerts,   setEmailAlerts]   = useState(false);
  const [soundEffects,  setSoundEffects]  = useState(true);

  // System Preferences
  const [interval,     setInterval]     = useState('Every 10 seconds');
  const [theme,        setTheme]        = useState('Dark (Default)');
  const [maintenance,  setMaintenance]  = useState(false);

  const handleSaveProfile = () => {
    if (!displayName.trim() || !email.trim()) {
      Alert.alert('Error', 'Display name and email cannot be empty.');
      return;
    }
    Alert.alert('Profile Saved', 'Your profile has been updated successfully.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => navigation.replace('Login'),
        },
      ],
    );
  };

  const handleSaveSystem = () => {
    Alert.alert(
      'System Preferences Saved',
      maintenance
        ? 'Maintenance mode is now ACTIVE. Live alerts are disabled.'
        : 'System preferences updated successfully.',
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Settings</Text>
          <Text style={s.headerSub}>User & System Preferences</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={15} color={COLORS.critical} />
          <Text style={s.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── User Profile ─────────────────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="person-outline" title="User Profile" tag="Account" />
          <View style={s.divider} />

          <View style={s.row}>
            <View style={s.col}>
              <FieldLabel label="DISPLAY NAME" />
              <View style={s.inputWrap}>
                <TextInput
                  style={s.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>
            <View style={s.col}>
              <FieldLabel label="EMAIL ADDRESS" />
              <View style={s.inputWrap}>
                <TextInput
                  style={s.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>
          </View>

          <View style={s.row}>
            <View style={s.col}>
              <FieldLabel label="LANGUAGE" />
              <SelectRow value={language} options={LANGUAGES} onSelect={setLanguage} />
            </View>
            <View style={s.col}>
              <FieldLabel label="TIMEZONE" />
              <SelectRow value={timezone} options={TIMEZONES} onSelect={setTimezone} />
            </View>
          </View>

          <SaveButton label="Save Profile" onPress={handleSaveProfile} />
        </View>

        {/* ── Notification Preferences ─────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="notifications-outline" title="Notification Preferences" tag="Alerts" />
          <View style={s.divider} />

          <ToggleRow
            icon="phone-portrait-outline"
            label="Enable In-App Notifications"
            description="Show alert banners inside the dashboard"
            value={inAppNotif}
            onToggle={setInAppNotif}
          />
          <View style={s.toggleDivider} />
          <ToggleRow
            icon="mail-outline"
            label="Email Alerts"
            description="Send critical alerts to your email address"
            value={emailAlerts}
            onToggle={setEmailAlerts}
          />
          <View style={s.toggleDivider} />
          <ToggleRow
            icon="volume-high-outline"
            label="Alert Sound Effects"
            description="Play a sound when new alerts arrive"
            value={soundEffects}
            onToggle={setSoundEffects}
          />
        </View>

        {/* ── System Preferences ───────────────────────── */}
        <View style={s.card}>
          <SectionHeader icon="settings-outline" title="System Preferences" tag="Admin Only" />
          <View style={s.divider} />

          <View style={s.row}>
            <View style={s.col}>
              <FieldLabel label="DASHBOARD REFRESH INTERVAL" />
              <SelectRow value={interval} options={INTERVALS} onSelect={setInterval} />
            </View>
            <View style={s.col}>
              <FieldLabel label="UI THEME" />
              <SelectRow value={theme} options={THEMES} onSelect={setTheme} />
            </View>
          </View>

          {/* Maintenance Mode */}
          <View style={[s.maintenanceBox, maintenance && s.maintenanceBoxActive]}>
            <ToggleRow
              icon="construct-outline"
              label="Maintenance Mode"
              description="Puts system in maintenance — shown in topbar and sidebar. Disables live alerts."
              value={maintenance}
              onToggle={setMaintenance}
              danger
            />
          </View>

          <SaveButton label="Save System Preferences" onPress={handleSaveSystem} />
        </View>

        {/* Footer */}
        <Text style={s.footer}>SDPS Mobile v1.0 · IT323 Capstone</Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  headerSub:   { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.criticalBg,
    borderWidth: 1, borderColor: COLORS.criticalBdr,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  logoutText: { fontSize: 13, fontWeight: '700', color: COLORS.critical, marginLeft: 5 },
  scroll: { flex: 1, padding: 16 },

  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  tag: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },

  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 14 },

  row: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  col: { flex: 1 },

  fieldLabel: {
    fontSize: 10, fontWeight: '700',
    color: COLORS.textSecondary, letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputWrap: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 42,
    justifyContent: 'center',
  },
  input: { fontSize: 13, color: COLORS.textPrimary },

  selectBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12, height: 42,
  },
  selectValue: { fontSize: 13, color: COLORS.textPrimary, flex: 1 },
  dropdown: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    marginTop: 4,
    overflow: 'hidden',
    zIndex: 10,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  dropdownItemActive: { backgroundColor: COLORS.primaryLight },
  dropdownText:       { fontSize: 13, color: COLORS.textSecondary },
  dropdownTextActive: { color: COLORS.primary, fontWeight: '700' },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10,
  },
  toggleIcon: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  toggleInfo:  { flex: 1, marginRight: 10 },
  toggleLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  toggleDesc:  { fontSize: 11, color: COLORS.textMuted, lineHeight: 15 },
  toggleDivider: { height: 1, backgroundColor: COLORS.border },

  maintenanceBox: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 12, marginBottom: 16,
  },
  maintenanceBoxActive: {
    backgroundColor: COLORS.criticalBg,
    borderColor: COLORS.criticalBdr,
  },

  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md, height: 44,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#fff', marginLeft: 6 },

  footer: {
    textAlign: 'center', color: COLORS.textMuted,
    fontSize: 11, marginTop: 4, marginBottom: 8,
  },
});