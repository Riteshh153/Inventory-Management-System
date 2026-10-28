import { AppError } from './errorHandler.js';

/**
 * Zod validation middleware factory
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.parse(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return next(new AppError('Validation failed. Please verify submitted fields.', 400, 'VALIDATION_ERROR', details));
      }
      next(err);
    }
  };
}
