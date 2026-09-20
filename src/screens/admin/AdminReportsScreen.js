import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, SafeAreaView, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { getReports, updateReportStatus, deleteReport } from '../../services/reportService';
import { formatDate, truncateText } from '../../utils/helpers';
import Card from '../../components/common/Card';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

const AdminReportsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (activeFilter !== 'All') params.status = activeFilter.toLowerCase();
      const data = await getReports(params);
      setReports(data.reports || []);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to load reports', text2: err.message });
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

  const handleApprove = async (id) => {
    try {
      await updateReportStatus(id, 'approved');
      setReports((prev) => prev.map((r) => (r._id || r.id) === id ? { ...r, status: 'approved' } : r));
      Toast.show({ type: 'success', text1: 'Report approved' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    }
  };

  const handleReject = async (id) => {
    try {
      await updateReportStatus(id, 'rejected');
      setReports((prev) => prev.map((r) => (r._id || r.id) === id ? { ...r, status: 'rejected' } : r));
      Toast.show({ type: 'success', text1: 'Report rejected' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setProcessing(true);
    try {
      await deleteReport(deleteTarget._id || deleteTarget.id);
      setReports((prev) => prev.filter((r) => (r._id || r.id) !== (deleteTarget._id || deleteTarget.id)));
      Toast.show({ type: 'success', text1: 'Report deleted' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    } finally {
      setProcessing(false);
      setDeleteTarget(null);
    }
  };

  const renderReport = ({ item }) => {
    const statusColors = { pending: colors.warning, approved: colors.success, rejected: colors.error };
    return (
      <Card style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <View style={styles.reportInfo}>
            <Text style={[styles.reportCompany, { color: colors.text }]}>{item.companyName}</Text>
            <Text style={[styles.reportJob, { color: colors.textSecondary }]}>{item.jobTitle}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: (statusColors[item.status] || colors.gray) + '20' }]}>
            <Text style={[styles.statusText, { color: statusColors[item.status] || colors.gray }]}>
              {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown'}
            </Text>
          </View>
        </View>
        <Text style={[styles.reportDesc, { color: colors.textSecondary }]} numberOfLines={2}>{truncateText(item.description, 100)}</Text>
        <View style={[styles.reportFooter, { borderTopColor: colors.borderLight }]}>
          <Text style={[styles.reportDate, { color: colors.textMuted }]}>{formatDate(item.createdAt)}</Text>
        </View>
        {item.status === 'pending' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.successLight }]} onPress={() => handleApprove(item._id || item.id)}>
              <Ionicons name="checkmark" size={16} color={colors.success} />
              <Text style={[styles.actionText, { color: colors.success }]}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.errorLight }]} onPress={() => handleReject(item._id || item.id)}>
              <Ionicons name="close" size={16} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.inputBg }]} onPress={() => setDeleteTarget(item)}>
              <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.actionText, { color: colors.textMuted }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.status !== 'pending' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.inputBg }]} onPress={() => setDeleteTarget(item)}>
              <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.actionText, { color: colors.textMuted }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Reports</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Search reports..." placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} onSubmitEditing={fetchReports} returnKeyType="search" />
        {search ? (
          <TouchableOpacity onPress={() => { setSearch(''); }}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity key={filter} style={[styles.filterChip, { backgroundColor: activeFilter === filter ? colors.primary : colors.inputBg, borderColor: activeFilter === filter ? colors.primary : colors.border }]} onPress={() => setActiveFilter(filter)}>
            <Text style={[styles.filterText, { color: activeFilter === filter ? '#FFFFFF' : colors.text }]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderReport}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={<EmptyState icon="flag-outline" title="No Reports" subtitle={search || activeFilter !== 'All' ? 'Try adjusting filters' : 'No reports submitted yet'} />}
        />
      )}

      <ConfirmDialog visible={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Report" message="Are you sure you want to delete this report?" confirmText={processing ? 'Deleting...' : 'Delete'} destructive />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: spacing.sm, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: typography.lg, fontWeight: '700' },
  headerRight: { width: 40 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, height: 48 },
  searchInput: { flex: 1, fontSize: typography.md, marginLeft: spacing.sm, paddingVertical: 0 },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.sm, gap: spacing.xs },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: borderRadius.full, borderWidth: 1 },
  filterText: { fontSize: typography.sm, fontWeight: '600' },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  reportCard: { marginBottom: spacing.sm },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reportInfo: { flex: 1, marginRight: spacing.sm },
  reportCompany: { fontSize: typography.base, fontWeight: '700' },
  reportJob: { fontSize: typography.sm, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full },
  statusText: { fontSize: typography.xs, fontWeight: '600' },
  reportDesc: { fontSize: typography.sm, marginTop: spacing.sm, lineHeight: 20 },
  reportFooter: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1 },
  reportDate: { fontSize: typography.xs },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: 'transparent' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: borderRadius.md },
  actionText: { fontSize: typography.sm, fontWeight: '600', marginLeft: 4 },
});

export default AdminReportsScreen;
