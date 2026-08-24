import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../database/pool.js';
import { config } from '../../config.js';

export async function signIn(email, password) {
  const { rows } = await query(
    'SELECT id, full_name, email, password, role, active FROM users WHERE email = $1',
    [email]
  );
  const user = rows[0];
  if (!user || !user.active) return null;

  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;

  const payload = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  };
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
  return { token, user: payload };
}
