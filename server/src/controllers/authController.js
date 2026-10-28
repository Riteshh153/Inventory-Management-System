import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * User Login with email & password
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and password are required.', 400, 'MISSING_CREDENTIALS'));
    }

    const users = await query(
      'SELECT id, name, email, password_hash, role, status FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (!users || users.length === 0) {
      return next(new AppError('Invalid email address or password.', 401, 'INVALID_CREDENTIALS'));
    }

    const user = users[0];

    if (user.status !== 'active') {
      return next(new AppError('This user account is inactive. Please contact your manager.', 403, 'ACCOUNT_INACTIVE'));
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return next(new AppError('Invalid email address or password.', 401, 'INVALID_CREDENTIALS'));
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT.SECRET,
      { expiresIn: env.JWT.EXPIRES_IN }
    );

    // Record login audit log
    await query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [user.id, 'USER_LOGIN', 'USER', user.id, JSON.stringify({ ip: req.ip, userAgent: req.headers['user-agent'] })]
    );

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current authenticated user
 */
export async function getMe(req, res, next) {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Register user (Admin only or bootstrap)
 */
export async function register(req, res, next) {
  try {
    const { name, email, password, role = 'staff' } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Name, email and password are required.', 400, 'MISSING_FIELDS'));
    }

    const existing = await query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return next(new AppError('A user with this email address already exists.', 409, 'DUPLICATE_EMAIL'));
    }

    const id = 'usr-' + Date.now();
    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    await query(
      'INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name.trim(), email.trim().toLowerCase(), passwordHash, role, 'active']
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: { id, name: name.trim(), email: email.trim().toLowerCase(), role, status: 'active' }
      }
    });
  } catch (error) {
    next(error);
  }
}
