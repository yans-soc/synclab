-- Migrasi 004: performa & media responsif
-- Index mengikuti pola query aktual; kolom media mendukung varian responsive
-- dan reservasi dimensi (CLS) di frontend.

-- Filter halaman kategori: WHERE id_kategori = ? (PK berarah sebaliknya)
CREATE INDEX IF NOT EXISTS idx_artikel_kategori_kategori
    ON artikel_kategori(id_kategori, id_artikel);

-- Urutan populer: WHERE status = 'terbit' ORDER BY jumlah_dilihat DESC
CREATE INDEX IF NOT EXISTS idx_artikel_status_views
    ON artikel(status, jumlah_dilihat DESC);

-- Dimensi & varian responsive media (webp: thumbnail/small/medium/large)
ALTER TABLE media ADD COLUMN IF NOT EXISTS lebar INTEGER;
ALTER TABLE media ADD COLUMN IF NOT EXISTS tinggi INTEGER;
ALTER TABLE media ADD COLUMN IF NOT EXISTS varian JSONB NOT NULL DEFAULT '{}'::jsonb;
