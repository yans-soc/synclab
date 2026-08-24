import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { kueri } from '../../database/pool.js';
import { config } from '../../config.js';

// Varian responsive (webp) yang dibuat saat unggah gambar.
// URL berbentuk <nama>-w<lebar>.webp sehingga frontend dapat memilih ukuran
// terdekat tanpa query tambahan, dan CDN dapat me-cache tiap varian permanen.
const VARIAN = { thumbnail: 400, small: 800, medium: 1280, large: 1920 };

async function buatVarian(berkas) {
  if (!berkas.mimetype.startsWith('image/') || berkas.mimetype === 'image/svg+xml') {
    return { lebar: null, tinggi: null, varian: {} };
  }
  const lokasiAsli = path.join(config.uploadDir, berkas.filename);
  const dasar = berkas.filename.replace(/\.[^.]+$/, '');
  const gambar = sharp(lokasiAsli, { failOn: 'none' }).rotate();
  const meta = await gambar.metadata();
  const varian = {};
  await Promise.all(
    Object.entries(VARIAN).map(async ([nama, lebar]) => {
      if (meta.width && meta.width <= lebar) return;
      const namaBerkas = `${dasar}-w${lebar}.webp`;
      await sharp(lokasiAsli, { failOn: 'none' })
        .rotate()
        .resize({ width: lebar, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(path.join(config.uploadDir, namaBerkas));
      varian[nama] = `/uploads/${namaBerkas}`;
    })
  );
  return { lebar: meta.width ?? null, tinggi: meta.height ?? null, varian };
}

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
  const { lebar, tinggi, varian } = await buatVarian(berkas).catch(() => ({
    lebar: null,
    tinggi: null,
    varian: {},
  }));
  const { rows } = await kueri(
    `INSERT INTO media (nama_berkas, url, tipe_mime, ukuran_berkas, id_pengunggah, lebar, tinggi, varian)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, nama_berkas, url, tipe_mime, ukuran_berkas, lebar, tinggi, varian, dibuat_pada`,
    [berkas.originalname, url, berkas.mimetype, berkas.size, idPengunggah, lebar, tinggi, JSON.stringify(varian)]
  );
  return rows[0];
}

export async function hapus(id) {
  const media = await detail(id);
  if (!media) return null;
  await kueri('DELETE FROM media WHERE id = $1', [id]);
  if (media.url.startsWith('/uploads/')) {
    const dasar = path.basename(media.url).replace(/\.[^.]+$/, '');
    const berkasTerkait = await fs.readdir(config.uploadDir).catch(() => []);
    await Promise.all(
      berkasTerkait
        .filter((b) => b === path.basename(media.url) || b.startsWith(`${dasar}-w`))
        .map((b) => fs.unlink(path.join(config.uploadDir, b)).catch(() => {}))
    );
  }
  return media;
}
