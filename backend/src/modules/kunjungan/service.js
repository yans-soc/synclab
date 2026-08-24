import crypto from 'node:crypto';
import { kueri, denganTransaksi } from '../../database/pool.js';
import { config } from '../../config.js';

// ============================================================================
// LAYANAN VALIDASI VIEW TERPUSAT (Qualified View Validation Service)
// Satu-satunya jalur yang boleh menambah jumlah_dilihat artikel.
// Tidak ada kode lain yang boleh menjalankan view_count = view_count + 1.
// ============================================================================

const MASA_TOKEN_DETIK = 3600; // token kunjungan kedaluwarsa 1 jam
const MASA_KLAIM_DETIK = 300; // view harus diklaim maks. 5 menit setelah mulai baca
const COOLDOWN_JAM = 24; // view baru dari IP yang sama diabaikan dalam 24 jam

// Pola user-agent bot/crawler/seo/prefetch yang selalu ditolak
const POLA_BOT =
  /bot|crawler|spider|slurp|scrap|crawl|headless|phantom|selenium|puppeteer|playwright|wget|curl|httpclient|python-requests|go-http-client|facebookexternalhit|twitterbot|whatsapp|telegrambot|linkedinbot|discordbot|slackbot|google-?read|bingpreview|ahrefs|semrush|mj12bot|dotbot|petalbot|bytespider|preview|prefetch|uptime|pingdom|lighthouse|pagespeed/i;

export function terlihatSepertiBot(agenPengguna = '') {
  return agenPengguna.length < 12 || POLA_BOT.test(agenPengguna);
}

// Token HMAC untuk membuktikan kunjungan bermula dari respons server yang sah.
// Tidak menyimpan IP/identitas di token; hanya id artikel + id kunjungan + waktu.
function tandaTangan(idArtikel, idKunjungan, waktu) {
  const rahasia = config.jwtSecret;
  return crypto
    .createHmac('sha256', rahasia)
    .update(`${idArtikel}.${idKunjungan}.${waktu}`)
    .digest('hex');
}

export function buatTokenKunjungan(idArtikel) {
  const idKunjungan = crypto.randomUUID();
  const waktu = Date.now();
  const token = `${idKunjungan}.${waktu}.${tandaTangan(idArtikel, idKunjungan, waktu)}`;
  return { idKunjungan, token, waktu };
}

export function validasiTokenKunjungan(idArtikel, token) {
  if (typeof token !== 'string') return null;
  const [idKunjungan, waktuMentah, ttd] = token.split('.');
  const waktu = Number(waktuMentah);
  if (!idKunjungan || !Number.isFinite(waktu) || !ttd) return null;
  if (tandaTangan(idArtikel, idKunjungan, waktu) !== ttd) return null;
  if (Date.now() - waktu > MASA_TOKEN_DETIK * 1000) return null;
  return { idKunjungan, waktu };
}

function alamatIp(req) {
  // x-forwarded-for diisi Nginx; ambil hop pertama (klien asli)
  const xf = req.headers['x-forwarded-for'];
  const ip = typeof xf === 'string' && xf.length ? xf.split(',')[0].trim() : req.socket.remoteAddress;
  return ip ? ip.replace(/^::ffff:/, '') : null;
}

// Mencatat view yang sah secara atomik: baris kunjungan + increment counter
// dalam SATU transaksi PostgreSQL. Nilai kembalian: counter otoritatif terbaru.
export async function catatViewSah({ req, slugArtikel, token }) {
  const agen = String(req.headers['user-agent'] || '');
  const ip = alamatIp(req);
  const durasiDetik = Math.max(0, Number(req.body?.durasi_detik) || 0);

  // 1. Tolak bot/crawler/prefetch
  if (terlihatSepertiBot(agen)) {
    return { dicatat: false, alasan: 'bot' };
  }

  // 2. Wajib ada keterlibatan nyata: minimal 10 detik aktif di halaman detail
  if (durasiDetik < 10) {
    return { dicatat: false, alasan: 'durasi_kurang' };
  }

  // 3. Cari artikel terbit
  const { rows: artikelRows } = await kueri(
    `SELECT id, jumlah_dilihat FROM artikel WHERE slug = $1 AND status = 'terbit'`,
    [slugArtikel]
  );
  const artikel = artikelRows[0];
  if (!artikel) return { dicatat: false, alasan: 'tidak_ditemukan' };

  // 4. Validasi token kunjungan (menolak request palsu/refresh tak berawal sah)
  const infoToken = validasiTokenKunjungan(artikel.id, token);
  if (!infoToken) return { dicatat: false, alasan: 'token_tidak_sah' };
  if (Date.now() - infoToken.waktu > MASA_KLAIM_DETIK * 1000) {
    return { dicatat: false, alasan: 'token_kedaluwarsa' };
  }

  // 5. Proteksi duplikat: token yang sama hanya boleh tercatat sekali
  const { rows: duplikatToken } = await kueri(
    `SELECT 1 FROM kunjungan_artikel
     WHERE id_kunjungan = $1 AND sah = TRUE LIMIT 1`,
    [infoToken.idKunjungan]
  );
  if (duplikatToken.length) {
    const { rows } = await kueri('SELECT jumlah_dilihat FROM artikel WHERE id = $1', [artikel.id]);
    return { dicatat: false, alasan: 'duplikat', jumlah_dilihat: rows[0]?.jumlah_dilihat ?? 0 };
  }

  // 6. Cooldown: IP yang sama untuk artikel yang sama tidak dihitung ulang 24 jam
  if (ip) {
    const { rows: baruBaru } = await kueri(
      `SELECT 1 FROM kunjungan_artikel
       WHERE alamat_ip = $1 AND id_artikel = $2 AND sah = TRUE
         AND dikunjungi_pada >= now() - ($3 || ' hours')::interval
       LIMIT 1`,
      [ip, artikel.id, COOLDOWN_JAM]
    );
    if (baruBaru.length) {
      const { rows } = await kueri('SELECT jumlah_dilihat FROM artikel WHERE id = $1', [artikel.id]);
      return { dicatat: false, alasan: 'cooldown', jumlah_dilihat: rows[0]?.jumlah_dilihat ?? 0 };
    }
  }

  // 7. Transaksi atomik: catat baris view sah + increment counter otoritatif
  return denganTransaksi(async (klien) => {
    const { rows } = await klien.query(
      `UPDATE artikel SET jumlah_dilihat = jumlah_dilihat + 1
       WHERE id = $1 RETURNING jumlah_dilihat`,
      [artikel.id]
    );
    await klien.query(
      `INSERT INTO kunjungan_artikel
         (id_artikel, alamat_ip, agen_pengguna, id_kunjungan, token_kunjungan, sah)
       VALUES ($1, $2, $3, $4, $5, TRUE)`,
      [artikel.id, ip, agen.slice(0, 500), infoToken.idKunjungan, token.slice(0, 120)]
    );
    return { dicatat: true, jumlah_dilihat: rows[0].jumlah_dilihat };
  });
}

// Statistik admin per artikel, semuanya dari sumber data yang sama.
export async function statistikArtikel(idArtikel) {
  const { rows } = await kueri(
    `SELECT
       a.jumlah_dilihat AS total_view,
       (SELECT COUNT(*)::int FROM kunjungan_artikel k
         WHERE k.id_artikel = a.id AND k.sah = TRUE) AS total_view_sah,
       (SELECT COUNT(DISTINCT k.alamat_ip)::int FROM kunjungan_artikel k
         WHERE k.id_artikel = a.id AND k.sah = TRUE AND k.alamat_ip IS NOT NULL) AS pengunjung_unik,
       (SELECT COUNT(*)::int FROM kunjungan_artikel k
         WHERE k.id_artikel = a.id AND k.sah = TRUE
           AND k.dikunjungi_pada >= date_trunc('day', now())) AS view_hari_ini,
       (SELECT COUNT(*)::int FROM kunjungan_artikel k
         WHERE k.id_artikel = a.id AND k.sah = TRUE
           AND k.dikunjungi_pada >= now() - INTERVAL '7 days') AS view_7_hari,
       (SELECT COUNT(*)::int FROM kunjungan_artikel k
         WHERE k.id_artikel = a.id AND k.sah = TRUE
           AND k.dikunjungi_pada >= now() - INTERVAL '30 days') AS view_30_hari,
       (SELECT COUNT(*)::int + 1 FROM artikel b
         WHERE b.status = 'terbit'
           AND (b.jumlah_dilihat > a.jumlah_dilihat
             OR (b.jumlah_dilihat = a.jumlah_dilihat AND b.id < a.id))) AS peringkat_populer
     FROM artikel a
     WHERE a.id = $1`,
    [idArtikel]
  );
  if (!rows[0]) return null;

  const harian = await kueri(
    `SELECT to_char(date_trunc('day', dikunjungi_pada), 'YYYY-MM-DD') AS tanggal,
            COUNT(*)::int AS view
     FROM kunjungan_artikel
     WHERE id_artikel = $1 AND sah = TRUE
       AND dikunjungi_pada >= now() - INTERVAL '30 days'
     GROUP BY 1 ORDER BY 1`,
    [idArtikel]
  );
  return { ...rows[0], harian: harian.rows };
}
