import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, SafeAreaView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { changePassword, deleteAccount } from '../../services/authService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const SettingsScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { t, locale, changeLanguage, languages } = useLanguage();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwErrors, setPwErrors] = useState({});

  const handleChangePassword = async () => {
    const errs = {};
    if (!passwordForm.current) errs.current = 'Current password is required';
    if (!passwordForm.newPw) errs.newPw = 'New password is required';
    else if (passwordForm.newPw.length < 8) errs.newPw = 'Minimum 8 characters';
    if (passwordForm.newPw !== passwordForm.confirm) errs.confirm = 'Passwords do not match';
    setPwErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPwLoading(true);
    try {
      await changePassword(passwordForm.current, passwordForm.newPw);
      Toast.show({ type: 'success', text1: t('passwordChanged') });
      setPasswordForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      Toast.show({ type: 'success', text1: t('accountDeleted') });
      logout();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleExportData = () => {
    Toast.show({ type: 'info', text1: t('exportRequested'), text2: t('exportSentToEmail') });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={22} color={colors.text} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t('darkMode')}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={isDark ? colors.primary : colors.grayLight}
            />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <TouchableOpacity style={styles.settingRow} onPress={() => setShowLanguagePicker(!showLanguagePicker)}>
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={22} color={colors.text} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t('language') || 'Language'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.settingLabel, { color: colors.textMuted, fontSize: typography.sm }]}>
                {languages.find(l => l.code === locale)?.nativeName || 'English'}
              </Text>
              <Ionicons name={showLanguagePicker ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
          {showLanguagePicker && (
            <View style={{ marginTop: spacing.sm }}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: spacing.md,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: locale === lang.code ? colors.primary + '15' : 'transparent',
                    borderRadius: borderRadius.md,
                    marginBottom: 2,
                  }}
                  onPress={() => { changeLanguage(lang.code); setShowLanguagePicker(false); }}
                >
                  <Text style={{
                    flex: 1,
                    fontSize: typography.base,
                    color: locale === lang.code ? colors.primary : colors.text,
                    fontWeight: locale === lang.code ? '700' : '500',
                  }}>
                    {lang.nativeName}
                  </Text>
                  {locale === lang.code && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('changePassword')}</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t('currentPassword')}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: pwErrors.current ? colors.error : colors.border }]}>
              <TextInput style={[styles.input, { color: colors.text }]} placeholder="Current password" placeholderTextColor={colors.textMuted} value={passwordForm.current} onChangeText={(t) => setPasswordForm({ ...passwordForm, current: t })} secureTextEntry />
            </View>
            {pwErrors.current && <Text style={[styles.errorText, { color: colors.error }]}>{pwErrors.current}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t('newPassword')}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: pwErrors.newPw ? colors.error : colors.border }]}>
              <TextInput style={[styles.input, { color: colors.text }]} placeholder="New password" placeholderTextColor={colors.textMuted} value={passwordForm.newPw} onChangeText={(t) => setPasswordForm({ ...passwordForm, newPw: t })} secureTextEntry />
            </View>
            {pwErrors.newPw && <Text style={[styles.errorText, { color: colors.error }]}>{pwErrors.newPw}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t('confirmNewPassword')}</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: pwErrors.confirm ? colors.error : colors.border }]}>
              <TextInput style={[styles.input, { color: colors.text }]} placeholder="Confirm new password" placeholderTextColor={colors.textMuted} value={passwordForm.confirm} onChangeText={(t) => setPasswordForm({ ...passwordForm, confirm: t })} secureTextEntry />
            </View>
            {pwErrors.confirm && <Text style={[styles.errorText, { color: colors.error }]}>{pwErrors.confirm}</Text>}
          </View>

          <Button title={t('updatePassword')} icon="lock-closed-outline" loading={pwLoading} onPress={handleChangePassword} variant="outline" fullWidth />
        </Card>

        <Card style={styles.sectionCard}>
          <TouchableOpacity style={[styles.actionRow, { borderBottomColor: colors.borderLight }]} onPress={handleExportData}>
            <Ionicons name="download-outline" size={22} color={colors.text} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>{t('exportMyData')}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={() => setShowDeleteConfirm(true)}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
            <Text style={[styles.actionLabel, { color: colors.error }]}>{t('deleteAccount')}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        <Text style={[styles.versionText, { color: colors.textMuted }]}>{t('version')}</Text>
      </ScrollView>

      <ConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title={t('deleteAccount')}
        message={t('deleteAccountConfirm')}
        confirmText={deleting ? t('deleting') : t('deleteAccount')}
        destructive
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: spacing.sm, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: typography.lg, fontWeight: '700' },
  headerRight: { width: 40 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionCard: { marginBottom: spacing.md, padding: spacing.lg },
  sectionTitle: { fontSize: typography.lg, fontWeight: '700', marginBottom: spacing.md },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingLabel: { fontSize: typography.base, fontWeight: '500', marginLeft: spacing.md },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: typography.sm, fontWeight: '600', marginBottom: spacing.xs, marginLeft: 2 },
  inputWrapper: { borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md },
  input: { paddingVertical: 12, fontSize: typography.md },
  errorText: { fontSize: typography.xs, marginTop: 4, marginLeft: 2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  actionLabel: { fontSize: typography.base, fontWeight: '500', marginLeft: spacing.md, flex: 1 },
  versionText: { fontSize: typography.sm, textAlign: 'center', marginTop: spacing.md },
});

export default SettingsScreen;
