const Notification = require('../models/Notification');

let Expo;
try {
  Expo = require('expo-server-sdk').Expo;
} catch {
  Expo = null;
}

const pushTokens = new Map();

const registerPushToken = async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Push token is required' });

    pushTokens.set(req.user.id, { token, platform: platform || 'unknown', updatedAt: new Date() });

    res.status(200).json({ success: true, message: 'Push token registered' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const sendPushNotification = async (userId, title, body, data = {}) => {
  const entry = pushTokens.get(userId);
  if (!entry || !Expo) return false;

  if (!Expo.isExpoPushToken(entry.token)) return false;

  try {
    const expo = new Expo();
    await expo.sendPushNotificationsAsync([{
      to: entry.token,
      title,
      body,
      data,
      sound: 'default',
      badge: 1,
    }]);
    return true;
  } catch (error) {
    console.error('Push notification failed:', error.message);
    return false;
  }
};

const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unread === 'true';

    const query = { user: req.user.id };
    if (unreadOnly) query.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: req.user.id, read: false })
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
  registerPushToken,
  sendPushNotification,
};
