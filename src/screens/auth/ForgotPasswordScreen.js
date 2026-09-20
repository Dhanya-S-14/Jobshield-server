import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { validateEmail, validatePassword } from '../../utils/helpers';
import { forgotPassword, resetPassword } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const ForgotPasswordScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim()) { setError('Email is required'); return; }
    if (!validateEmail(email.trim())) { setError('Invalid email address'); return; }
    setError('');
    setLoading(true);
    try {
      const data = await forgotPassword(email.trim());
      if (data.resetToken) {
        setResetToken(data.resetToken);
        Toast.show({ type: 'success', text1: 'Reset Token Generated', text2: 'Use the token to reset your password' });
        setStep('token');
      } else {
        Toast.show({ type: 'success', text1: 'Reset Link Sent', text2: 'Check your email for password reset instructions' });
        setSentText(data.message || 'Check your email');
        setStep('sent');
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!resetToken.trim()) { setError('Reset token is required'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    try {
      await resetPassword(resetToken.trim(), newPassword);
      Toast.show({ type: 'success', text1: 'Password Reset', text2: 'Your password has been updated. Login with your new password.' });
      await login(email.trim(), newPassword);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      setError(err.message);
      Toast.show({ type: 'error', text1: 'Reset Failed', text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  const [sentText, setSentText] = useState('');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.inputBg }]}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '20' }]}>
              <Ionicons name="lock-open-outline" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {step === 'email' ? 'Forgot Password?' : step === 'token' ? 'Reset Password' : 'Email Sent!'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {step === 'email'
                ? "Enter your email address and we'll send you a link to reset your password"
                : step === 'token'
                ? 'Enter the reset token and choose a new password'
                : sentText}
            </Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.card, shadowColor: colors.black }, shadows.lg]}>
            {step === 'email' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: error ? colors.error : colors.border }]}>
                    <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Enter your email"
                      placeholderTextColor={colors.textMuted}
                      value={email}
                      onChangeText={(t) => { setEmail(t); setError(''); }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
                </View>

                <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]} onPress={handleSend} disabled={loading}>
                  {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.sendButtonText}>Send Reset Link</Text>}
                </TouchableOpacity>
              </>
            )}

            {step === 'token' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Reset Token</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: error ? colors.error : colors.border }]}>
                    <Ionicons name="key-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Paste reset token"
                      placeholderTextColor={colors.textMuted}
                      value={resetToken}
                      onChangeText={(t) => { setResetToken(t); setError(''); }}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Enter new password"
                      placeholderTextColor={colors.textMuted}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Confirm new password"
                      placeholderTextColor={colors.textMuted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                {error ? <Text style={[styles.errorText, { color: colors.error, marginBottom: spacing.sm }]}>{error}</Text> : null}

                <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]} onPress={handleReset} disabled={loading}>
                  {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.sendButtonText}>Reset Password</Text>}
                </TouchableOpacity>
              </>
            )}

            {step === 'sent' && (
              <View style={styles.sentContainer}>
                <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                <Text style={[styles.sentText, { color: colors.textSecondary, textAlign: 'center' }]}>
                  Please check your email and follow the instructions to reset your password
                </Text>
                <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary, marginTop: spacing.lg }]} onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.sendButtonText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 'email' && (
              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backLink}>
                <Ionicons name="arrow-back" size={18} color={colors.primary} />
                <Text style={[styles.backLinkText, { color: colors.primary }]}> Back to Login</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: spacing.lg },
  backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: spacing.md },
  headerSection: { alignItems: 'center', marginVertical: spacing.xl },
  iconContainer: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: typography.xxl, fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center' },
  subtitle: { fontSize: typography.md, textAlign: 'center', lineHeight: 22, paddingHorizontal: spacing.md },
  formCard: { borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: 'transparent' },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: typography.sm, fontWeight: '600', marginBottom: spacing.xs, marginLeft: 2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, paddingVertical: 14, fontSize: typography.base },
  errorText: { fontSize: typography.xs, marginTop: 4, marginLeft: 2 },
  sendButton: { paddingVertical: 16, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  sendButtonText: { color: '#FFFFFF', fontSize: typography.base, fontWeight: '700' },
  sentContainer: { alignItems: 'center', paddingVertical: spacing.lg },
  sentText: { fontSize: typography.md, marginTop: spacing.sm, lineHeight: 22 },
  backLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  backLinkText: { fontSize: typography.md, fontWeight: '600' },
});

export default ForgotPasswordScreen;
