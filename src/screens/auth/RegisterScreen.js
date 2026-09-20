import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { validateEmail, validatePassword } from '../../utils/helpers';

const RegisterScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = t('nameRequired');
    if (!email.trim()) errs.email = t('emailRequired');
    else if (!validateEmail(email.trim())) errs.email = t('invalidEmail');
    if (!password) errs.password = t('passwordRequired');
    else {
      const pwCheck = validatePassword(password);
      if (!pwCheck.valid) errs.password = pwCheck.message;
    }
    if (password !== confirmPassword) errs.confirmPassword = t('passwordsDoNotMatch');
    if (!acceptTerms) errs.terms = t('mustAcceptTerms');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
    } catch (err) {
      Toast.show({ type: 'error', text1: t('registrationFailed'), text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.headerSection}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primaryLight + '20' }]}>
              <Ionicons name="shield-checkmark" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>JobShield</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>{t('tagline')}</Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.card, shadowColor: colors.black }, shadows.lg]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>{t('signUp')}</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('fullName')}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: errors.name ? colors.error : colors.border }]}>
                <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: colors.text }]} placeholder="Enter your name" placeholderTextColor={colors.textMuted} value={name} onChangeText={(t) => { setName(t); if (errors.name) setErrors({ ...errors, name: null }); }} autoCapitalize="words" />
              </View>
              {errors.name && <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('email')}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: errors.email ? colors.error : colors.border }]}>
                <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: colors.text }]} placeholder="Enter your email" placeholderTextColor={colors.textMuted} value={email} onChangeText={(t) => { setEmail(t); if (errors.email) setErrors({ ...errors, email: null }); }} keyboardType="email-address" autoCapitalize="none" />
              </View>
              {errors.email && <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('password')}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: errors.password ? colors.error : colors.border }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: colors.text }]} placeholder="Create a password" placeholderTextColor={colors.textMuted} value={password} onChangeText={(t) => { setPassword(t); if (errors.password) setErrors({ ...errors, password: null }); }} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('confirmPassword')}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: errors.confirmPassword ? colors.error : colors.border }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: colors.text }]} placeholder="Confirm your password" placeholderTextColor={colors.textMuted} value={confirmPassword} onChangeText={(t) => { setConfirmPassword(t); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null }); }} secureTextEntry={!showPassword} />
              </View>
              {errors.confirmPassword && <Text style={[styles.errorText, { color: colors.error }]}>{errors.confirmPassword}</Text>}
            </View>

            <TouchableOpacity style={styles.termsRow} onPress={() => setAcceptTerms(!acceptTerms)}>
              <View style={[styles.checkbox, { backgroundColor: acceptTerms ? colors.primary : 'transparent', borderColor: acceptTerms ? colors.primary : colors.border }]}>
                {acceptTerms && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                {t('acceptTerms')} <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('termsOfService')}</Text> {t('and')} <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('privacyPolicy')}</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms && <Text style={[styles.errorText, { color: colors.error, marginBottom: spacing.sm }]}>{errors.terms}</Text>}

            <TouchableOpacity style={[styles.registerButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]} onPress={handleRegister} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>{t('createAccount')}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>{t('alreadyHaveAccount')} </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.footerLink, { color: colors.primary }]}>{t('login')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  headerSection: { alignItems: 'center', marginBottom: spacing.lg },
  logoContainer: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  appName: { fontSize: typography.xxxl, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: typography.md, marginTop: spacing.xs },
  formCard: { borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: 'transparent' },
  formTitle: { fontSize: typography.xxl, fontWeight: '700', marginBottom: spacing.md },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: typography.sm, fontWeight: '600', marginBottom: spacing.xs, marginLeft: 2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, paddingVertical: 14, fontSize: typography.base },
  eyeButton: { padding: spacing.xs },
  errorText: { fontSize: typography.xs, marginTop: 4, marginLeft: 2 },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  termsText: { fontSize: typography.sm, flex: 1, lineHeight: 20 },
  registerButton: { paddingVertical: 16, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  registerButtonText: { color: '#FFFFFF', fontSize: typography.base, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { fontSize: typography.md },
  footerLink: { fontSize: typography.md, fontWeight: '700' },
});

export default RegisterScreen;
