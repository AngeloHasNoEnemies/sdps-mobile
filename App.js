import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SENSORS, getLevel } from './theme';

import LoginScreen      from './screens/LoginScreen';
import DashboardScreen  from './screens/DashboardScreen';
import AlertsScreen     from './screens/AlertsScreen';
import SensorDataScreen from './screens/SensorDataScreen';
import SettingsScreen   from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function getAlertCount() {
  let n = 0;
  SENSORS.forEach(s => {
    if (getLevel(s.waterLevel, s.waterWarningThreshold, s.waterCriticalThreshold) !== 'normal') n++;
    if (getLevel(s.wasteLevel, s.wasteWarningThreshold, s.wasteCriticalThreshold) !== 'normal') n++;
  });
  return n;
}

function MainTabs() {
  const alertCount = getAlertCount();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 66,
        },
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard:  focused ? 'grid'          : 'grid-outline',
            Alerts:     focused ? 'notifications' : 'notifications-outline',
            SensorData: focused ? 'hardware-chip' : 'hardware-chip-outline',
            Settings:   focused ? 'settings'      : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarBadge: route.name === 'Alerts' && alertCount > 0 ? alertCount : undefined,
        tabBarBadgeStyle: {
          backgroundColor: COLORS.critical,
          fontSize: 9,
          minWidth: 16,
          height: 16,
        },
      })}
    >
      <Tab.Screen name="Dashboard"  component={DashboardScreen} />
      <Tab.Screen name="Alerts"     component={AlertsScreen} />
      <Tab.Screen
        name="SensorData"
        component={SensorDataScreen}
        options={{ tabBarLabel: 'Sensors' }}
      />
      <Tab.Screen name="Settings"   component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main"  component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}