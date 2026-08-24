import { kueri } from '../../database/pool.js';

export async function daftar() {
  const { rows } = await kueri(
    `SELECT k.id, k.nama, k.slug, k.deskripsi, k.warna, k.ikon,
            (SELECT COUNT(*) FROM artikel_kategori ak JOIN artikel a ON a.id = ak.id_artikel WHERE ak.id_kategori = k.id AND a.status = 'terbit')::int AS jumlah_artikel
     FROM kategori k ORDER BY k.nama`
  );
  return rows;
}

export async function buat(data) {
  const { rows } = await kueri(
    `INSERT INTO kategori (nama, slug, deskripsi, warna, ikon)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nama, slug, deskripsi, warna, ikon`,
    [data.nama, data.slug, data.deskripsi || null, data.warna, data.ikon]
  );
  return rows[0];
}

export async function perbarui(id, data) {
  const { rows } = await kueri(
    `UPDATE kategori SET
       nama = COALESCE($2, nama),
       slug = COALESCE($3, slug),
       deskripsi = COALESCE($4, deskripsi),
       warna = COALESCE($5, warna),
       ikon = COALESCE($6, ikon)
     WHERE id = $1
     RETURNING id, nama, slug, deskripsi, warna, ikon`,
    [id, data.nama ?? null, data.slug ?? null, data.deskripsi ?? null, data.warna ?? null, data.ikon ?? null]
  );
  return rows[0] || null;
}

export async function hapus(id) {
  const { rows } = await kueri('DELETE FROM kategori WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}
