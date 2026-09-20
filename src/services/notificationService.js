export const registerForPushNotifications = async () => {
  return null;
};

export const getNotifications = async (page = 1, unreadOnly = false) => {
  return { notifications: [], total: 0, pages: 0 };
};

export const markAsRead = async (id) => {
  return {};
};

export const markAllAsRead = async () => {
  return {};
};

export const deleteNotification = async (id) => {
  return {};
};

export const addNotificationListener = (callback) => {
  return { remove: () => {} };
};

export const addResponseListener = (callback) => {
  return { remove: () => {} };
};
