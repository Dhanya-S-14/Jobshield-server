import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../services/notificationService';
import { formatDate } from '../../utils/helpers';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';

const TYPE_ICONS = {
  info: 'information-circle',
  warning: 'warning',
  success: 'checkmark-circle',
  error: 'alert-circle',
};

const TYPE_COLORS = {
  info: '#3B82F6',
  warning: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
};

const NotificationCard = ({ notification, onPress, onDelete }) => {
  const { colors } = useTheme();
  const icon = TYPE_ICONS[notification.type] || 'information-circle';
  const iconColor = TYPE_COLORS[notification.type] || colors.primary;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.notifCard, !notification.read && { borderLeftWidth: 3, borderLeftColor: colors.primary }]}>
        <View style={styles.notifHeader}>
          <View style={[styles.notifIcon, { backgroundColor: iconColor + '15' }]}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
          <View style={styles.notifInfo}>
            <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>{notification.title}</Text>
            <Text style={[styles.notifTime, { color: colors.textMuted }]}>{formatDate(notification.createdAt)}</Text>
          </View>
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.notifMessage, { color: colors.textSecondary }]} numberOfLines={3}>{notification.message}</Text>
      </Card>
    </TouchableOpacity>
  );
};

const NotificationsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      const data = await getNotifications(pageNum);
      const items = data.data || [];
      if (append) {
        setNotifications(prev => [...prev, ...items]);
      } else {
        setNotifications(items);
      }
      setHasMore(items.length === 20);
    } catch (err) {
      console.warn('Failed to fetch notifications:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchNotifications(1);
  };

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchNotifications(next, true);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      Toast.show({ type: 'success', text1: t('allMarkedRead') });
    } catch (err) {
      Toast.show({ type: 'error', text1: t('error'), text2: err.message });
    }
  };

  const handlePress = async (notif) => {
    if (!notif.read) {
      try {
        await markAsRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      } catch {}
    }
    if (notif.link) {
      navigation.navigate(notif.link);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      Toast.show({ type: 'error', text1: t('error') });
    }
  };

  if (loading) return <View style={[styles.container, { backgroundColor: colors.background }]}><Loader fullScreen /></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('notifications')}</Text>
        <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
          <Text style={[styles.markAllText, { color: colors.primary }]}>{t('markAllRead')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id || String(Math.random())}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() => handlePress(item)}
            onDelete={() => handleDelete(item._id)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title={t('noNotifications')}
            message={t('allCaughtUp')}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: spacing.sm, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: typography.lg, fontWeight: '700' },
  markAllBtn: { paddingHorizontal: 8 },
  markAllText: { fontSize: typography.sm, fontWeight: '600' },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  notifCard: { marginBottom: spacing.sm, padding: spacing.md },
  notifHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  notifIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  notifInfo: { flex: 1 },
  notifTitle: { fontSize: typography.sm, fontWeight: '600' },
  notifTime: { fontSize: typography.xs, marginTop: 1 },
  notifMessage: { fontSize: typography.sm, lineHeight: 20 },
});

export default NotificationsScreen;
