import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, SafeAreaView, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { getScans } from '../../services/scanService';
import { getRiskLevel } from '../../utils/helpers';
import ScanResultCard from '../scanner/ScanResultCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';

const FILTERS = ['All', 'Safe', 'Suspicious', 'Scam'];

const HistoryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchScans = useCallback(async (pageNum = 1, append = false) => {
    try {
      const params = { page: pageNum, limit: 20 };
      if (search.trim()) params.search = search.trim();
      if (activeFilter !== 'All') params.riskLevel = activeFilter.toLowerCase();
      const data = await getScans(params);
      const newScans = data.scans || [];
      if (append) {
        setScans((prev) => [...prev, ...newScans]);
      } else {
        setScans(newScans);
      }
      setHasMore(newScans.length === 20);
    } catch (err) {
      console.warn('Error fetching scans:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [search, activeFilter]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchScans(1);
  }, [fetchScans]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchScans(1);
  }, [fetchScans]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchScans(nextPage, true);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPage(1);
    setScans([]);
    setLoading(true);
  };

  const handleSearch = () => {
    setPage(1);
    setScans([]);
    setLoading(true);
  };

  const renderItem = ({ item }) => (
    <ScanResultCard
      scan={item}
      onPress={() => navigation.navigate('ScanDetail', { scanId: item._id || item.id })}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('scanHistory')}</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('searchByCompanyOrJob')}
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {search ? (
          <TouchableOpacity onPress={() => { setSearch(''); handleSearch(); }}>
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
            <Text style={[styles.filterText, { color: activeFilter === filter ? '#FFFFFF' : colors.text, fontWeight: activeFilter === filter ? '700' : '500' }]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <EmptyState
              icon="time-outline"
              title={t('noScansFound')}
              subtitle={search || activeFilter !== 'All' ? t('tryAdjustingSearch') : t('startByScanningAJob')}
              actionTitle={!search && activeFilter === 'All' ? t('newScan') : undefined}
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
  header: { borderBottomWidth: 1, paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md },
  headerTitle: { fontSize: typography.xl, fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, height: 48 },
  searchInput: { flex: 1, fontSize: typography.md, marginLeft: spacing.sm, paddingVertical: 0 },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.sm, gap: spacing.xs },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: borderRadius.full, borderWidth: 1 },
  filterText: { fontSize: typography.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  footerLoader: { paddingVertical: spacing.md },
});

export default HistoryScreen;
