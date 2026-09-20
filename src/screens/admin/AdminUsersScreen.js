import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, SafeAreaView, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import api from '../../services/api';
import Card from '../../components/common/Card';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';

const AdminUsersScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [banTarget, setBanTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.users || []);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to load users', text2: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    setLoading(true);
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  const handleBanToggle = async () => {
    if (!banTarget) return;
    setProcessing(true);
    try {
      await api.put(`/admin/users/${banTarget._id}/ban`, { banned: !banTarget.banned });
      setUsers((prev) => prev.map((u) => u._id === banTarget._id ? { ...u, banned: !u.banned } : u));
      Toast.show({ type: 'success', text1: banTarget.banned ? 'User unbanned' : 'User banned' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    } finally {
      setProcessing(false);
      setBanTarget(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setProcessing(true);
    try {
      await api.delete(`/admin/users/${deleteTarget._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      Toast.show({ type: 'success', text1: 'User deleted' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    } finally {
      setProcessing(false);
      setDeleteTarget(null);
    }
  };

  const renderUser = ({ item }) => (
    <Card style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={[styles.userAvatar, { backgroundColor: item.role === 'admin' ? colors.secondary : colors.primary }]}>
          <Text style={styles.avatarText}>{(item.name || 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.name || 'Unknown'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.roleBadge, { backgroundColor: item.role === 'admin' ? colors.secondary + '20' : colors.primaryLight + '20' }]}>
              <Text style={[styles.roleText, { color: item.role === 'admin' ? colors.secondary : colors.primary }]}>
                {item.role || 'user'}
              </Text>
            </View>
            {item.banned && (
              <View style={[styles.bannedBadge, { backgroundColor: colors.errorLight }]}>
                <Text style={[styles.bannedText, { color: colors.error }]}>Banned</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: item.banned ? colors.successLight : colors.warningLight }]}
          onPress={() => setBanTarget(item)}
        >
          <Text style={[styles.actionBtnText, { color: item.banned ? colors.success : colors.warning }]}>
            {item.banned ? 'Unban' : 'Ban'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.errorLight }]}
          onPress={() => setDeleteTarget(item)}
        >
          <Text style={[styles.actionBtnText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Users</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Search users..." placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} onSubmitEditing={fetchUsers} returnKeyType="search" />
        {search ? (
          <TouchableOpacity onPress={() => { setSearch(''); }}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={<EmptyState icon="people-outline" title="No Users Found" subtitle={search ? 'Try a different search' : 'No users registered yet'} />}
        />
      )}

      <ConfirmDialog
        visible={!!banTarget}
        onClose={() => setBanTarget(null)}
        onConfirm={handleBanToggle}
        title={banTarget?.banned ? 'Unban User' : 'Ban User'}
        message={`Are you sure you want to ${banTarget?.banned ? 'unban' : 'ban'} ${banTarget?.name || 'this user'}?`}
        confirmText={processing ? 'Processing...' : banTarget?.banned ? 'Unban' : 'Ban'}
        destructive={!banTarget?.banned}
      />

      <ConfirmDialog
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${deleteTarget?.name || 'this user'}?`}
        confirmText={processing ? 'Deleting...' : 'Delete'}
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
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, height: 48 },
  searchInput: { flex: 1, fontSize: typography.md, marginLeft: spacing.sm, paddingVertical: 0 },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  userCard: { marginBottom: spacing.sm },
  userHeader: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: typography.lg, fontWeight: '700' },
  userInfo: { flex: 1, marginLeft: spacing.sm },
  userName: { fontSize: typography.base, fontWeight: '700' },
  userEmail: { fontSize: typography.sm, marginTop: 1 },
  badgeRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.full },
  roleText: { fontSize: typography.xs, fontWeight: '600' },
  bannedBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.full },
  bannedText: { fontSize: typography.xs, fontWeight: '600' },
  userActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: 'transparent' },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: borderRadius.md, alignItems: 'center' },
  actionBtnText: { fontSize: typography.sm, fontWeight: '700' },
});

export default AdminUsersScreen;
