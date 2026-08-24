-- Migration 005: full Indonesian -> English rename of the live database.
-- Renames tables, columns, indexes, triggers, the updated_at trigger function,
-- migrates status/role values, global setting keys, homepage section JSONB keys,
-- menu item URLs, and translates seed content. Fully idempotent: every step is
-- guarded so it is a no-op on databases that are already in English.

-- ============================ 1. TABLE RENAMES ============================
DO $$
DECLARE
  tbl_map jsonb := '{
    "pengguna": "users",
    "kategori": "categories",
    "artikel": "articles",
    "artikel_kategori": "article_categories",
    "beranda": "homepages",
    "bagian_beranda": "homepage_sections",
    "halaman": "pages",
    "metadata_seo": "seo_metadata",
    "menu": "menus",
    "item_menu": "menu_items",
    "pengaturan_global": "global_settings",
    "kunjungan_artikel": "article_visits"
  }';
  old_t text;
BEGIN
  FOR old_t IN SELECT jsonb_object_keys(tbl_map) LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = old_t)
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_map->>old_t) THEN
      EXECUTE format('ALTER TABLE %I RENAME TO %I', old_t, tbl_map->>old_t);
    END IF;
  END LOOP;
END $$;

-- ============================ 2. COLUMN RENAMES ===========================
DO $$
DECLARE
  renames jsonb := '{
    "users": [["aktif","active"],["nama_lengkap","full_name"],["surel","email"],["kata_sandi","password"],["peran","role"],["foto_profil","profile_photo"],["dibuat_pada","created_at"],["diperbarui_pada","updated_at"]],
    "categories": [["nama","name"],["deskripsi","description"],["warna","color"],["ikon","icon"],["dibuat_pada","created_at"],["diperbarui_pada","updated_at"]],
    "media": [["nama_berkas","file_name"],["tipe_mime","mime_type"],["ukuran_berkas","file_size"],["id_pengunggah","uploader_id"],["dibuat_pada","created_at"],["lebar","width"],["tinggi","height"],["varian","variants"]],
    "articles": [["judul","title"],["kutipan","excerpt"],["konten","content"],["id_penulis","author_id"],["id_gambar_unggulan","featured_image_id"],["diterbitkan_pada","published_at"],["dibuat_pada","created_at"],["diperbarui_pada","updated_at"],["jumlah_dilihat","view_count"]],
    "article_categories": [["id_artikel","article_id"],["id_kategori","category_id"]],
    "homepages": [["judul","title"],["versi","version"],["aktif","active"],["dibuat_pada","created_at"],["diperbarui_pada","updated_at"]],
    "homepage_sections": [["id_beranda","homepage_id"],["judul_bagian","section_title"],["tipe","type"],["posisi","position"],["pengaturan","settings"],["aktif","active"],["dibuat_pada","created_at"],["diperbarui_pada","updated_at"]],
    "pages": [["judul","title"],["konten","content"],["id_penulis","author_id"],["dibuat_pada","created_at"],["diperbarui_pada","updated_at"]],
    "seo_metadata": [["id_artikel","article_id"],["id_halaman","page_id"],["judul_seo","seo_title"],["deskripsi_seo","seo_description"],["kata_kunci","seo_keywords"],["url_kanonis","canonical_url"],["gambar_og","og_image"]],
    "menus": [["nama","name"],["lokasi","location"],["dibuat_pada","created_at"],["diperbarui_pada","updated_at"]],
    "menu_items": [["id_menu","menu_id"],["id_induk","parent_id"],["posisi","position"],["ikon","icon"],["dibuat_pada","created_at"]],
    "global_settings": [["kunci","key"],["nilai","value"],["deskripsi","description"],["tipe_data","data_type"],["diperbarui_pada","updated_at"]],
    "article_visits": [["id_artikel","article_id"],["dikunjungi_pada","visited_at"],["alamat_ip","ip_address"],["agen_pengguna","user_agent"],["id_kunjungan","visit_id"],["token_kunjungan","visit_token"],["sah","valid"]]
  }';
  t text;
  pair jsonb;
BEGIN
  FOR t IN SELECT jsonb_object_keys(renames) LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t) THEN
      FOR pair IN SELECT * FROM jsonb_array_elements(renames->t) LOOP
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = pair->>0)
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = pair->>1) THEN
          EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', t, pair->>0, pair->>1);
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- =============== 2.5. FIX UPDATED_AT TRIGGER FUNCTION BODY ===============
-- The old perbarui_timestamp() function references NEW.diperbarui_pada, which
-- no longer exists after the column renames above. Repoint its body to
-- NEW.updated_at before any UPDATE below fires the triggers. It is renamed
-- to update_timestamp() in step 8.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'perbarui_timestamp') THEN
    EXECUTE $q$
      CREATE OR REPLACE FUNCTION perbarui_timestamp()
      RETURNS TRIGGER AS $f$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $f$ LANGUAGE plpgsql
    $q$;
  END IF;
END $$;

-- ==================== 3. STATUS / ROLE VALUES + CHECKS ====================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles') THEN
    ALTER TABLE articles DROP CONSTRAINT IF EXISTS artikel_status_check;
    ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_status_check;
    UPDATE articles SET status = 'draft' WHERE status = 'draf';
    UPDATE articles SET status = 'published' WHERE status = 'terbit';
    UPDATE articles SET status = 'archived' WHERE status = 'arsip';
    ALTER TABLE articles ALTER COLUMN status SET DEFAULT 'draft';
    ALTER TABLE articles ADD CONSTRAINT articles_status_check CHECK (status IN ('draft', 'published', 'archived'));
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages') THEN
    ALTER TABLE pages DROP CONSTRAINT IF EXISTS halaman_status_check;
    ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_status_check;
    UPDATE pages SET status = 'draft' WHERE status = 'draf';
    UPDATE pages SET status = 'published' WHERE status = 'terbit';
    ALTER TABLE pages ALTER COLUMN status SET DEFAULT 'draft';
    ALTER TABLE pages ADD CONSTRAINT pages_status_check CHECK (status IN ('draft', 'published'));
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS pengguna_peran_check;
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    UPDATE users SET role = 'author' WHERE role = 'penulis';
    ALTER TABLE users ALTER COLUMN role SET DEFAULT 'author';
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'editor', 'author'));
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'global_settings') THEN
    ALTER TABLE global_settings DROP CONSTRAINT IF EXISTS pengaturan_global_tipe_data_check;
    ALTER TABLE global_settings DROP CONSTRAINT IF EXISTS global_settings_data_type_check;
    ALTER TABLE global_settings ADD CONSTRAINT global_settings_data_type_check CHECK (data_type IN ('string', 'boolean', 'integer', 'json'));
  END IF;
END $$;

-- ======================== 4. GLOBAL SETTING KEYS ==========================
UPDATE global_settings SET key = 'site_title' WHERE key = 'judul_situs';
UPDATE global_settings SET key = 'site_description' WHERE key = 'deskripsi_situs';
UPDATE global_settings SET key = 'contact_email' WHERE key = 'surel_kontak';
UPDATE global_settings SET description = 'Main platform / website name' WHERE key = 'site_title' AND description <> 'Main platform / website name';
UPDATE global_settings SET description = 'Default platform slogan and description' WHERE key = 'site_description' AND description <> 'Default platform slogan and description';
UPDATE global_settings SET description = 'Official contact email address' WHERE key = 'contact_email' AND description <> 'Official contact email address';

-- ================= 5. HOMEPAGE SECTION JSONB SETTING KEYS =================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'homepage_sections') THEN
    UPDATE homepage_sections
    SET settings = (
      SELECT jsonb_object_agg(
        CASE s.key
          WHEN 'judul_utama' THEN 'main_title'
          WHEN 'judul_seksi' THEN 'section_title'
          WHEN 'subjudul' THEN 'subtitle'
          WHEN 'deskripsi' THEN 'description'
          WHEN 'jumlah_tampil' THEN 'display_count'
          WHEN 'teks_tautan' THEN 'link_text'
          WHEN 'judul' THEN 'title'
          WHEN 'desain' THEN 'design'
          ELSE s.key
        END,
        CASE
          WHEN s.key = 'cta' THEN (
            SELECT jsonb_object_agg(
              CASE c.key WHEN 'teks_tombol' THEN 'button_text' WHEN 'url_tujuan' THEN 'target_url' WHEN 'ikon' THEN 'icon' ELSE c.key END,
              c.value
            ) FROM jsonb_each(s.value) c
          )
          WHEN s.key IN ('desain', 'design') THEN (
            SELECT jsonb_object_agg(
              CASE d.key WHEN 'warna_tombol' THEN 'button_color' ELSE d.key END,
              d.value
            ) FROM jsonb_each(s.value) d
          )
          ELSE s.value
        END
      )
      FROM jsonb_each(settings) s
    );
    -- Translate seeded Indonesian values
    UPDATE homepage_sections SET settings = jsonb_set(settings, '{subtitle}', '"Most Read"')
      WHERE settings->>'subtitle' = 'Paling Banyak Dibaca';
    UPDATE homepage_sections SET section_title = 'Main Hero Section' WHERE section_title = 'Hero Section Utama';
    UPDATE homepage_sections SET section_title = 'Explore Topics Grid' WHERE section_title = 'Grid Explore Topics';
    UPDATE homepage_sections SET section_title = 'Trending Articles List' WHERE section_title = 'Daftar Artikel Trending';
    UPDATE homepage_sections SET section_title = 'Latest Articles List' WHERE section_title = 'Daftar Artikel Terbaru';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'homepages') THEN
    UPDATE homepages SET title = 'SYNCLAB Main Layout V1' WHERE title = 'Tampilan Utama V1 SYNCLAB';
  END IF;
END $$;

-- ========================== 6. MENU ITEM URLS =============================
UPDATE menu_items SET url = replace(url, '/kategori/', '/category/') WHERE url LIKE '/kategori/%';
UPDATE menu_items SET url = replace(url, '/halaman/', '/page/') WHERE url LIKE '/halaman/%';
UPDATE menu_items SET url = '/articles' WHERE url = '/artikel';

-- ====================== 7. SEED CONTENT TRANSLATION =======================
UPDATE categories SET description = 'Modern frontend & backend tech stack' WHERE slug = 'web-dev' AND description <> 'Modern frontend & backend tech stack';
UPDATE categories SET description = 'Operating systems, kernel, & shell scripting' WHERE slug = 'linux' AND description <> 'Operating systems, kernel, & shell scripting';
UPDATE categories SET description = 'Networking, security, & protocols' WHERE slug = 'network' AND description <> 'Networking, security, & protocols';
UPDATE categories SET description = 'Machine learning & data engineering' WHERE slug = 'ai-data' AND description <> 'Machine learning & data engineering';

UPDATE articles SET
  title = 'Introduction to Machine Learning for Developers',
  slug = 'introduction-to-machine-learning-for-developers',
  excerpt = 'Fundamental machine learning concepts, from regression to neural networks, with Python examples you can run right away.',
  content = '## What is Machine Learning?

Machine learning lets computers...'
WHERE slug = 'pengantar-machine-learning-untuk-developer';

UPDATE articles SET excerpt = 'Learn how to design robust, secure, and high-performance API architectures using Node.js and PostgreSQL.'
WHERE slug = 'building-scalable-apis-nodejs-postgresql' AND excerpt <> 'Learn how to design robust, secure, and high-performance API architectures using Node.js and PostgreSQL.';
UPDATE articles SET content = '## Introduction

In the era of modern web applications...'
WHERE slug = 'building-scalable-apis-nodejs-postgresql' AND content LIKE '## Pendahuluan%';

UPDATE articles SET excerpt = 'A deep dive into how the Linux kernel manages RAM, page allocation, and virtual memory.'
WHERE slug = 'understanding-linux-kernel-memory-management' AND excerpt <> 'A deep dive into how the Linux kernel manages RAM, page allocation, and virtual memory.';
UPDATE articles SET content = '## Introduction to Memory Management

The Linux kernel uses...'
WHERE slug = 'understanding-linux-kernel-memory-management' AND content LIKE '## Pengenalan%';

UPDATE articles SET excerpt = 'Core concepts and practical implementation of mesh network architectures for redundancy and maximum throughput.'
WHERE slug = 'designing-high-performance-mesh-networks' AND excerpt <> 'Core concepts and practical implementation of mesh network architectures for redundancy and maximum throughput.';
UPDATE articles SET content = '## Mesh Network Architecture

Mesh networks offer...'
WHERE slug = 'designing-high-performance-mesh-networks' AND content LIKE '## Arsitektur%';

UPDATE articles SET excerpt = 'A practical guide to building, running, and orchestrating Docker containers for development and production environments.'
WHERE slug = 'getting-started-with-docker-containerization' AND excerpt <> 'A practical guide to building, running, and orchestrating Docker containers for development and production environments.';
UPDATE articles SET content = '## Why Containers?

Containers package applications with their dependencies...'
WHERE slug = 'getting-started-with-docker-containerization' AND content LIKE '## Mengapa%';

UPDATE articles SET
  title = 'Modern CSS: Grid, Flexbox, and Container Queries',
  excerpt = 'Master modern CSS layout techniques to build responsive interfaces without complex media queries.',
  content = '## The Evolution of CSS Layout

CSS Grid and Flexbox changed the way we...'
WHERE slug = 'modern-css-grid-flexbox-container-queries' AND title LIKE 'Modern CSS: Grid, Flexbox, dan%';

-- ================== 8. INDEX / TRIGGER / FUNCTION RENAMES =================
ALTER INDEX IF EXISTS idx_artikel_slug RENAME TO idx_articles_slug;
ALTER INDEX IF EXISTS idx_articles_status_tgl RENAME TO idx_articles_status_date;
ALTER INDEX IF EXISTS idx_artikel_status_tgl RENAME TO idx_articles_status_date;
ALTER INDEX IF EXISTS idx_kategori_slug RENAME TO idx_categories_slug;
ALTER INDEX IF EXISTS idx_bagian_beranda_posisi RENAME TO idx_homepage_sections_position;
ALTER INDEX IF EXISTS idx_item_menu_posisi RENAME TO idx_menu_items_position;
ALTER INDEX IF EXISTS idx_kunjungan_artikel_waktu RENAME TO idx_article_visits_time;
ALTER INDEX IF EXISTS idx_kunjungan_artikel_artikel_waktu RENAME TO idx_article_visits_article_time;
ALTER INDEX IF EXISTS idx_kunjungan_ip_artikel_waktu RENAME TO idx_article_visits_ip_time;
ALTER INDEX IF EXISTS idx_kunjungan_token RENAME TO idx_visits_token;
ALTER INDEX IF EXISTS idx_artikel_status_views RENAME TO idx_articles_status_views;
ALTER INDEX IF EXISTS idx_artikel_kategori_kategori RENAME TO idx_article_categories_category;

DO $$
DECLARE
  trg_map jsonb := '{
    "users": ["trg_perbarui_pengguna", "trg_update_users"],
    "categories": ["trg_perbarui_kategori", "trg_update_categories"],
    "articles": ["trg_perbarui_artikel", "trg_update_articles"],
    "homepages": ["trg_perbarui_beranda", "trg_update_homepages"],
    "homepage_sections": ["trg_perbarui_bagian_beranda", "trg_update_homepage_sections"],
    "pages": ["trg_perbarui_halaman", "trg_update_pages"]
  }';
  t text;
BEGIN
  FOR t IN SELECT jsonb_object_keys(trg_map) LOOP
    IF EXISTS (
      SELECT 1 FROM pg_trigger tg JOIN pg_class c ON c.oid = tg.tgrelid
      WHERE tg.tgname = trg_map->t->>0 AND c.relname = t AND NOT tg.tgisinternal
    ) THEN
      EXECUTE format('ALTER TRIGGER %I ON %I RENAME TO %I', trg_map->t->>0, t, trg_map->t->>1);
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'perbarui_timestamp')
     AND NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_timestamp') THEN
    ALTER FUNCTION perbarui_timestamp() RENAME TO update_timestamp;
  END IF;
END $$;
