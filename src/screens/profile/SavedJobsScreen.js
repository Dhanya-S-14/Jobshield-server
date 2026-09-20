import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { getScans, saveScan } from '../../services/scanService';
import { formatDate, getRiskLevel } from '../../utils/helpers';
import Card from '../../components/common/Card';
import RiskBadge from '../../components/common/RiskBadge';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';

const SavedJobCard = ({ scan, onRemove }) => {
  const { colors } = useTheme();
  const level = getRiskLevel(scan.riskScore);

  return (
    <Card style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.jobInfo}>
          <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={1}>{scan.companyName}</Text>
          <Text style={[styles.jobTitle, { color: colors.textSecondary }]} numberOfLines={1}>{scan.jobTitle}</Text>
          <RiskBadge level={level} size="sm" />
        </View>
        <TouchableOpacity onPress={() => onRemove(scan._id || scan.id)} style={styles.removeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="bookmark" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={[styles.jobFooter, { borderTopColor: colors.borderLight }]}>
        <View style={styles.footerLeft}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.dateText, { color: colors.textMuted }]}>Saved {formatDate(scan.updatedAt || scan.createdAt)}</Text>
        </View>
      </View>
    </Card>
  );
};

const SavedJobsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const fetchSaved = useCallback(async () => {
    try {
      const data = await getScans({ saved: true, limit: 50 });
      setSavedJobs(data.scans || []);
    } catch (err) {
      console.warn('Error fetching saved jobs:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const handleRemove = async (id) => {
    setRemovingId(id);
    try {
      await saveScan(id);
      setSavedJobs((prev) => prev.filter((j) => (j._id || j.id) !== id));
      Toast.show({ type: 'success', text1: 'Removed from saved' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Saved Jobs</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={savedJobs}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => (
            <SavedJobCard scan={item} onRemove={handleRemove} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="bookmark-outline"
              title="No Saved Jobs"
              subtitle="Save job scans to quickly access them later"
              actionTitle="Scan a Job"
              onAction={() => navigation.navigate('Scanner')}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: spacing.sm, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: typography.lg, fontWeight: '700' },
  headerRight: { width: 40 },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  jobCard: { marginBottom: spacing.sm },
  jobHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  jobInfo: { flex: 1, marginRight: spacing.sm },
  companyName: { fontSize: typography.base, fontWeight: '700' },
  jobTitle: { fontSize: typography.sm, marginTop: 2, marginBottom: spacing.xs },
  removeBtn: { padding: spacing.xs },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1 },
  footerLeft: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: typography.xs, marginLeft: 4 },
});

export default SavedJobsScreen;
