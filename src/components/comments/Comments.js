import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { getComments, createComment, markHelpful, deleteComment } from '../../services/commentService';
import { formatDate } from '../../utils/helpers';
import Toast from 'react-native-toast-message';

const StarRating = ({ rating, onRate, interactive }) => {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(0);
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity key={star} onPress={() => interactive && onRate?.(star)} disabled={!interactive}>
          <Ionicons name={star <= (hovered || rating) ? 'star' : 'star-outline'} size={interactive ? 22 : 16} color={star <= (hovered || rating) ? '#f59e0b' : colors.textSecondary} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const CommentForm = ({ scanId, companyName, onSubmitted }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating || !content.trim()) {
      Toast.show({ type: 'warning', text1: 'Rating and comment required' });
      return;
    }
    setSubmitting(true);
    try {
      await createComment({ scanHistory: scanId, companyName, rating, content, type: 'review' });
      Toast.show({ type: 'success', text1: 'Review submitted!' });
      setRating(0);
      setContent('');
      onSubmitted?.();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to submit' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <Text style={{ color: colors.textSecondary, textAlign: 'center', padding: 16 }}>Login to leave a review</Text>;

  return (
    <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.formTitle, { color: colors.text }]}>Leave a Review</Text>
      <StarRating rating={rating} onRate={setRating} interactive />
      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
        placeholder="Share your experience..."
        placeholderTextColor={colors.textSecondary}
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={3}
        maxLength={1000}
      />
      <TouchableOpacity onPress={handleSubmit} disabled={submitting || !rating || !content.trim()} style={[styles.submitBtn, { backgroundColor: rating && content.trim() ? colors.primary : colors.textSecondary }]}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>{submitting ? 'Submitting...' : 'Submit Review'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const CommentItem = ({ comment, onHelpful }) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  return (
    <View style={[styles.commentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.commentHeader}>
        <View style={styles.commentUser}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{comment.user?.name?.charAt(0) || '?'}</Text>
          </View>
          <View>
            <Text style={[styles.username, { color: colors.text }]}>{comment.user?.name || 'Anonymous'}</Text>
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>{formatDate(comment.createdAt)}</Text>
          </View>
        </View>
        <StarRating rating={comment.rating} />
      </View>
      {comment.title ? <Text style={[styles.commentTitle, { color: colors.text }]}>{comment.title}</Text> : null}
      <Text style={[styles.commentBody, { color: colors.textSecondary }]}>{comment.content}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity onPress={() => onHelpful(comment._id)} style={styles.actionBtn}>
          <Ionicons name="thumbs-up-outline" size={14} color={colors.textSecondary} />
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>Helpful ({comment.helpful})</Text>
        </TouchableOpacity>
      </View>
      {comment.replies?.length > 0 && (
        <View style={styles.replies}>
          {comment.replies.map((reply, i) => (
            <View key={i} style={styles.replyItem}>
              <Text style={{ fontWeight: '600', fontSize: 12, color: colors.text }}>{reply.user?.name || 'User'}:</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>{reply.content}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const CommentSection = ({ scanId, companyName }) => {
  const { colors } = useTheme();
  const [comments, setComments] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  const fetchComments = useCallback(async () => {
    try {
      const params = { limit: 20, sort: sortBy };
      if (scanId) params.scanHistory = scanId;
      if (companyName) params.companyName = companyName;
      const res = await getComments(params);
      setComments(res.data || []);
    } catch (err) {}
  }, [scanId, companyName, sortBy]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleHelpful = async (id) => {
    try { await markHelpful(id); fetchComments(); } catch (err) {}
  };

  const avgRating = comments.length > 0
    ? (comments.reduce((s, c) => s + c.rating, 0) / comments.length).toFixed(1)
    : 0;

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews ({comments.length})</Text>
        {comments.length > 0 && <Text style={{ color: '#f59e0b', fontWeight: '700' }}>★ {avgRating}</Text>}
      </View>
      <CommentForm scanId={scanId} companyName={companyName} onSubmitted={fetchComments} />
      {comments.map(comment => (
        <CommentItem key={comment._id} comment={comment} onHelpful={handleHelpful} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  formCard: { padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, marginBottom: spacing.md },
  formTitle: { fontSize: typography.md, fontWeight: '700', marginBottom: spacing.sm },
  input: { borderWidth: 1, borderRadius: borderRadius.md, padding: spacing.sm, fontSize: typography.sm, marginVertical: spacing.sm, minHeight: 60, textAlignVertical: 'top' },
  submitBtn: { padding: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center' },
  commentCard: { padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, marginBottom: spacing.sm },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  commentUser: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  username: { fontWeight: '600', fontSize: 13 },
  commentTitle: { fontWeight: '600', marginBottom: 4 },
  commentBody: { fontSize: 13, lineHeight: 18, marginBottom: spacing.sm },
  commentActions: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: spacing.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.lg, fontWeight: '700' },
  replies: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: '#eee' },
  replyItem: { marginBottom: 6, paddingLeft: 12 },
});

export { CommentForm, CommentItem, CommentSection, StarRating };
