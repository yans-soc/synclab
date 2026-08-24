import { kueri, denganTransaksi } from '../../database/pool.js';
import { buatSlug } from '../../utils/slug.js';
import { buatTokenKunjungan, terlihatSepertiBot } from '../kunjungan/service.js';

const SELECT_PUBLIK = `
  SELECT a.id, a.judul, a.slug, a.kutipan, a.diterbitkan_pada, a.jumlah_dilihat,
         m.url AS gambar_unggulan,
         p.nama_lengkap AS penulis_nama, p.foto_profil AS penulis_foto,
         COALESCE((
           SELECT jsonb_agg(jsonb_build_object('nama', kat.nama, 'slug', kat.slug, 'warna', kat.warna))
           FROM artikel_kategori ak
           JOIN kategori kat ON kat.id = ak.id_kategori
           WHERE ak.id_artikel = a.id
         ), '[]'::jsonb) AS kategori
  FROM artikel a
  LEFT JOIN media m ON m.id = a.id_gambar_unggulan
  JOIN pengguna p ON p.id = a.id_penulis
`;

function bentukArtikelPublik(baris) {
  return {
    id: baris.id,
    judul: baris.judul,
    slug: baris.slug,
    kutipan: baris.kutipan,
    diterbitkan_pada: baris.diterbitkan_pada,
    gambar_unggulan: baris.gambar_unggulan,
    jumlah_dilihat: baris.jumlah_dilihat,
    penulis: {
      nama_lengkap: baris.penulis_nama,
      foto_profil: baris.penulis_foto,
    },
    kategori: baris.kategori,
  };
}

export async function daftarPublik({ kategori, halaman = 1, limit = 10, urutkan }) {
  const offset = (halaman - 1) * limit;
  const params = [];
  let klausa = "WHERE a.status = 'terbit'";
  if (kategori) {
    params.push(kategori);
    klausa += ` AND EXISTS (
      SELECT 1 FROM artikel_kategori ak
      JOIN kategori k ON k.id = ak.id_kategori
      WHERE ak.id_artikel = a.id AND k.slug = $${params.length}
    )`;
  }
  const { rows: totalRows } = await kueri(
    `SELECT COUNT(*)::int AS total FROM artikel a ${klausa}`,
    params
  );
  const total = totalRows[0].total;
  params.push(limit, offset);
  // populer = counter view otoritatif terbanyak; bawaan = artikel terbit terbaru
  const urutan =
    urutkan === 'populer'
      ? 'ORDER BY a.jumlah_dilihat DESC, a.diterbitkan_pada DESC, a.id'
      : 'ORDER BY a.diterbitkan_pada DESC, a.id';
  const { rows } = await kueri(
    `${SELECT_PUBLIK} ${klausa}
     ${urutan}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return {
    data: rows.map(bentukArtikelPublik),
    meta: {
      halaman,
      limit,
      total_item: total,
      total_halaman: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

// Trending = view sah terbanyak 7 hari terakhir; artikel tanpa kunjungan
// diurutkan deterministik (terbit terbaru, lalu id) sehingga tampilan tetap stabil.
export async function daftarTrending(limit = 6) {
  const { rows } = await kueri(
    `${SELECT_PUBLIK.replace('a.id,', 'a.id, kv.kunjungan_7_hari,')}
     LEFT JOIN (
       SELECT id_artikel, COUNT(*)::int AS kunjungan_7_hari
       FROM kunjungan_artikel
       WHERE sah = TRUE AND dikunjungi_pada >= now() - INTERVAL '7 days'
       GROUP BY id_artikel
     ) kv ON kv.id_artikel = a.id
     WHERE a.status = 'terbit'
     ORDER BY COALESCE(kv.kunjungan_7_hari, 0) DESC, a.diterbitkan_pada DESC, a.id
     LIMIT $1`,
    [limit]
  );
  return rows.map((r) => ({
    ...bentukArtikelPublik(r),
    view_periode: r.kunjungan_7_hari ?? 0,
  }));
}

// Detail publik TIDAK menambah view — view hanya bertambah lewat klaim
// tervalidasi (POST /api/v1/kunjungan/:slug). Token kunjungan disertakan agar
// frontend bisa mengklaim setelah pembaca aktif >= 10 detik.
export async function detailPublikBySlug(slug, { agenPengguna = '' } = {}) {
  const { rows } = await kueri(
    `${SELECT_PUBLIK.replace('a.id,', 'a.id, a.konten,')}
     WHERE a.slug = $1 AND a.status = 'terbit'`,
    [slug]
  );
  if (!rows[0]) return null;
  const seo = await kueri(
    `SELECT judul_seo, deskripsi_seo, kata_kunci, url_kanonis, gambar_og
     FROM metadata_seo WHERE id_artikel = $1`,
    [rows[0].id]
  );
  // Token hanya diberikan ke user-agent manusia; bot/crawler tidak bisa klaim
  const token = terlihatSepertiBot(agenPengguna)
    ? null
    : buatTokenKunjungan(rows[0].id).token;
  return {
    ...bentukArtikelPublik(rows[0]),
    konten: rows[0].konten,
    seo: seo.rows[0] || null,
    token_kunjungan: token,
  };
}

export async function daftarAdmin({ status, cari, halaman = 1, limit = 10 }) {
  const offset = (halaman - 1) * limit;
  const params = [];
  const klausa = [];
  if (status) {
    params.push(status);
    klausa.push(`a.status = $${params.length}`);
  }
  if (cari) {
    params.push(`%${cari}%`);
    klausa.push(`a.judul ILIKE $${params.length}`);
  }
  const where = klausa.length ? `WHERE ${klausa.join(' AND ')}` : '';
  const { rows: totalRows } = await kueri(
    `SELECT COUNT(*)::int AS total FROM artikel a ${where}`,
    params
  );
  const total = totalRows[0].total;
  params.push(limit, offset);
  const { rows } = await kueri(
    `${SELECT_PUBLIK.replace('a.id,', 'a.id, a.status, a.dibuat_pada, a.diperbarui_pada,')}
     ${where}
     ORDER BY a.diperbarui_pada DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return {
    data: rows.map((r) => ({
      ...bentukArtikelPublik(r),
      status: r.status,
      dibuat_pada: r.dibuat_pada,
      diperbarui_pada: r.diperbarui_pada,
    })),
    meta: {
      halaman,
      limit,
      total_item: total,
      total_halaman: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function detailAdmin(id) {
  const { rows } = await kueri(
    `${SELECT_PUBLIK.replace('a.id,', 'a.id, a.konten, a.status, a.id_gambar_unggulan,')}
     WHERE a.id = $1`,
    [id]
  );
  if (!rows[0]) return null;
  const seo = await kueri(
    `SELECT judul_seo, deskripsi_seo, kata_kunci, url_kanonis, gambar_og
     FROM metadata_seo WHERE id_artikel = $1`,
    [id]
  );
  const kategoriIds = await kueri(
    'SELECT id_kategori FROM artikel_kategori WHERE id_artikel = $1',
    [id]
  );
  return {
    ...bentukArtikelPublik(rows[0]),
    konten: rows[0].konten,
    status: rows[0].status,
    id_gambar_unggulan: rows[0].id_gambar_unggulan,
    kategori_ids: kategoriIds.rows.map((r) => r.id_kategori),
    seo: seo.rows[0] || null,
  };
}

async function pastikanSlugUnik(klien, slug, idKecuali = null) {
  const { rows } = await klien.query(
    `SELECT 1 FROM artikel WHERE slug = $1 ${idKecuali ? 'AND id <> $2' : ''} LIMIT 1`,
    idKecuali ? [slug, idKecuali] : [slug]
  );
  if (rows.length === 0) return slug;
  let i = 2;
  while (true) {
    const kandidat = `${slug}-${i}`;
    const ada = await klien.query(
      `SELECT 1 FROM artikel WHERE slug = $1 ${idKecuali ? 'AND id <> $2' : ''} LIMIT 1`,
      idKecuali ? [kandidat, idKecuali] : [kandidat]
    );
    if (ada.rows.length === 0) return kandidat;
    i += 1;
  }
}

async function simpanSeo(klien, idArtikel, seo) {
  if (!seo) return;
  await klien.query(
    `INSERT INTO metadata_seo (id_artikel, judul_seo, deskripsi_seo, kata_kunci, url_kanonis, gambar_og)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id_artikel) DO UPDATE SET
       judul_seo = EXCLUDED.judul_seo,
       deskripsi_seo = EXCLUDED.deskripsi_seo,
       kata_kunci = EXCLUDED.kata_kunci,
       url_kanonis = EXCLUDED.url_kanonis,
       gambar_og = EXCLUDED.gambar_og`,
    [idArtikel, seo.judul_seo || null, seo.deskripsi_seo || null, seo.kata_kunci || null, seo.url_kanonis || null, seo.gambar_og || null]
  );
}

export async function buat(data, idPenulis) {
  return denganTransaksi(async (klien) => {
    const slug = await pastikanSlugUnik(klien, buatSlug(data.slug || data.judul));
    const diterbitkanPada = data.status === 'terbit' ? new Date() : null;
    const { rows } = await klien.query(
      `INSERT INTO artikel (judul, slug, kutipan, konten, status, id_penulis, id_gambar_unggulan, diterbitkan_pada)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, judul, slug, status`,
      [data.judul, slug, data.kutipan || null, data.konten, data.status, idPenulis, data.id_gambar_unggulan || null, diterbitkanPada]
    );
    const artikel = rows[0];
    for (const idKategori of data.kategori_ids) {
      await klien.query(
        'INSERT INTO artikel_kategori (id_artikel, id_kategori) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [artikel.id, idKategori]
      );
    }
    await simpanSeo(klien, artikel.id, data.seo);
    return artikel;
  });
}

export async function perbarui(id, data) {
  return denganTransaksi(async (klien) => {
    const ada = await klien.query('SELECT id, status FROM artikel WHERE id = $1', [id]);
    if (!ada.rows[0]) return null;
    const sebelumnya = ada.rows[0];

    const slug = data.slug || data.judul
      ? await pastikanSlugUnik(klien, buatSlug(data.slug || data.judul), id)
      : undefined;
    const terbitBaru = data.status === 'terbit' && sebelumnya.status !== 'terbit'
      ? new Date()
      : undefined;

    const { rows } = await klien.query(
      `UPDATE artikel SET
         judul = COALESCE($2, judul),
         slug = COALESCE($3, slug),
         kutipan = COALESCE($4, kutipan),
         konten = COALESCE($5, konten),
         status = COALESCE($6, status),
         id_gambar_unggulan = COALESCE($7, id_gambar_unggulan),
         diterbitkan_pada = COALESCE($8, diterbitkan_pada)
       WHERE id = $1
       RETURNING id, judul, slug, status`,
      [id, data.judul ?? null, slug ?? null, data.kutipan ?? null, data.konten ?? null, data.status ?? null, data.id_gambar_unggulan ?? null, terbitBaru ?? null]
    );
    if (data.kategori_ids) {
      await klien.query('DELETE FROM artikel_kategori WHERE id_artikel = $1', [id]);
      for (const idKategori of data.kategori_ids) {
        await klien.query(
          'INSERT INTO artikel_kategori (id_artikel, id_kategori) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, idKategori]
        );
      }
    }
    await simpanSeo(klien, id, data.seo);
    return rows[0];
  });
}

export async function hapus(id) {
  const { rows } = await kueri('DELETE FROM artikel WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}
