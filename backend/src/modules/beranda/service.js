import { kueri, denganTransaksi } from '../../database/pool.js';
import { daftarPublik, daftarTrending } from '../artikel/service.js';
import { daftar as daftarKategori } from '../kategori/service.js';

export async function berandaAktif({ lengkap = false } = {}) {
  const { rows } = await kueri(
    `SELECT b.id AS id_beranda, b.judul AS judul_beranda,
            COALESCE((
              SELECT jsonb_agg(jsonb_build_object(
                'id', bb.id,
                'judul_bagian', bb.judul_bagian,
                'tipe', bb.tipe,
                'posisi', bb.posisi,
                'pengaturan', bb.pengaturan
              ) ORDER BY bb.posisi)
              FROM bagian_beranda bb
              WHERE bb.id_beranda = b.id AND bb.aktif = TRUE
            ), '[]'::jsonb) AS bagian
     FROM beranda b
     WHERE b.aktif = TRUE
     ORDER BY b.versi DESC
     LIMIT 1`
  );
  const beranda = rows[0] || null;
  if (!beranda || !lengkap) return beranda;

  // Mode komposit: data seluruh seksi dalam SATU respons agar homepage tidak
  // membuat waterfall 4 request (struktur + kategori + terbaru + trending).
  const cariBagian = (tipe) => beranda.bagian.find((b) => b.tipe === tipe);
  const kebutuhan = new Set(beranda.bagian.map((b) => b.tipe));
  const jumlahTerbaru = cariBagian('latest_articles')?.pengaturan?.jumlah_tampil || 6;
  const jumlahTrending = cariBagian('trending_articles')?.pengaturan?.jumlah_tampil || 6;
  const [kategori, terbaru, trending] = await Promise.all([
    kebutuhan.has('explore_topics') ? daftarKategori() : Promise.resolve(null),
    kebutuhan.has('latest_articles')
      ? daftarPublik({ limit: jumlahTerbaru }).then((r) => r.data)
      : Promise.resolve(null),
    kebutuhan.has('trending_articles') ? daftarTrending(jumlahTrending) : Promise.resolve(null),
  ]);
  beranda.data = { kategori, artikel_terbaru: terbaru, trending };
  return beranda;
}

export async function daftarBeranda() {
  const { rows } = await kueri(
    `SELECT b.id, b.judul, b.versi, b.aktif, b.dibuat_pada, b.diperbarui_pada,
            (SELECT COUNT(*) FROM bagian_beranda bb WHERE bb.id_beranda = b.id)::int AS jumlah_bagian
     FROM beranda b ORDER BY b.versi DESC`
  );
  return rows;
}

export async function detailBeranda(id) {
  const { rows } = await kueri(
    `SELECT b.id, b.judul, b.versi, b.aktif,
            COALESCE((
              SELECT jsonb_agg(jsonb_build_object(
                'id', bb.id, 'judul_bagian', bb.judul_bagian, 'tipe', bb.tipe,
                'posisi', bb.posisi, 'pengaturan', bb.pengaturan, 'aktif', bb.aktif
              ) ORDER BY bb.posisi)
              FROM bagian_beranda bb WHERE bb.id_beranda = b.id
            ), '[]'::jsonb) AS bagian
     FROM beranda b WHERE b.id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function buatBeranda(judul) {
  const { rows } = await kueri(
    `INSERT INTO beranda (judul, versi)
     VALUES ($1, COALESCE((SELECT MAX(versi) + 1 FROM beranda), 1))
     RETURNING id, judul, versi, aktif`,
    [judul]
  );
  return rows[0];
}

export async function aturAktifBeranda(id, aktif) {
  return denganTransaksi(async (klien) => {
    const ada = await klien.query('SELECT id FROM beranda WHERE id = $1', [id]);
    if (!ada.rows[0]) return null;
    if (aktif) {
      await klien.query('UPDATE beranda SET aktif = FALSE WHERE aktif = TRUE AND id <> $1', [id]);
    }
    const { rows } = await klien.query(
      'UPDATE beranda SET aktif = $2 WHERE id = $1 RETURNING id, judul, versi, aktif',
      [id, aktif]
    );
    return rows[0];
  });
}

export async function buatBagian(idBeranda, data) {
  const { rows } = await kueri(
    `INSERT INTO bagian_beranda (id_beranda, judul_bagian, tipe, posisi, pengaturan, aktif)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, id_beranda, judul_bagian, tipe, posisi, pengaturan, aktif`,
    [idBeranda, data.judul_bagian, data.tipe, data.posisi, JSON.stringify(data.pengaturan), data.aktif]
  );
  return rows[0];
}

export async function perbaruiBagian(id, data) {
  const { rows } = await kueri(
    `UPDATE bagian_beranda SET
       judul_bagian = COALESCE($2, judul_bagian),
       tipe = COALESCE($3, tipe),
       posisi = COALESCE($4, posisi),
       pengaturan = COALESCE($5, pengaturan),
       aktif = COALESCE($6, aktif)
     WHERE id = $1
     RETURNING id, id_beranda, judul_bagian, tipe, posisi, pengaturan, aktif`,
    [id, data.judul_bagian ?? null, data.tipe ?? null, data.posisi ?? null,
     data.pengaturan ? JSON.stringify(data.pengaturan) : null, data.aktif ?? null]
  );
  return rows[0] || null;
}

export async function hapusBagian(id) {
  const { rows } = await kueri('DELETE FROM bagian_beranda WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}

export async function duplikatBagian(id) {
  const { rows } = await kueri(
    `INSERT INTO bagian_beranda (id_beranda, judul_bagian, tipe, posisi, pengaturan, aktif)
     SELECT id_beranda, judul_bagian || ' (Salinan)', tipe,
            COALESCE((SELECT MAX(posisi) + 1 FROM bagian_beranda bb2 WHERE bb2.id_beranda = bb.id_beranda), 0),
            pengaturan, FALSE
     FROM bagian_beranda bb WHERE id = $1
     RETURNING id, id_beranda, judul_bagian, tipe, posisi, pengaturan, aktif`,
    [id]
  );
  return rows[0] || null;
}

export async function susunUlangBagian(idBeranda, urutan) {
  return denganTransaksi(async (klien) => {
    for (const item of urutan) {
      await klien.query(
        'UPDATE bagian_beranda SET posisi = $2 WHERE id = $1 AND id_beranda = $3',
        [item.id, item.posisi, idBeranda]
      );
    }
    return detailBeranda(idBeranda);
  });
}
