import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, SafeAreaView, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';

const CATEGORIES = ['salary', 'benefits', 'requirements', 'company', 'communication', 'urgency', 'personal_info'];
const SEVERITY_OPTIONS = ['low', 'medium', 'high'];

const KeywordModal = ({ visible, onClose, onSave, initialData }) => {
  const { colors } = useTheme();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('requirements');
  const [severity, setSeverity] = useState('medium');
  const [points, setPoints] = useState('10');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setKeyword(initialData.keyword || '');
      setCategory(initialData.category || 'requirements');
      setSeverity(initialData.severity || 'medium');
      setPoints(String(initialData.points || 10));
    } else {
      setKeyword('');
      setCategory('requirements');
      setSeverity('medium');
      setPoints('10');
    }
  }, [initialData, visible]);

  const validate = () => {
    const errs = {};
    if (!keyword.trim()) errs.keyword = 'Keyword is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      keyword: keyword.trim().toLowerCase(),
      category,
      severity,
      points: parseInt(points) || 10,
    });
  };

  return (
    <Modal visible={visible} onClose={onClose} title={initialData ? 'Edit Keyword' : 'Add Keyword'}>
      <View style={styles.modalContent}>
        <Text style={[styles.modalLabel, { color: colors.text }]}>Keyword</Text>
        <View style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: errors.keyword ? colors.error : colors.border }]}>
          <TextInput style={[styles.modalInputText, { color: colors.text }]} placeholder="e.g. urgent hiring" placeholderTextColor={colors.textMuted} value={keyword} onChangeText={(t) => { setKeyword(t); if (errors.keyword) setErrors({ ...errors, keyword: null }); }} autoCapitalize="none" />
        </View>
        {errors.keyword && <Text style={[styles.errorText, { color: colors.error }]}>{errors.keyword}</Text>}

        <Text style={[styles.modalLabel, { color: colors.text }]}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.chip, { backgroundColor: category === cat ? colors.primary : colors.inputBg, borderColor: category === cat ? colors.primary : colors.border }]} onPress={() => setCategory(cat)}>
              <Text style={[styles.chipText, { color: category === cat ? '#FFFFFF' : colors.text }]}>{cat.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.modalLabel, { color: colors.text }]}>Severity</Text>
        <View style={styles.chipRow}>
          {SEVERITY_OPTIONS.map((sev) => (
            <TouchableOpacity key={sev} style={[styles.chip, { backgroundColor: severity === sev ? colors.primary : colors.inputBg, borderColor: severity === sev ? colors.primary : colors.border }]} onPress={() => setSeverity(sev)}>
              <Text style={[styles.chipText, { color: severity === sev ? '#FFFFFF' : colors.text }]}>{sev}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.modalLabel, { color: colors.text }]}>Points</Text>
        <View style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <TextInput style={[styles.modalInputText, { color: colors.text }]} placeholder="10" placeholderTextColor={colors.textMuted} value={points} onChangeText={setPoints} keyboardType="numeric" />
        </View>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{initialData ? 'Update' : 'Add Keyword'}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const AdminKeywordsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  const fetchKeywords = useCallback(async () => {
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (filterCategory) params.category = filterCategory;
      const res = await api.get('/admin/keywords', { params });
      setKeywords(res.data.keywords || []);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to load keywords', text2: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, filterCategory]);

  useEffect(() => {
    setLoading(true);
    fetchKeywords();
  }, [fetchKeywords]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchKeywords();
  }, [fetchKeywords]);

  const handleSaveKeyword = async (data) => {
    try {
      if (editTarget) {
        await api.put(`/admin/keywords/${editTarget._id}`, data);
        setKeywords((prev) => prev.map((k) => k._id === editTarget._id ? { ...k, ...data } : k));
        Toast.show({ type: 'success', text1: 'Keyword updated' });
      } else {
        const res = await api.post('/admin/keywords', data);
        setKeywords((prev) => [...prev, res.data.keyword || res.data]);
        Toast.show({ type: 'success', text1: 'Keyword added' });
      }
      setShowModal(false);
      setEditTarget(null);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setProcessing(true);
    try {
      await api.delete(`/admin/keywords/${deleteTarget._id}`);
      setKeywords((prev) => prev.filter((k) => k._id !== deleteTarget._id));
      Toast.show({ type: 'success', text1: 'Keyword deleted' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    } finally {
      setProcessing(false);
      setDeleteTarget(null);
    }
  };

  const getSeverityColor = (sev) => {
    if (sev === 'high') return colors.error;
    if (sev === 'medium') return colors.warning;
    return colors.success;
  };

  const renderKeyword = ({ item }) => (
    <Card style={styles.keywordCard}>
      <View style={styles.keywordRow}>
        <View style={styles.keywordInfo}>
          <Text style={[styles.keywordText, { color: colors.text }]}>{item.keyword}</Text>
          <View style={styles.tagRow}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight + '20' }]}>
              <Text style={[styles.categoryText, { color: colors.primary }]}>{item.category}</Text>
            </View>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) + '20' }]}>
              <Text style={[styles.severityText, { color: getSeverityColor(item.severity) }]}>{item.severity}</Text>
            </View>
            <Text style={[styles.pointsText, { color: colors.textMuted }]}>{item.points} pts</Text>
          </View>
        </View>
        <View style={styles.keywordActions}>
          <TouchableOpacity onPress={() => { setEditTarget(item); setShowModal(true); }} style={styles.keywordActionBtn}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDeleteTarget(item)} style={styles.keywordActionBtn}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Keywords</Text>
        <TouchableOpacity onPress={() => { setEditTarget(null); setShowModal(true); }} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Search keywords..." placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} onSubmitEditing={fetchKeywords} returnKeyType="search" />
        {search ? (
          <TouchableOpacity onPress={() => { setSearch(''); }}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterChip, { backgroundColor: !filterCategory ? colors.primary : colors.inputBg, borderColor: !filterCategory ? colors.primary : colors.border }]} onPress={() => setFilterCategory('')}>
          <Text style={[styles.filterText, { color: !filterCategory ? '#FFFFFF' : colors.text }]}>All</Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat} style={[styles.filterChip, { backgroundColor: filterCategory === cat ? colors.primary : colors.inputBg, borderColor: filterCategory === cat ? colors.primary : colors.border }]} onPress={() => setFilterCategory(filterCategory === cat ? '' : cat)}>
            <Text style={[styles.filterText, { color: filterCategory === cat ? '#FFFFFF' : colors.text }]}>{cat.replace('_', ' ')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={keywords}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderKeyword}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={<EmptyState icon="key-outline" title="No Keywords" subtitle={search || filterCategory ? 'Try adjusting filters' : 'Add keywords to detect in job scans'} />}
        />
      )}

      <KeywordModal visible={showModal} onClose={() => { setShowModal(false); setEditTarget(null); }} onSave={handleSaveKeyword} initialData={editTarget} />

      <ConfirmDialog visible={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Keyword" message="Are you sure you want to delete this keyword?" confirmText={processing ? 'Deleting...' : 'Delete'} destructive />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: spacing.sm, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: typography.lg, fontWeight: '700' },
  addBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, height: 48 },
  searchInput: { flex: 1, fontSize: typography.md, marginLeft: spacing.sm, paddingVertical: 0 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, marginBottom: spacing.sm, gap: spacing.xs },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full, borderWidth: 1 },
  filterText: { fontSize: typography.xs, fontWeight: '600' },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  keywordCard: { marginBottom: spacing.xs },
  keywordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  keywordInfo: { flex: 1 },
  keywordText: { fontSize: typography.base, fontWeight: '600', textTransform: 'capitalize' },
  tagRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: spacing.xs },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.full },
  categoryText: { fontSize: typography.xs, fontWeight: '600', textTransform: 'capitalize' },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.full },
  severityText: { fontSize: typography.xs, fontWeight: '600', textTransform: 'capitalize' },
  pointsText: { fontSize: typography.xs, fontWeight: '500' },
  keywordActions: { flexDirection: 'row', gap: spacing.xs },
  keywordActionBtn: { padding: spacing.sm },
  modalContent: {},
  modalLabel: { fontSize: typography.sm, fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.md },
  modalInput: { borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md },
  modalInputText: { paddingVertical: 12, fontSize: typography.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full, borderWidth: 1 },
  chipText: { fontSize: typography.xs, fontWeight: '600' },
  errorText: { fontSize: typography.xs, marginTop: 4, marginLeft: 2, color: 'red' },
  saveBtn: { paddingVertical: 14, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { color: '#FFFFFF', fontSize: typography.base, fontWeight: '700' },
});

export default AdminKeywordsScreen;
