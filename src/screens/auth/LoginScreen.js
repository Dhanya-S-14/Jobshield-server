import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { validateEmail } from '../../utils/helpers';

const LoginScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = t('emailRequired');
    else if (!validateEmail(email.trim())) errs.email = t('invalidEmail');
    if (!password) errs.password = t('passwordRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Toast.show({ type: 'error', text1: t('loginFailed'), text2: err.message });
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
              <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>JobShield</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              {t('tagline')}
            </Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.card, shadowColor: colors.black }, shadows.lg]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>{t('welcomeBack')}</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('email')}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: errors.email ? colors.error : colors.border }]}>
                <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={(t) => { setEmail(t); if (errors.email) setErrors({ ...errors, email: null }); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('password')}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: errors.password ? colors.error : colors.border }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(t) => { setPassword(t); if (errors.password) setErrors({ ...errors, password: null }); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>}
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotButton}>
              <Text style={[styles.forgotText, { color: colors.primary }]}>{t('forgotPassword')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>{t('signIn')}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>{t('dontHaveAccount')} </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.footerLink, { color: colors.primary }]}>{t('register')}</Text>
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
  headerSection: { alignItems: 'center', marginBottom: spacing.xl },
  logoContainer: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  appName: { fontSize: typography.title, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: typography.md, marginTop: spacing.xs },
  formCard: { borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: 'transparent' },
  formTitle: { fontSize: typography.xxl, fontWeight: '700', marginBottom: spacing.lg },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: typography.sm, fontWeight: '600', marginBottom: spacing.xs, marginLeft: 2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, paddingVertical: 14, fontSize: typography.base },
  eyeButton: { padding: spacing.xs },
  errorText: { fontSize: typography.xs, marginTop: 4, marginLeft: 2 },
  forgotButton: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  forgotText: { fontSize: typography.sm, fontWeight: '600' },
  loginButton: { paddingVertical: 16, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  loginButtonText: { color: '#FFFFFF', fontSize: typography.base, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { fontSize: typography.md },
  footerLink: { fontSize: typography.md, fontWeight: '700' },
});

export default LoginScreen;
