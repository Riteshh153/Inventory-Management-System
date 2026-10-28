import { env } from '../config/env.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function notFoundHandler(req, res, next) {
  next(new AppError(`Endpoint not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  // Do not expose stack traces or internal SQL errors in production
  const response = {
    success: false,
    error: {
      message: err.isOperational || env.NODE_ENV === 'development' ? err.message : 'An unexpected server error occurred.',
      code: code
    }
  };

  if (err.details) {
    response.error.details = err.details;
  }

  if (env.NODE_ENV === 'development' && statusCode === 500) {
    response.error.stack = err.stack;
  }

  // Safe logging
  if (statusCode >= 500) {
    console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json(response);
}
