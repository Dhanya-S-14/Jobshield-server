export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export const formatDateFull = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const getRiskColor = (level, themeColors) => {
  if (!level) return themeColors?.gray || '#64748B';
  const normalized = level.toLowerCase();
  if (normalized === 'safe' || normalized === 'low') return themeColors?.safe || '#10B981';
  if (normalized === 'suspicious' || normalized === 'medium') return themeColors?.suspicious || '#F59E0B';
  if (normalized === 'scam' || normalized === 'high' || normalized === 'critical') return themeColors?.scam || '#EF4444';
  return themeColors?.gray || '#64748B';
};

export const getRiskLevel = (score) => {
  if (score === null || score === undefined) return 'unknown';
  if (score <= 20) return 'Safe';
  if (score <= 50) return 'Suspicious';
  return 'Scam';
};

export const getRiskLabel = (level) => {
  if (!level) return 'Unknown';
  const map = { safe: 'Safe', low: 'Safe', suspicious: 'Suspicious', medium: 'Suspicious', scam: 'Scam', high: 'Scam', critical: 'Scam' };
  return map[level.toLowerCase()] || 'Unknown';
};

export const validateEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validatePassword = (password) => {
  if (!password) return { valid: false, message: 'Password is required' };
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain an uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain a lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain a number' };
  return { valid: true, message: '' };
};

export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const formatCurrency = (amount) => {
  if (!amount) return 'Not specified';
  const num = parseInt(amount);
  if (isNaN(num)) return amount;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
};

export const maskEmail = (email) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name.charAt(0)}${'*'.repeat(name.length - 2)}${name.charAt(name.length - 1)}@${domain}`;
};

export const maskPhone = (phone) => {
  if (!phone) return '';
  if (phone.length < 6) return phone;
  return phone.slice(0, 2) + '****' + phone.slice(-2);
};

export const generateColor = (str) => {
  if (!str) return '#6366F1';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#0EA5E9', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];
  return colors[Math.abs(hash) % colors.length];
};

export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
