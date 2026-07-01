import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { router } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://krut-6zbd.vercel.app/api";

type Step = 'email' | 'otp' | 'password' | 'done';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async () => {
    if (!email) { setError('Please enter your email.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setInfo('If an account exists, a 6-digit code was sent to that address.');
        setOtp('');
        setStep('otp');
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError('Please enter the 6-digit code.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetToken(data.resetToken);
        setStep('password');
      } else {
        setError(data.error || 'Invalid or expired code.');
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) { setError('Please fill in both fields.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('done');
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Kruto Tastes</Text>
        <Text style={styles.subtitle}>Reset your password</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {step === 'email' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRequestCode} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Code</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()} style={styles.linkBtn}>
              <Text style={styles.linkText}>Back to Login</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'otp' && (
          <>
            {info ? <Text style={styles.info}>{info}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="6-digit code"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={t => setOtp(t.replace(/\D/g, ''))}
            />
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleVerifyOtp} disabled={loading || otp.length !== 6}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Code</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setStep('email'); setError(''); }} style={styles.linkBtn}>
              <Text style={styles.linkText}>Resend code</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'password' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor="#999"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleResetPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Set New Password</Text>}
            </TouchableOpacity>
          </>
        )}

        {step === 'done' && (
          <>
            <Text style={styles.success}>Your password has been reset. You can now sign in with your new password.</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.replace('/login')}>
              <Text style={styles.buttonText}>Back to Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 16, color: '#111827' },
  button: { backgroundColor: '#0F172A', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#EF4444', marginBottom: 16, textAlign: 'center', fontWeight: '500' },
  info: { color: '#6B7280', marginBottom: 16, textAlign: 'center', fontSize: 14 },
  success: { color: '#059669', marginBottom: 16, textAlign: 'center', fontWeight: '500', lineHeight: 22 },
  linkBtn: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#6366F1', fontSize: 14, fontWeight: '500' },
});
