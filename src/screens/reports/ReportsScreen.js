import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, SafeAreaView, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { getReports } from '../../services/reportService';
import { formatDate, truncateText } from '../../utils/helpers';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

const ReportCard = ({ report, onPress }) => {
  const { colors } = useTheme();
  const statusColors = {
    pending: colors.warning,
    approved: colors.success,
    rejected: colors.error,
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <View style={styles.reportInfo}>
            <Text style={[styles.reportCompany, { color: colors.text }]} numberOfLines={1}>{report.companyName}</Text>
            <Text style={[styles.reportJob, { color: colors.textSecondary }]} numberOfLines={1}>{report.jobTitle}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: (statusColors[report.status] || colors.gray) + '20' }]}>
            <Text style={[styles.statusText, { color: statusColors[report.status] || colors.gray }]}>
              {report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1) : 'Unknown'}
            </Text>
          </View>
        </View>
        <Text style={[styles.reportDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {truncateText(report.description, 120)}
        </Text>
        <View style={[styles.reportFooter, { borderTopColor: colors.borderLight }]}>
          <View style={styles.footerLeft}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.reportDate, { color: colors.textMuted }]}>{formatDate(report.createdAt)}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const ReportsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchReports = useCallback(async () => {
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (activeFilter !== 'All') params.status = activeFilter.toLowerCase();
      const data = await getReports(params);
      setReports(data.data || data.reports || []);
    } catch (err) {
      console.warn('Error fetching reports:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, activeFilter]);

  useEffect(() => {
    setLoading(true);
    fetchReports();
  }, [fetchReports]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, [fetchReports]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('communityReports')}</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('searchReports')}
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchReports}
          returnKeyType="search"
        />
        {search ? (
          <TouchableOpacity onPress={() => { setSearch(''); }}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, { backgroundColor: activeFilter === filter ? colors.primary : colors.inputBg, borderColor: activeFilter === filter ? colors.primary : colors.border }]}
            onPress={() => handleFilterChange(filter)}
          >
            <Text style={[styles.filterText, { color: activeFilter === filter ? '#FFFFFF' : colors.text }]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => (
            <ReportCard report={item} onPress={() => {}} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="flag-outline"
              title={t('noReportsYet')}
              subtitle={t('beFirstToReport')}
              actionTitle={t('reportAScam')}
              onAction={() => navigation.navigate('NewReport')}
            />
          }
        />
      )}

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('NewReport')}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1, paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md },
  headerTitle: { fontSize: typography.xl, fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, height: 48 },
  searchInput: { flex: 1, fontSize: typography.md, marginLeft: spacing.sm, paddingVertical: 0 },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.sm, gap: spacing.xs },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: borderRadius.full, borderWidth: 1 },
  filterText: { fontSize: typography.sm, fontWeight: '600' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100, flexGrow: 1 },
  reportCard: { marginBottom: spacing.sm },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reportInfo: { flex: 1, marginRight: spacing.sm },
  reportCompany: { fontSize: typography.base, fontWeight: '700' },
  reportJob: { fontSize: typography.sm, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full },
  statusText: { fontSize: typography.xs, fontWeight: '600' },
  reportDescription: { fontSize: typography.sm, marginTop: spacing.sm, lineHeight: 20 },
  reportFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1 },
  footerLeft: { flexDirection: 'row', alignItems: 'center' },
  reportDate: { fontSize: typography.xs, marginLeft: 4 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
});

export default ReportsScreen;
