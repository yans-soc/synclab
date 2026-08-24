import fs from 'node:fs/promises';
import path from 'node:path';
import { kueri } from '../../database/pool.js';
import { config } from '../../config.js';

export async function daftar() {
  const { rows } = await kueri(
    `SELECT m.id, m.nama_berkas, m.url, m.tipe_mime, m.ukuran_berkas, m.dibuat_pada,
            p.nama_lengkap AS nama_pengunggah
     FROM media m
     LEFT JOIN pengguna p ON p.id = m.id_pengunggah
     ORDER BY m.dibuat_pada DESC`
  );
  return rows;
}

export async function detail(id) {
  const { rows } = await kueri(
    `SELECT m.id, m.nama_berkas, m.url, m.tipe_mime, m.ukuran_berkas, m.dibuat_pada,
            p.nama_lengkap AS nama_pengunggah
     FROM media m
     LEFT JOIN pengguna p ON p.id = m.id_pengunggah
     WHERE m.id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function simpan(berkas, idPengunggah) {
  const url = `/uploads/${berkas.filename}`;
  const { rows } = await kueri(
    `INSERT INTO media (nama_berkas, url, tipe_mime, ukuran_berkas, id_pengunggah)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nama_berkas, url, tipe_mime, ukuran_berkas, dibuat_pada`,
    [berkas.originalname, url, berkas.mimetype, berkas.size, idPengunggah]
  );
  return rows[0];
}

export async function hapus(id) {
  const media = await detail(id);
  if (!media) return null;
  await kueri('DELETE FROM media WHERE id = $1', [id]);
  if (media.url.startsWith('/uploads/')) {
    const lokasi = path.join(config.uploadDir, path.basename(media.url));
    await fs.unlink(lokasi).catch(() => {});
  }
  return media;
}
