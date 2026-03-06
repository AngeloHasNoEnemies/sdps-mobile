// SDPS Mobile — Design Tokens
// Blue water theme: light #f0f7ff base, white cards, #0077b6 primary blue

export const COLORS = {
  bg:           '#f0f7ff',
  bgCard:       '#ffffff',
  bgInput:      '#f8f9fa',
  border:       '#e0f0ff',
  primary:      '#0077b6',
  primaryDim:   '#0096c7',
  primaryLight: '#dbeafe',
  textPrimary:  '#202124',
  textSecondary:'#5f6368',
  textMuted:    '#9aa0a6',
  critical:     '#ef4444',
  criticalBg:   '#fee2e2',
  criticalBdr:  '#fca5a5',
  warning:      '#f59e0b',
  warningBg:    '#fef3c7',
  warningBdr:   '#fcd34d',
  normal:       '#10b981',
  normalBg:     '#d1fae5',
  normalBdr:    '#6ee7b7',
  cooldown:     '#7c3aed',
  cooldownBg:   '#ede9fe',
  cooldownBdr:  '#c4b5fd',
  white:        '#ffffff',
};

export const RADIUS = {
  sm: 8, md: 12, lg: 16, xl: 20, full: 999,
};

export const SENSORS = [
  {
    id: 'S1', name: 'Sensor Node S1', location: 'Purok 1 — Main Canal',
    waterLevel: 78, waterWarningThreshold: 50, waterCriticalThreshold: 70,
    wasteLevel: 65, wasteWarningThreshold: 40, wasteCriticalThreshold: 60,
    alertCooldownSeconds: 0, lastUpdated: 'Just now', online: true,
  },
  {
    id: 'S2', name: 'Sensor Node S2', location: 'Purok 2 — Side Canal',
    waterLevel: 42, waterWarningThreshold: 50, waterCriticalThreshold: 70,
    wasteLevel: 28, wasteWarningThreshold: 40, wasteCriticalThreshold: 60,
    alertCooldownSeconds: 0, lastUpdated: '2 min ago', online: true,
  },
  {
    id: 'S3', name: 'Sensor Node S3', location: 'Purok 3 — Outlet',
    waterLevel: 55, waterWarningThreshold: 50, waterCriticalThreshold: 70,
    wasteLevel: 47, wasteWarningThreshold: 40, wasteCriticalThreshold: 60,
    alertCooldownSeconds: 180, lastUpdated: '1 min ago', online: true,
  },
  {
    id: 'S4', name: 'Sensor Node S4', location: 'Purok 4 — Retention Basin',
    waterLevel: 21, waterWarningThreshold: 50, waterCriticalThreshold: 70,
    wasteLevel: 15, wasteWarningThreshold: 40, wasteCriticalThreshold: 60,
    alertCooldownSeconds: 0, lastUpdated: '3 min ago', online: true,
  },
  {
    id: 'S5', name: 'Sensor Node S5', location: 'Purok 5 — Junction',
    waterLevel: 88, waterWarningThreshold: 50, waterCriticalThreshold: 70,
    wasteLevel: 74, wasteWarningThreshold: 40, wasteCriticalThreshold: 60,
    alertCooldownSeconds: 420, lastUpdated: 'Just now', online: true,
  },
  {
    id: 'S6', name: 'Sensor Node S6', location: 'Purok 6 — Tributary',
    waterLevel: 33, waterWarningThreshold: 50, waterCriticalThreshold: 70,
    wasteLevel: 38, wasteWarningThreshold: 40, wasteCriticalThreshold: 60,
    alertCooldownSeconds: 0, lastUpdated: '5 min ago', online: false,
  },
];

export function getLevel(value, warn, crit) {
  if (value >= crit) return 'critical';
  if (value >= warn) return 'warning';
  return 'normal';
}

export function formatCooldown(seconds) {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
