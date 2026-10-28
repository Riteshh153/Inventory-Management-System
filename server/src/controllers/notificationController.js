import { query } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export async function listNotifications(req, res, next) {
  try {
    const notifications = await query(`
      SELECT id, type, title, message, is_read AS 'read', urgent, created_at AS createdAt
      FROM notifications
      ORDER BY created_at DESC
      LIMIT 50
    `);

    // Format human-friendly timestamp
    const formatted = notifications.map((n) => {
      const diffMs = Date.now() - new Date(n.createdAt).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      let timestamp = 'Just now';
      if (diffMins >= 60 * 24) {
        timestamp = `${Math.floor(diffMins / (60 * 24))} days ago`;
      } else if (diffMins >= 60) {
        timestamp = `${Math.floor(diffMins / 60)} hour${Math.floor(diffMins / 60) > 1 ? 's' : ''} ago`;
      } else if (diffMins > 0) {
        timestamp = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      }

      return {
        ...n,
        read: Boolean(n.read),
        urgent: Boolean(n.urgent),
        timestamp
      };
    });

    res.json({
      success: true,
      data: { items: formatted }
    });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    await query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await query('UPDATE notifications SET is_read = TRUE');
    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
}
