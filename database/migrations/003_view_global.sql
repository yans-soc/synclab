-- Migrasi 003: Sistem view global terpadu (single source of truth).
-- artikel.jumlah_dilihat menjadi satu-satunya counter otoritatif; baris di
-- kunjungan_artikel hanya dicatat lewat layanan validasi view terpusat.

ALTER TABLE artikel
    ADD COLUMN IF NOT EXISTS jumlah_dilihat INTEGER NOT NULL DEFAULT 0;

ALTER TABLE kunjungan_artikel
    ADD COLUMN IF NOT EXISTS alamat_ip INET,
    ADD COLUMN IF NOT EXISTS agen_pengguna TEXT,
    ADD COLUMN IF NOT EXISTS id_kunjungan UUID,
    ADD COLUMN IF NOT EXISTS token_kunjungan TEXT,
    ADD COLUMN IF NOT EXISTS sah BOOLEAN NOT NULL DEFAULT TRUE;

-- Index untuk proteksi duplikat & kueri trending/statistik berbasis waktu
CREATE INDEX IF NOT EXISTS idx_kunjungan_ip_artikel_waktu
    ON kunjungan_artikel (alamat_ip, id_artikel, dikunjungi_pada DESC);

CREATE INDEX IF NOT EXISTS idx_kunjungan_token
    ON kunjungan_artikel (token_kunjungan);

-- Backfill counter otoritatif dari data kunjungan yang sudah ada
UPDATE artikel a SET jumlah_dilihat = sub.total
FROM (
    SELECT id_artikel, COUNT(*)::int AS total
    FROM kunjungan_artikel
    WHERE sah = TRUE
    GROUP BY id_artikel
) sub
WHERE a.id = sub.id_artikel;
