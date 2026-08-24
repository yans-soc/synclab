import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { kueri } from '../../database/pool.js';
import { config } from '../../config.js';

export async function masuk(surel, kataSandi) {
  const { rows } = await kueri(
    'SELECT id, nama_lengkap, surel, kata_sandi, peran, aktif FROM pengguna WHERE surel = $1',
    [surel]
  );
  const pengguna = rows[0];
  if (!pengguna || !pengguna.aktif) return null;

  const cocok = await bcrypt.compare(kataSandi, pengguna.kata_sandi);
  if (!cocok) return null;

  const payload = {
    id: pengguna.id,
    nama_lengkap: pengguna.nama_lengkap,
    surel: pengguna.surel,
    peran: pengguna.peran,
  };
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtKedaluwarsa,
  });
  return { token, pengguna: payload };
}
