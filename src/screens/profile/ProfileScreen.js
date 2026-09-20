import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { getScanStats } from '../../services/scanService';
import { getInitials } from '../../utils/helpers';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';

const MenuItem = ({ icon, label, onPress, color, rightElement }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.borderLight }]} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={22} color={color || colors.text} />
        <Text style={[styles.menuLabel, { color: color || colors.text }]}>{label}</Text>
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
    </TouchableOpacity>
  );
};

const ProfileScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({ scans: 0, saved: 0, reports: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getScanStats();
      setStats({ scans: data.total || 0, saved: data.saved || 0, reports: data.reports || 0 });
    } catch {
      setStats({ scans: 0, saved: 0, reports: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleLogout = () => {
    logout();
    Toast.show({ type: 'success', text1: t('loggedOutSuccessfully') });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'User'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || ''}</Text>
          {user?.role === 'admin' && (
            <View style={[styles.adminBadge, { backgroundColor: colors.primaryLight + '20' }]}>
              <Ionicons name="shield" size={14} color={colors.primary} />
              <Text style={[styles.adminText, { color: colors.primary }]}>{t('admin')}</Text>
            </View>
          )}
        </Card>

        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statCount, { color: colors.text }]}>{stats.scans}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('scans')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statCount, { color: colors.text }]}>{stats.saved}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('saved')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statCount, { color: colors.text }]}>{stats.reports}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('reports')}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.menuCard}>
          <MenuItem icon="bookmark-outline" label={t('savedJobs')} onPress={() => navigation.navigate('SavedJobs')} />
          <MenuItem icon="person-outline" label={t('editProfile')} onPress={() => navigation.navigate('EditProfile')} />
          <MenuItem icon="settings-outline" label={t('settings')} onPress={() => navigation.navigate('Settings')} />
          <MenuItem icon="information-circle-outline" label={t('about')} onPress={() => navigation.navigate('About')} />
          {user?.role === 'admin' && (
            <MenuItem icon="shield-outline" label={t('adminDashboard')} color={colors.primary} onPress={() => navigation.navigate('Admin')} />
          )}
          <MenuItem icon="log-out-outline" label={t('logout')} color={colors.error} onPress={handleLogout} rightElement={null} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1, paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md },
  headerTitle: { fontSize: typography.xl, fontWeight: '700' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  profileCard: { alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.md },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { color: '#FFFFFF', fontSize: typography.xxxl, fontWeight: '700' },
  userName: { fontSize: typography.xl, fontWeight: '700' },
  userEmail: { fontSize: typography.md, marginTop: spacing.xs },
  adminBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: borderRadius.full, marginTop: spacing.sm },
  adminText: { fontSize: typography.xs, fontWeight: '700', marginLeft: 4 },
  statsCard: { marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.md },
  statItem: { alignItems: 'center' },
  statCount: { fontSize: typography.xxl, fontWeight: '800' },
  statLabel: { fontSize: typography.xs, marginTop: 2 },
  statDivider: { width: 1, height: 40, alignSelf: 'center' },
  menuCard: { marginBottom: spacing.md },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { fontSize: typography.base, fontWeight: '500', marginLeft: spacing.md },
});

export default ProfileScreen;
