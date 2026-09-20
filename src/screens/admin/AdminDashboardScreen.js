import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { getScanStats } from '../../services/scanService';
import { getReportStats } from '../../services/reportService';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';

const screenWidth = Dimensions.get('window').width;

const StatCard = ({ icon, label, count, bgColor }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.black, borderLeftColor: bgColor, borderLeftWidth: 4 }, shadows.md]}>
      <View style={[styles.statIconContainer, { backgroundColor: bgColor + '20' }]}>
        <Ionicons name={icon} size={24} color={bgColor} />
      </View>
      <Text style={[styles.statCount, { color: colors.text }]}>{count}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
};

const ActivityItem = ({ icon, text, time, colors }) => (
  <View style={[styles.activityItem, { borderBottomColor: colors.borderLight }]}>
    <View style={[styles.activityIcon, { backgroundColor: colors.inputBg }]}>
      <Ionicons name={icon} size={18} color={colors.primary} />
    </View>
    <View style={styles.activityInfo}>
      <Text style={[styles.activityText, { color: colors.text }]}>{text}</Text>
      <Text style={[styles.activityTime, { color: colors.textMuted }]}>{time}</Text>
    </View>
  </View>
);

const AdminDashboardScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [stats, setStats] = useState({ users: 0, scans: 0, reports: 0, keywords: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [scanData, reportData] = await Promise.all([
        getScanStats().catch(() => ({})),
        getReportStats().catch(() => ({})),
      ]);
      setStats({
        users: scanData.totalUsers || 0,
        scans: scanData.total || 0,
        reports: reportData.total || 0,
        keywords: scanData.totalKeywords || 0,
      });
      setRecentActivity(scanData.recentActivity || []);
    } catch (err) {
      console.warn('Error fetching admin stats:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return <View style={[styles.container, { backgroundColor: colors.background }]}><Loader fullScreen /></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
        <TouchableOpacity onPress={fetchStats} style={[styles.refreshBtn, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="refresh" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <StatCard icon="people-outline" label="Users" count={stats.users} bgColor={colors.primary} />
          <StatCard icon="scan-outline" label="Scans" count={stats.scans} bgColor={colors.success} />
          <StatCard icon="flag-outline" label="Reports" count={stats.reports} bgColor={colors.warning} />
          <StatCard icon="key-outline" label="Keywords" count={stats.keywords} bgColor={colors.secondary} />
        </View>

        <View style={styles.quickLinks}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Links</Text>
          <View style={styles.linkRow}>
            <TouchableOpacity style={[styles.linkCard, { backgroundColor: colors.card, shadowColor: colors.black }, shadows.sm]} onPress={() => navigation.navigate('AdminUsers')}>
              <Ionicons name="people" size={28} color={colors.primary} />
              <Text style={[styles.linkLabel, { color: colors.text }]}>Users</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.linkCard, { backgroundColor: colors.card, shadowColor: colors.black }, shadows.sm]} onPress={() => navigation.navigate('AdminReports')}>
              <Ionicons name="flag" size={28} color={colors.warning} />
              <Text style={[styles.linkLabel, { color: colors.text }]}>Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.linkCard, { backgroundColor: colors.card, shadowColor: colors.black }, shadows.sm]} onPress={() => navigation.navigate('AdminKeywords')}>
              <Ionicons name="key" size={28} color={colors.secondary} />
              <Text style={[styles.linkLabel, { color: colors.text }]}>Keywords</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Card style={styles.activityCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          {recentActivity.length > 0 ? recentActivity.slice(0, 10).map((act, idx) => (
            <ActivityItem key={idx} icon={act.icon || 'ellipse'} text={act.text || 'Activity'} time={act.time || ''} colors={colors} />
          )) : (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No recent activity</Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: spacing.sm, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: typography.lg, fontWeight: '700' },
  refreshBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { width: (screenWidth - spacing.lg * 2 - spacing.sm) / 2, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: 'transparent' },
  statIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  statCount: { fontSize: typography.xxl, fontWeight: '800' },
  statLabel: { fontSize: typography.xs, marginTop: 2 },
  quickLinks: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: typography.lg, fontWeight: '700', marginBottom: spacing.md },
  linkRow: { flexDirection: 'row', gap: spacing.sm },
  linkCard: { flex: 1, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  linkLabel: { fontSize: typography.sm, fontWeight: '600', marginTop: spacing.sm },
  activityCard: { padding: spacing.lg, marginBottom: spacing.md },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1 },
  activityIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  activityInfo: { flex: 1 },
  activityText: { fontSize: typography.sm, fontWeight: '500' },
  activityTime: { fontSize: typography.xs, marginTop: 2 },
  emptyText: { fontSize: typography.md, textAlign: 'center', paddingVertical: spacing.lg },
});

export default AdminDashboardScreen;
