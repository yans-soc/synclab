import { kueri, denganTransaksi } from '../../database/pool.js';
import { buatSlug } from '../../utils/slug.js';

export async function daftarAdmin() {
  const { rows } = await kueri(
    `SELECT h.id, h.judul, h.slug, h.status, h.diperbarui_pada,
            p.nama_lengkap AS penulis
     FROM halaman h JOIN pengguna p ON p.id = h.id_penulis
     ORDER BY h.diperbarui_pada DESC`
  );
  return rows;
}

export async function detailPublikBySlug(slug) {
  const { rows } = await kueri(
    `SELECT h.id, h.judul, h.slug, h.konten, h.diperbarui_pada,
            jsonb_build_object(
              'judul_seo', ms.judul_seo,
              'deskripsi_seo', ms.deskripsi_seo,
              'kata_kunci', ms.kata_kunci
            ) AS seo
     FROM halaman h
     LEFT JOIN metadata_seo ms ON ms.id_halaman = h.id
     WHERE h.slug = $1 AND h.status = 'terbit'`,
    [slug]
  );
  return rows[0] || null;
}

export async function buat(data, idPenulis) {
  return denganTransaksi(async (klien) => {
    const slug = buatSlug(data.slug || data.judul);
    const { rows } = await klien.query(
      `INSERT INTO halaman (judul, slug, konten, status, id_penulis)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, judul, slug, status`,
      [data.judul, slug, data.konten, data.status, idPenulis]
    );
    if (data.seo) {
      await klien.query(
        `INSERT INTO metadata_seo (id_halaman, judul_seo, deskripsi_seo, kata_kunci, url_kanonis, gambar_og)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id_halaman) DO UPDATE SET
           judul_seo = EXCLUDED.judul_seo, deskripsi_seo = EXCLUDED.deskripsi_seo,
           kata_kunci = EXCLUDED.kata_kunci, url_kanonis = EXCLUDED.url_kanonis,
           gambar_og = EXCLUDED.gambar_og`,
        [rows[0].id, data.seo.judul_seo || null, data.seo.deskripsi_seo || null, data.seo.kata_kunci || null, data.seo.url_kanonis || null, data.seo.gambar_og || null]
      );
    }
    return rows[0];
  });
}

export async function perbarui(id, data) {
  return denganTransaksi(async (klien) => {
    const slug = data.slug || data.judul ? buatSlug(data.slug || data.judul) : null;
    const { rows } = await klien.query(
      `UPDATE halaman SET
         judul = COALESCE($2, judul),
         slug = COALESCE($3, slug),
         konten = COALESCE($4, konten),
         status = COALESCE($5, status)
       WHERE id = $1
       RETURNING id, judul, slug, status`,
      [id, data.judul ?? null, slug, data.konten ?? null, data.status ?? null]
    );
    if (!rows[0]) return null;
    if (data.seo) {
      await klien.query(
        `INSERT INTO metadata_seo (id_halaman, judul_seo, deskripsi_seo, kata_kunci, url_kanonis, gambar_og)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id_halaman) DO UPDATE SET
           judul_seo = EXCLUDED.judul_seo, deskripsi_seo = EXCLUDED.deskripsi_seo,
           kata_kunci = EXCLUDED.kata_kunci, url_kanonis = EXCLUDED.url_kanonis,
           gambar_og = EXCLUDED.gambar_og`,
        [id, data.seo.judul_seo || null, data.seo.deskripsi_seo || null, data.seo.kata_kunci || null, data.seo.url_kanonis || null, data.seo.gambar_og || null]
      );
    }
    return rows[0];
  });
}

export async function hapus(id) {
  const { rows } = await kueri('DELETE FROM halaman WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}
