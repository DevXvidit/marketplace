const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  const { unread, limit = 20 } = req.query;
  const filter = {};
  if (unread === 'true') filter.isRead = false;

  const [items, unreadCount] = await Promise.all([
    Notification.find(filter).sort('-createdAt').limit(Number(limit)).lean(),
    Notification.countDocuments({ isRead: false })
  ]);

  res.json({ success: true, data: items, unreadCount });
};

const markNotificationRead = async (req, res) => {
  const notif = await Notification.findById(req.params.id);
  if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
  notif.isRead = true;
  await notif.save();
  res.json({ success: true, data: notif });
};

module.exports = { getNotifications, markNotificationRead };
