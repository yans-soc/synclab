import { kueri } from '../../database/pool.js';

export async function semua() {
  const { rows } = await kueri(
    'SELECT kunci, nilai, deskripsi, tipe_data FROM pengaturan_global ORDER BY kunci'
  );
  return Object.fromEntries(rows.map((r) => [r.kunci, r.nilai]));
}

export async function daftarLengkap() {
  const { rows } = await kueri(
    'SELECT id, kunci, nilai, deskripsi, tipe_data, diperbarui_pada FROM pengaturan_global ORDER BY kunci'
  );
  return rows;
}

export async function simpanMassal(pengaturan) {
  const hasil = [];
  for (const item of pengaturan) {
    const { rows } = await kueri(
      `INSERT INTO pengaturan_global (kunci, nilai) VALUES ($1, $2)
       ON CONFLICT (kunci) DO UPDATE SET nilai = EXCLUDED.nilai
       RETURNING kunci, nilai`,
      [item.kunci, item.nilai]
    );
    hasil.push(rows[0]);
  }
  return hasil;
}
