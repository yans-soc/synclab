import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { fail } from '../utils/response.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [schema, token] = header.split(' ');
  if (schema !== 'Bearer' || !token) {
    return fail(res, 'Authentication token not found', 401);
  }
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    return next();
  } catch {
    return fail(res, 'Invalid or expired token', 401);
  }
}

// v1: role check from the user.role column (JWT token payload).
// Future migration: verify via a role_permission table (see database.md).
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return fail(res, 'Authentication token not found', 401);
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return fail(res, 'You do not have permission for this action', 403);
    }
    return next();
  };
}
