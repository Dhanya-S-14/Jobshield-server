import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiStar, FiThumbsUp, FiMessageSquare, FiFlag, FiSend, FiTrash2 } from 'react-icons/fi';
import { showToast } from '../common/Toast';
import Pagination from '../common/Pagination';
import Loader from '../common/Loader';

const StarRating = ({ rating, onRate, interactive }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= (hovered || rating) ? 'star-active' : ''}`}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          disabled={!interactive}
        >
          <FiStar size={interactive ? 20 : 14} fill={star <= (hovered || rating) ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
};

const CommentForm = ({ scanId, companyName, onSubmit }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !content.trim()) {
      showToast.warning('Please provide a rating and comment');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/api/comments', {
        scanHistory: scanId || null,
        companyName: companyName || '',
        rating,
        title,
        content,
        type: 'review'
      });
      if (res.data.success) {
        showToast.success('Review submitted!');
        setRating(0);
        setTitle('');
        setContent('');
        onSubmit && onSubmit();
      }
    } catch (err) {
      showToast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <p className="text-muted">Please <a href="/login">login</a> to leave a review.</p>;

  return (
    <form onSubmit={handleSubmit} className="comment-form card">
      <h4 className="comment-form-title">Leave a Review</h4>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4, display: 'block' }}>Your Rating</label>
        <StarRating rating={rating} onRate={setRating} interactive />
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="comment-input"
        maxLength={100}
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your experience or thoughts..."
        className="comment-textarea"
        rows={3}
        maxLength={1000}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{content.length}/1000</span>
        <button type="submit" disabled={submitting || !rating || !content.trim()} className="btn btn-primary">
          <FiSend size={14} /> Submit
        </button>
      </div>
    </form>
  );
};

const CommentItem = ({ comment, onHelpful, onDelete }) => {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      const res = await api.post(`/api/comments/${comment._id}/reply`, { content: replyText });
      if (res.data.success) {
        setReplyText('');
        setShowReplies(false);
        showToast.success('Reply added');
      }
    } catch (err) {
      showToast.error('Failed to add reply');
    } finally {
      setReplying(false);
    }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="comment-item card">
      <div className="comment-header">
        <div className="comment-user">
          <div className="comment-avatar">{comment.user?.name?.charAt(0) || '?'}</div>
          <div>
            <span className="comment-username">{comment.user?.name || 'Anonymous'}</span>
            <span className="comment-time">{timeAgo(comment.createdAt)}</span>
          </div>
        </div>
        <StarRating rating={comment.rating} />
      </div>
      {comment.title && <h5 className="comment-title">{comment.title}</h5>}
      <p className="comment-body">{comment.content}</p>
      <div className="comment-actions">
        <button onClick={() => onHelpful(comment._id)} className="comment-action-btn">
          <FiThumbsUp size={14} /> Helpful ({comment.helpful})
        </button>
        <button onClick={() => setShowReplies(!showReplies)} className="comment-action-btn">
          <FiMessageSquare size={14} /> {comment.replies?.length || 0} Replies
        </button>
        {user && (user.id === comment.user?._id || user.role === 'admin') && (
          <button onClick={() => onDelete(comment._id)} className="comment-action-btn comment-action-danger">
            <FiTrash2 size={14} /> Delete
          </button>
        )}
      </div>
      {showReplies && (
        <div className="comment-replies">
          {comment.replies?.map((reply, i) => (
            <div key={i} className="reply-item">
              <div className="comment-user" style={{ marginBottom: 4 }}>
                <div className="comment-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                  {reply.user?.name?.charAt(0) || '?'}
                </div>
                <span className="comment-username" style={{ fontSize: '0.8rem' }}>{reply.user?.name || 'User'}</span>
                <span className="comment-time">{timeAgo(reply.createdAt)}</span>
              </div>
              <p style={{ margin: '4px 0 0 36px', fontSize: '0.85rem' }}>{reply.content}</p>
            </div>
          ))}
          {user && (
            <div className="reply-form" style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="comment-input"
                style={{ flex: 1 }}
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
              />
              <button onClick={handleReply} disabled={replying || !replyText.trim()} className="btn btn-primary btn-sm">
                Reply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CommentList = ({ scanId, companyName }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort: sortBy };
      if (scanId) params.scanHistory = scanId;
      if (companyName) params.companyName = companyName;

      const queryStr = new URLSearchParams(params).toString();
      const res = await api.get(`/api/comments?${queryStr}`);
      if (res.data.success) {
        setComments(res.data.data);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      console.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [scanId, companyName, page, sortBy]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleHelpful = async (id) => {
    try {
      await api.put(`/api/comments/${id}/helpful`);
      fetchComments();
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/api/comments/${id}`);
      showToast.success('Comment deleted');
      fetchComments();
    } catch (err) {
      showToast.error('Failed to delete');
    }
  };

  const avgRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : 0;

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3>Reviews & Comments</h3>
        {comments.length > 0 && (
          <div className="comments-summary">
            <span className="avg-rating"><FiStar size={16} fill="currentColor" /> {avgRating}</span>
            <span>{comments.length} review{comments.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="comments-sort">
        {['newest', 'rating', 'helpful'].map(s => (
          <button key={s} onClick={() => setSortBy(s)} className={`sort-btn ${sortBy === s ? 'active' : ''}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : (
        <>
          {comments.length === 0 && <p className="text-muted" style={{ textAlign: 'center', padding: 20 }}>No reviews yet. Be the first to share your experience!</p>}
          {comments.map(comment => (
            <CommentItem key={comment._id} comment={comment} onHelpful={handleHelpful} onDelete={handleDelete} />
          ))}
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
};

export { CommentForm, CommentList, StarRating };
