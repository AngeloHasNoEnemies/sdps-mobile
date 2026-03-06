import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../theme';

export default function LoginScreen({ navigation }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState(null);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Main');
    }, 1200);
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={s.logoArea}>
            <View style={s.ring3} />
            <View style={s.ring2} />
            <View style={s.ring1} />
            <View style={s.logoIcon}>
              <Ionicons name="water" size={36} color="#ffffff" />
            </View>
          </View>

          <Text style={s.title}>SDPS</Text>
          <Text style={s.subtitle}>Smart Drainage Protection System</Text>

          {/* Form */}
          <View style={s.form}>
            <Text style={s.formTitle}>Welcome Back</Text>
            <Text style={s.formSub}>Sign in to monitor your drainage system</Text>

            <Text style={s.fieldLabel}>EMAIL ADDRESS</Text>
            <View style={[s.inputWrap, focused === 'email' && s.inputFocused]}>
              <Ionicons
                name="mail-outline" size={16}
                color={focused === 'email' ? COLORS.primary : COLORS.textMuted}
              />
              <TextInput
                style={s.input}
                placeholder="admin@sdps.io"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </View>

            <Text style={s.fieldLabel}>PASSWORD</Text>
            <View style={[s.inputWrap, focused === 'pw' && s.inputFocused]}>
              <Ionicons
                name="lock-closed-outline" size={16}
                color={focused === 'pw' ? COLORS.primary : COLORS.textMuted}
              />
              <TextInput
                style={s.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                autoCapitalize="none"
                onFocus={() => setFocused('pw')}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                <Ionicons
                  name={showPw ? 'eye-outline' : 'eye-off-outline'}
                  size={16} color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.forgotBtn}>
              <Text style={s.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.loginBtn, loading && { backgroundColor: COLORS.primaryDim }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <Text style={s.loginBtnText}>Signing in...</Text>
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={18} color="#ffffff" />
                  <Text style={s.loginBtnText}>Sign In</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text style={s.footNote}>SDPS Mobile v1.0 · IT323 Capstone</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flexGrow: 1, paddingHorizontal: 28, justifyContent: 'center', paddingVertical: 40 },
  logoArea: {
    alignSelf: 'center', width: 110, height: 110,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  ring3: { position: 'absolute', width: 110, height: 110, borderRadius: 55, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  ring2: { position: 'absolute', width: 82,  height: 82,  borderRadius: 41, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)' },
  ring1: { position: 'absolute', width: 60,  height: 60,  borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)' },
  logoIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  title:    { fontSize: 32, fontWeight: '800', color: '#ffffff', textAlign: 'center', letterSpacing: 5, marginBottom: 6 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', textAlign: 'center', letterSpacing: 0.5, marginBottom: 36 },
  form: {
    backgroundColor: '#ffffff', borderRadius: RADIUS.xl, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 8,
  },
  formTitle:  { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  formSub:    { fontSize: 13, color: COLORS.textMuted, marginBottom: 22 },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 7 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, height: 50, marginBottom: 14,
  },
  inputFocused: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  input: { flex: 1, fontSize: 14, color: COLORS.textPrimary, marginLeft: 10 },
  forgotBtn:  { alignSelf: 'flex-end', marginBottom: 18, marginTop: -6 },
  forgotText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  loginBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  loginBtnText: { fontSize: 15, fontWeight: '700', color: '#ffffff', marginLeft: 8, letterSpacing: 0.5 },
  footNote: { textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 28 },
});
