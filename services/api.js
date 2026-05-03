// services/api.js — SDPS Mobile API Helper
// Tasks 5, 6, 7, 8: API integration, auth, CRUD, error handling

import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Replace with your computer's local IP when testing on device/emulator
// Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find your IP
const BASE_URL = 'http://192.168.100.165:8000/api';

const getToken = async () => await AsyncStorage.getItem('token');

// ─── AUTH ──────────────────────────────────────────────────────────────────

export const apiLogin = async (username, password) => {
  const res = await fetch(`${BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data; // { token, user_id, username, ... }
};

export const apiLogout = async () => {
  await AsyncStorage.removeItem('token');
};

// ─── GENERIC HELPERS ───────────────────────────────────────────────────────

export const apiGet = async (endpoint) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Task 8: Handle 401 Unauthorized
  if (res.status === 401) {
    await AsyncStorage.removeItem('token');
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
};

export const apiPost = async (endpoint, body) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    await AsyncStorage.removeItem('token');
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(errData) || `Error ${res.status}`);
  }
  return res.json();
};

export const apiPut = async (endpoint, body) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    await AsyncStorage.removeItem('token');
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
};

export const apiDelete = async (endpoint) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: { Authorization: `Token ${token}` },
  });

  if (res.status === 401) {
    await AsyncStorage.removeItem('token');
    throw new Error('UNAUTHORIZED');
  }

  return res.ok;
};
