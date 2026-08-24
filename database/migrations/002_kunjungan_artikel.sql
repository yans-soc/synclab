-- Migrasi 002: Tabel kunjungan artikel untuk fitur Trending Articles
-- Mencatat setiap kunjungan halaman detail artikel agar artikel terpopuler
-- 7 hari terakhir bisa dihitung secara realtime.

CREATE TABLE IF NOT EXISTS kunjungan_artikel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_artikel UUID NOT NULL REFERENCES artikel(id) ON DELETE CASCADE,
    dikunjungi_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kunjungan_artikel_waktu
    ON kunjungan_artikel (dikunjungi_pada);

CREATE INDEX IF NOT EXISTS idx_kunjungan_artikel_artikel_waktu
    ON kunjungan_artikel (id_artikel, dikunjungi_pada);
