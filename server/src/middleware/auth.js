import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Missing or malformed token.', 401, 'UNAUTHORIZED'));
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT.SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Your session has expired. Please log in again.', 401, 'TOKEN_EXPIRED'));
      }
      return next(new AppError('Invalid authentication token.', 401, 'INVALID_TOKEN'));
    }

    const rows = await query('SELECT id, name, email, role, status FROM users WHERE id = ?', [decoded.id]);
    if (!rows || rows.length === 0) {
      return next(new AppError('User belonging to this token no longer exists.', 401, 'USER_NOT_FOUND'));
    }

    const user = rows[0];
    if (user.status !== 'active') {
      return next(new AppError('Your account has been deactivated. Please contact an administrator.', 403, 'ACCOUNT_INACTIVE'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: requires one of the following roles: [${allowedRoles.join(', ')}].`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT.SECRET);
    const rows = await query('SELECT id, name, email, role, status FROM users WHERE id = ?', [decoded.id]);
    if (rows && rows.length > 0 && rows[0].status === 'active') {
      req.user = rows[0];
    }
  } catch (err) {
    // Ignore invalid optional tokens
  }
  next();
}
