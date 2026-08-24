import { ZodError } from 'zod';
import { fail } from '../utils/response.js';

export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return fail(
      res,
      'Invalid payload',
      400,
      err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
    );
  }
  if (err?.type === 'entity.too.large') {
    return fail(res, 'Payload too large', 413);
  }
  if (err?.name === 'MulterError') {
    return fail(res, `Failed to upload file: ${err.message}`, 400);
  }
  if (Number.isInteger(err?.status)) {
    return fail(res, err.message, err.status);
  }
  console.error('[error]', err);
  return fail(res, 'Internal server error', 500);
}

export function notFound(req, res) {
  return fail(res, `Endpoint ${req.method} ${req.originalUrl} not found`, 404);
}
