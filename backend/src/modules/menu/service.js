import { kueri } from '../../database/pool.js';

export async function daftarByLokasi(lokasi) {
  const { rows } = await kueri(
    `SELECT im.id, im.id_induk, im.label, im.url, im.posisi, im.ikon
     FROM item_menu im
     JOIN menu m ON m.id = im.id_menu
     WHERE m.lokasi = $1
     ORDER BY im.posisi`,
    [lokasi]
  );
  return rows;
}

export async function daftarMenu() {
  const { rows } = await kueri(
    `SELECT m.id, m.nama, m.lokasi,
            COALESCE((
              SELECT jsonb_agg(jsonb_build_object(
                'id', im.id, 'id_induk', im.id_induk, 'label', im.label,
                'url', im.url, 'posisi', im.posisi, 'ikon', im.ikon
              ) ORDER BY im.posisi)
              FROM item_menu im WHERE im.id_menu = m.id
            ), '[]'::jsonb) AS item
     FROM menu m ORDER BY m.lokasi`
  );
  return rows;
}

export async function buatMenu(data) {
  const { rows } = await kueri(
    'INSERT INTO menu (nama, lokasi) VALUES ($1, $2) RETURNING id, nama, lokasi',
    [data.nama, data.lokasi]
  );
  return rows[0];
}

export async function tambahItem(idMenu, data) {
  const { rows } = await kueri(
    `INSERT INTO item_menu (id_menu, id_induk, label, url, posisi, ikon)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, id_menu, id_induk, label, url, posisi, ikon`,
    [idMenu, data.id_induk || null, data.label, data.url, data.posisi, data.ikon || null]
  );
  return rows[0];
}

export async function perbaruiItem(id, data) {
  const { rows } = await kueri(
    `UPDATE item_menu SET
       id_induk = COALESCE($2, id_induk),
       label = COALESCE($3, label),
       url = COALESCE($4, url),
       posisi = COALESCE($5, posisi),
       ikon = COALESCE($6, ikon)
     WHERE id = $1
     RETURNING id, id_menu, id_induk, label, url, posisi, ikon`,
    [id, data.id_induk ?? null, data.label ?? null, data.url ?? null, data.posisi ?? null, data.ikon ?? null]
  );
  return rows[0] || null;
}

export async function hapusItem(id) {
  const { rows } = await kueri('DELETE FROM item_menu WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}
