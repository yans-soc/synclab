# Dokumentasi Skema Database (schema.md) - SYNCLAB CMS

Dokumen ini berisi definisi struktur database PostgreSQL lengkap untuk **SYNCLAB CMS**. Sesuai dengan aturan proyek, seluruh nama tabel, kolom, dan relasi **menggunakan Bahasa Indonesia**.

---

## 1. Kode DDL SQL (schema.sql)

```sql
-- Ekstensi PostgreSQL untuk UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL PENGGUNA
CREATE TABLE pengguna (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_lengkap VARCHAR(150) NOT NULL,
    surel VARCHAR(255) UNIQUE NOT NULL,
    kata_sandi VARCHAR(255) NOT NULL,
    peran VARCHAR(50) NOT NULL DEFAULT 'penulis' CHECK (peran IN ('admin', 'editor', 'penulis')),
    foto_profil VARCHAR(500),
    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL KATEGORI
CREATE TABLE kategori (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    deskripsi TEXT,
    warna VARCHAR(30) DEFAULT 'primary',
    ikon VARCHAR(100) DEFAULT 'folder',
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL MEDIA
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_berkas VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    tipe_mime VARCHAR(100) NOT NULL,
    ukuran_berkas BIGINT NOT NULL,
    id_pengunggah UUID REFERENCES pengguna(id) ON DELETE SET NULL,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL ARTIKEL
CREATE TABLE artikel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    kutipan TEXT,
    konten TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draf' CHECK (status IN ('draf', 'terbit', 'arsip')),
    id_penulis UUID NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
    id_gambar_unggulan UUID REFERENCES media(id) ON DELETE SET NULL,
    diterbitkan_pada TIMESTAMP WITH TIME ZONE,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL RELASI ARTIKEL - KATEGORI (Junction Table)
CREATE TABLE artikel_kategori (
    id_artikel UUID REFERENCES artikel(id) ON DELETE CASCADE,
    id_kategori UUID REFERENCES kategori(id) ON DELETE CASCADE,
    PRIMARY KEY (id_artikel, id_kategori)
);

-- 6. TABEL BERANDA (Homepage Builder Master)
CREATE TABLE beranda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul VARCHAR(150) NOT NULL,
    versi INTEGER NOT NULL DEFAULT 1,
    aktif BOOLEAN NOT NULL DEFAULT FALSE,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABEL BAGIAN BERANDA (Homepage Sections)
CREATE TABLE bagian_beranda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_beranda UUID NOT NULL REFERENCES beranda(id) ON DELETE CASCADE,
    judul_bagian VARCHAR(150) NOT NULL,
    tipe VARCHAR(50) NOT NULL, -- e.g. 'hero_section', 'explore_topics', 'latest_articles', 'cta_banner'
    posisi INTEGER NOT NULL DEFAULT 0,
    pengaturan JSONB NOT NULL DEFAULT '{}'::jsonb,
    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABEL HALAMAN STATIS
CREATE TABLE halaman (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    konten TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draf' CHECK (status IN ('draf', 'terbit')),
    id_penulis UUID NOT NULL REFERENCES pengguna(id) ON DELETE CASCADE,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABEL METADATA SEO
CREATE TABLE metadata_seo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_artikel UUID UNIQUE REFERENCES artikel(id) ON DELETE CASCADE,
    id_halaman UUID UNIQUE REFERENCES halaman(id) ON DELETE CASCADE,
    judul_seo VARCHAR(150),
    deskripsi_seo TEXT,
    kata_kunci VARCHAR(255),
    url_kanonis VARCHAR(500),
    gambar_og VARCHAR(500)
);

-- 10. TABEL MENU NAVIGASI
CREATE TABLE menu (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(100) NOT NULL,
    lokasi VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'header', 'footer'
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. TABEL ITEM MENU NAVIGASI
CREATE TABLE item_menu (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_menu UUID NOT NULL REFERENCES menu(id) ON DELETE CASCADE,
    id_induk UUID REFERENCES item_menu(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    posisi INTEGER NOT NULL DEFAULT 0,
    ikon VARCHAR(100),
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. TABEL PENGATURAN GLOBAL
CREATE TABLE pengaturan_global (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kunci VARCHAR(100) UNIQUE NOT NULL,
    nilai TEXT NOT NULL,
    deskripsi TEXT,
    tipe_data VARCHAR(30) DEFAULT 'string' CHECK (tipe_data IN ('string', 'boolean', 'integer', 'json')),
    diperbarui_pada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEKS UNTUK OPTIMASI QUERY
CREATE INDEX idx_artikel_slug ON artikel(slug);
CREATE INDEX idx_artikel_status_tgl ON artikel(status, diterbitkan_pada DESC);
CREATE INDEX idx_kategori_slug ON kategori(slug);
CREATE INDEX idx_bagian_beranda_posisi ON bagian_beranda(id_beranda, posisi) WHERE aktif = TRUE;
CREATE INDEX idx_item_menu_posisi ON item_menu(id_menu, posisi);

-- TRIGGER UNTUK OTOMATISASI DIPERBARUI_PADA
CREATE OR REPLACE FUNCTION perbarui_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.diperbarui_pada = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_perbarui_pengguna BEFORE UPDATE ON pengguna FOR EACH ROW EXECUTE FUNCTION perbarui_timestamp();
CREATE TRIGGER trg_perbarui_kategori BEFORE UPDATE ON kategori FOR EACH ROW EXECUTE FUNCTION perbarui_timestamp();
CREATE TRIGGER trg_perbarui_artikel BEFORE UPDATE ON artikel FOR EACH ROW EXECUTE FUNCTION perbarui_timestamp();
CREATE TRIGGER trg_perbarui_beranda BEFORE UPDATE ON beranda FOR EACH ROW EXECUTE FUNCTION perbarui_timestamp();
CREATE TRIGGER trg_perbarui_bagian_beranda BEFORE UPDATE ON bagian_beranda FOR EACH ROW EXECUTE FUNCTION perbarui_timestamp();
CREATE TRIGGER trg_perbarui_halaman BEFORE UPDATE ON halaman FOR EACH ROW EXECUTE FUNCTION perbarui_timestamp();
```
