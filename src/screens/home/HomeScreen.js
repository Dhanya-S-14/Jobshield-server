import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, RefreshControl, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { getScans, getScanStats } from '../../services/scanService';
import { getPublicReports } from '../../services/reportService';
import { formatDate, getRiskLevel } from '../../utils/helpers';
import StatsCard from './StatsCard';
import ScanResultCard from '../scanner/ScanResultCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import { WarningBanner } from '../../components/warning/WarningBanner';

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({ total: 0, safe: 0, suspicious: 0, scam: 0 });
  const [recentScans, setRecentScans] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsData, scansData, reportsData] = await Promise.all([
        getScanStats().catch(() => ({ total: 0, safe: 0, suspicious: 0, scam: 0 })),
        getScans({ limit: 5 }).catch(() => ({ scans: [] })),
        getPublicReports(5).catch(() => ({ data: [] })),
      ]);
      setStats({ total: statsData.total || 0, safe: statsData.safe || 0, suspicious: statsData.suspicious || 0, scam: statsData.scam || 0 });
      setRecentScans(scansData.scans || []);
      setRecentReports(reportsData.data || reportsData.reports || []);
    } catch (err) {
      console.warn('Error fetching home data:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Loader fullScreen />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: colors.textMuted }]}>{getGreeting()},</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'User'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.notifBtn, { backgroundColor: colors.inputBg }]} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <WarningBanner />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <StatsCard icon="scan-outline" count={stats.total} label={t('totalScans')} bgColor={colors.primary} onPress={() => navigation.navigate('History')} />
          <StatsCard icon="shield-checkmark" count={stats.safe} label={t('safe')} bgColor={colors.success} onPress={() => navigation.navigate('History')} />
          <StatsCard icon="warning-outline" count={stats.suspicious} label={t('suspicious')} bgColor={colors.warning} onPress={() => navigation.navigate('History')} />
          <StatsCard icon="flame-outline" count={stats.scam} label={t('scam')} bgColor={colors.error} onPress={() => navigation.navigate('History')} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('recentScans')}</Text>
          {recentScans.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>{t('seeAll')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentScans.length > 0 ? (
          <FlatList
            data={recentScans}
            keyExtractor={(item) => item._id || item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentScansList}
            renderItem={({ item }) => (
              <ScanResultCard
                scan={item}
                onPress={() => navigation.navigate('ScanDetail', { scanId: item._id || item.id })}
                compact
              />
            )}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <EmptyState
              icon="document-text-outline"
              title={t('noScansYet')}
              subtitle={t('startByScanning')}
              actionTitle={t('newScan')}
              onAction={() => navigation.navigate('Scanner')}
            />
          </Card>
        )}

        {/* Community Reports Section */}
        {recentReports.length > 0 && (
          <View style={styles.reportsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('communityReports')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>{t('seeAll')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentReports}
              keyExtractor={(item) => item._id || item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.reportsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.reportCard, { backgroundColor: colors.card, shadowColor: colors.black }, shadows.md]}
                  onPress={() => navigation.navigate('Reports')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.reportIconContainer, { backgroundColor: colors.errorLight }]}>
                    <Ionicons name="warning" size={18} color={colors.error} />
                  </View>
                  <View style={styles.reportCardContent}>
                    <Text style={[styles.reportCardCompany, { color: colors.text }]} numberOfLines={1}>
                      {item.companyName}
                    </Text>
                    <Text style={[styles.reportCardJob, { color: colors.textMuted }]} numberOfLines={1}>
                      {item.jobTitle}
                    </Text>
                    <Text style={[styles.reportCardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <Text style={[styles.reportCardDate, { color: colors.textMuted }]}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('quickActions')}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, shadowColor: colors.black }, shadows.md]} onPress={() => navigation.navigate('Scanner')}>
              <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight + '20' }]}>
                <Ionicons name="search" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>{t('newScan')}</Text>
              <Text style={[styles.actionDesc, { color: colors.textMuted }]}>{t('analyzeJob')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, shadowColor: colors.black }, shadows.md]} onPress={() => navigation.navigate('CompanyVerify')}>
              <View style={[styles.actionIcon, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="business-outline" size={24} color={colors.secondary} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>{t('verifyCompany')}</Text>
              <Text style={[styles.actionDesc, { color: colors.textMuted }]}>{t('checkCompany')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1, paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  notifBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: typography.md },
  userName: { fontSize: typography.xl, fontWeight: '700', marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: typography.lg, fontWeight: '700' },
  scroll: { paddingBottom: spacing.xxl },
  statsRow: { flexDirection: 'row', paddingHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  sectionTitle: { fontSize: typography.lg, fontWeight: '700' },
  seeAll: { fontSize: typography.sm, fontWeight: '600' },
  recentScansList: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  emptyCard: { marginHorizontal: spacing.lg, paddingVertical: spacing.xl },
  quickActions: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  actionRow: { flexDirection: 'row', marginTop: spacing.sm, gap: spacing.sm },
  actionButton: { flex: 1, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  actionIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  actionLabel: { fontSize: typography.md, fontWeight: '600' },
  actionDesc: { fontSize: typography.xs, marginTop: 2 },
  reportsSection: { marginTop: spacing.lg },
  reportsList: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  reportCard: { width: 260, borderRadius: borderRadius.lg, padding: spacing.md, marginRight: spacing.sm, borderWidth: 1, borderColor: 'transparent' },
  reportIconContainer: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  reportCardContent: { flex: 1 },
  reportCardCompany: { fontSize: typography.base, fontWeight: '700', marginBottom: 2 },
  reportCardJob: { fontSize: typography.xs, marginBottom: spacing.xs },
  reportCardDesc: { fontSize: typography.xs, lineHeight: 18, marginBottom: spacing.xs },
  reportCardDate: { fontSize: typography.xs - 1, marginTop: 2 },
});

export default HomeScreen;
