import * as service from './service.js';
import { success, fail } from '../../utils/response.js';

export async function signIn(req, res) {
  const result = await service.signIn(req.body.email, req.body.password);
  if (!result) {
    return fail(res, 'Incorrect email or password', 401);
  }
  return success(res, 'Login successful', result);
}

export async function signOut(req, res) {
  // JWT is stateless: the client just deletes the token on the frontend.
  return success(res, 'Logout successful', null);
}

export async function profile(req, res) {
  return success(res, 'User profile loaded', req.user);
}
