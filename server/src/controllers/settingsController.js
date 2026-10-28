import { query } from '../config/db.js';

export async function getSettings(req, res, next) {
  try {
    const rows = await query('SELECT key_name, key_value FROM system_settings');
    const settings = {};
    for (const r of rows) {
      if (r.key_value === 'true') settings[r.key_name] = true;
      else if (r.key_value === 'false') settings[r.key_name] = false;
      else if (!isNaN(Number(r.key_value)) && r.key_value.trim() !== '') {
        settings[r.key_name] = Number(r.key_value);
      } else {
        settings[r.key_name] = r.key_value;
      }
    }

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const updates = req.body;
    for (const [k, v] of Object.entries(updates)) {
      const valStr = String(v);
      await query(
        'INSERT INTO system_settings (key_name, key_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE key_value = ?',
        [k, valStr, valStr]
      );
    }

    res.json({
      success: true,
      message: 'System settings saved successfully.'
    });
  } catch (error) {
    next(error);
  }
}
