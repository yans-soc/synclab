# 1. OBJECTIVE

Menyusun to-do list pengerjaan terbaik untuk membangun **SYNCLAB CMS** — CMS bergaya WordPress dengan stack **React + Tailwind CSS (frontend)**, **Node.js REST API (backend)**, dan **PostgreSQL (database)** — berdasarkan 10 dokumen markdown yang sudah ada di repositori. Target pertama yang konkret: **Landing Page SYNCLAB yang sepenuhnya data-driven dari CMS** (hero, explore topics, latest articles, CTA, menu header/footer) beserta **admin panel MVP**, lalu berkembang bertahap mengikuti roadmap PRD (Homepage Builder → SEO → Appearance → Advanced).

# 2. CONTEXT SUMMARY

**Dokumen sumber yang sudah dipelajari:**
- `prd.md` — visi produk CMS WordPress-like lengkap: modul Posts, Pages, Categories, Tags, Media, Homepage Builder, SEO, RBAC, Settings; roadmap 5 fase (§54–58); acceptance criteria global (§59).
- `plan.md` — rekap fitur final + struktur folder backend (`src/modules/...`) dan frontend (`src/pages`, `src/components/...`) + MVP roadmap 5 fase.
- `agentrules.md` — **aturan ketat wajib**: (1) seluruh nama tabel/kolom PostgreSQL Bahasa Indonesia `snake_case`, PK `UUID`, FK berawalan `id_`; (2) response API standar `{sukses, pesan, data}`; (3) JSONB wajib divalidasi Zod/Joi; (4) RBAC dicek via tabel `peran_hak_akses`; (5) operasi mutating penting dicatat ke `log_audit`; (6) UI mengikuti token Tailwind (`primary`, `secondary`, `tertiary`, `ai-purple`, `surface-container`) + Material Symbols Outlined.
- `schema.md` — DDL SQL konkret (`schema.sql`): 12 tabel (pengguna, kategori, media, artikel, artikel_kategori, beranda, bagian_beranda, halaman, metadata_seo, menu, item_menu, pengaturan_global) + indeks + trigger `perbarui_timestamp()`.
- `seed.md` — `seed.sql` konsisten dengan `schema.md`: admin/penulis, 4 kategori (Web Dev, Linux, Network, AI & Data), 3 artikel, beranda v1 dengan 3 section (hero_section, explore_topics, latest_articles), menu header/footer, pengaturan global.
- `apispec.md` — kontrak REST API: publik (`GET /api/v1/beranda/aktif`, `/artikel`, `/artikel/:slug`, `/menu/:lokasi`) dan admin (`POST /otentikasi/masuk`, `POST /admin/artikel`).
- `componenttree.md` — pohon komponen React landing page (AppLayout → TopNavBar, LandingPageBuilder → HeroSection/CategoryExplorer/LatestArticlesGrid/CallToActionBanner, Footer) + props TypeScript + komponen admin (AdminLayout, HomepageBuilder, ArticleEditor, MediaManagerModal).
- `integrasi_landingpage.md` — pemetaan elemen landing page ke tabel DB + query SQL dasar endpoint + token desain Tailwind.
- `database.md` + `erd.md` — desain skema **target penuh** (RBAC: peran/hak_akses/peran_hak_akses; label_tag; revisi; log_audit; pengalihan; metadata_seo polimorfik).

**Temuan penting — konflik antar dokumen yang harus diputuskan:**
1. `schema.md` (dipakai seed.md & apispec.md) **lebih sederhana** dari `database.md`/`erd.md`: `pengguna.peran` berupa enum CHECK (bukan tabel RBAC), tidak ada `label_tag`, `revisi`, `log_audit`, `pengalihan`; `metadata_seo` pakai FK langsung (bukan polimorfik); `kategori` punya kolom `warna`/`ikon`; `beranda` punya `judul`/`versi`/`aktif`.
2. `agentrules.md` merujuk `desain_database.md` yang **tidak ada** di repo (kemungkinan maksudnya `database.md`).
3. Status konten berbeda: PRD `draft/scheduled/published/trash` vs schema.md `'draf','terbit','arsip'`.
4. Typo di seed.md: `'Tampilan Utam V1 SYNCLAB'` (apispec memakai 'Tampilan Utama V1').

**Keputusan yang direkomendasikan (perlu konfirmasi user):** jadikan `schema.md` + `seed.md` + `apispec.md` sebagai **baseline MVP v1** (sudah saling konsisten dan langsung bisa dieksekusi), lalu evolusi ke skema penuh `database.md`/`erd.md` lewat migrasi bertahap (tabel RBAC, revisi, log_audit, pengalihan, label_tag) pada fase lanjutan.

# 3. APPROACH OVERVIEW

Pendekatan: **bottom-up, fase-per-fase, selalu vertikal (DB → API → UI)**. Dimulai dari rekonsiliasi dokumen, lalu fondasi database dari DDL yang sudah ada, backend Node.js modular (controller-service pattern sesuai plan.md §38), frontend React yang merender landing page secara data-driven (sesuai componenttree.md), kemudian admin panel. Pendekatan ini dipilih karena 4 dari 10 dokumen (schema, seed, apispec, componenttree) sudah membentuk satu rantai kontrak yang konsisten dan langsung bisa diimplementasikan — sehingga nilai produk (landing page dinamis) terlihat secepat mungkin, sementara fitur besar PRD (Homepage Builder penuh, SEO, RBAC dinamis) dikerjakan bertahap di fase berikutnya sesuai roadmap PRD §64.

# 4. IMPLEMENTATION STEPS

## Fase 0 — Rekonsiliasi Dokumen & Setup Proyek

1. **Rekonsiliasi dokumen** — *Goal:* satu sumber kebenaran. *Method:* putuskan baseline skema (rekomendasi: schema.md sebagai v1); perbaiki typo seed.md; koreksi referensi `desain_database.md` di agentrules.md → `database.md`; selaraskan nilai status konten; catat delta menuju skema penuh sebagai daftar migrasi masa depan. *Ref:* semua file .md.
2. **Scaffold monorepo** — *Goal:* struktur proyek siap. *Method:* buat folder `backend/` (Node.js + Express/Fastify, struktur `src/modules|middleware|database|services|routes|utils` per plan.md §38) dan `frontend/` (React + Vite + Tailwind CSS, struktur per plan.md §39); setup `.env`, `.gitignore`, package manager, ESLint/Prettier. *Ref:* plan.md §38–39.
3. **Environment & tooling** — *Goal:* dev environment reproducible. *Method:* `docker-compose.yml` berisi PostgreSQL (+ volume), env vars `DATABASE_URL`, `JWT_SECRET`, port API; dokumentasikan di README.md.

## Fase 1 — Database (PostgreSQL)

4. **Migrasi skema v1** — *Goal:* skema terpasang. *Method:* ekstrak DDL dari `schema.md` menjadi `database/migrations/001_schema.sql`; jalankan ke PostgreSQL; verifikasi 12 tabel + indeks + trigger `perbarui_timestamp()`. *Ref:* schema.md.
5. **Seed data awal** — *Goal:* data landing page tersedia. *Method:* ekstrak `seed.md` menjadi `database/seeds/seed.sql` (dengan perbaikan typo); jalankan setelah migrasi; verifikasi query contoh di integrasi_landingpage.md §3 mengembalikan 3 artikel. *Ref:* seed.md, integrasi_landingpage.md.

## Fase 2 — Backend Foundation (Node.js)

6. **Core server** — *Goal:* API server hidup. *Method:* setup Express/Fastify, koneksi pool PostgreSQL (`pg`), middleware dasar (CORS, JSON parser, error handler, logger), helper response `{sukses, pesan, data}`, validator Zod untuk payload & JSONB. *Ref:* agentrules.md §2.
7. **Otentikasi** — *Goal:* login admin berfungsi. *Method:* modul `otentikasi`: `POST /api/v1/otentikasi/masuk` (verifikasi bcrypt, terbitkan JWT), `POST /keluar`, middleware `autentikasi` (verifikasi Bearer token) dan `otorisasi` (cek peran; v1 berbasis kolom `pengguna.peran`, disiapkan agar mudah migrasi ke `peran_hak_akses`). *Ref:* apispec.md §2A, agentrules.md.
8. **Modul media** — *Goal:* upload & registry file. *Method:* endpoint upload (validasi MIME + ukuran), simpan file ke filesystem/object storage, metadata ke tabel `media`; endpoint list/detail/delete. *Ref:* database.md §2, prd.md media requirements.

## Fase 3 — Public API (kontrak apispec.md)

9. **Endpoint beranda** — *Goal:* `GET /api/v1/beranda/aktif` sesuai kontrak. *Method:* modul `beranda`: ambil beranda `aktif = true` + `bagian_beranda` aktif urut `posisi`, parse JSONB `pengaturan` dengan Zod. *Ref:* apispec.md §1A.
10. **Endpoint artikel publik** — *Goal:* list + detail artikel. *Method:* `GET /api/v1/artikel` (filter kategori, paginasi, join media+kategori sesuai query integrasi_landingpage.md) dan `GET /api/v1/artikel/:slug` (hanya status `terbit`, sertakan `metadata_seo`). *Ref:* apispec.md §1B–1C.
11. **Endpoint pendukung publik** — *Goal:* kategori, menu, pengaturan. *Method:* `GET /api/v1/kategori`, `GET /api/v1/menu/:lokasi`, `GET /api/v1/pengaturan`. *Ref:* apispec.md §1D, componenttree.md.

## Fase 4 — Admin API

12. **CRUD artikel** — *Goal:* kelola artikel penuh. *Method:* `POST/PUT/DELETE /api/v1/admin/artikel`, auto-generate slug dari judul (editable & unik), status draf/terbit, relasi `artikel_kategori`, tulis/ubah `metadata_seo`. *Ref:* apispec.md §2B, prd.md §10.
13. **CRUD kategori, halaman, menu, pengaturan** — *Goal:* entitas pendukung terkelola. *Method:* endpoint CRUD per modul dengan middleware otorisasi. *Ref:* prd.md §11, plan.md §5/§21.
14. **API Homepage Builder** — *Goal:* kelola struktur beranda. *Method:* CRUD `bagian_beranda` (tambah/edit/hapus/duplikat/toggle aktif), endpoint reorder (update `posisi` massal), validasi `pengaturan` per tipe section dengan Zod, publish/unpublish beranda (`aktif`). *Ref:* plan.md §8–17, database.md §5.

## Fase 5 — Frontend Publik (Landing Page)

15. **Setup Tailwind tokens** — *Goal:* sistem desain siap. *Method:* definisikan custom colors `primary`, `secondary`, `tertiary`, `ai-purple`, `surface-container*` di `tailwind.config`, font Material Symbols Outlined, mode terang/gelap (ThemeToggle). *Ref:* integrasi_landingpage.md, agentrules.md §2.
16. **Layout & shell** — *Goal:* kerangka halaman. *Method:* bangun `AppLayout`, `TopNavBar` (data `/api/v1/menu/header` + pengaturan), `Footer` (data `/api/v1/menu/footer`), layer `services/api.js`. *Ref:* componenttree.md §1.
17. **Renderer section dinamis** — *Goal:* landing page data-driven. *Method:* `LandingPageBuilder` me-map `tipe` section → komponen: `HeroSection`, `CategoryExplorer` (data `/api/v1/kategori` + colorMap), `LatestArticlesGrid` (data `/api/v1/artikel?limit=3` + util `hitungWaktuBaca`), `CallToActionBanner`; urutan mengikuti `posisi`, skip yang `aktif = false`. *Ref:* componenttree.md §1–2.
18. **Halaman artikel & kategori** — *Goal:* konten bisa dibaca publik. *Method:* route `/artikel/:slug` (render konten Markdown + meta SEO) dan `/kategori/:slug` (list artikel terfilter + paginasi). *Ref:* apispec.md §1B–1C.

## Fase 6 — Admin Panel (React)

19. **Shell admin & login** — *Goal:* akses admin. *Method:* halaman login (POST otentikasi), simpan token, route guard, `AdminLayout` + sidebar (Dashboard, Artikel, Kategori, Media, Beranda, Menu, Pengaturan). *Ref:* componenttree.md §3, plan.md §45.
20. **Modul konten admin** — *Goal:* kelola artikel & kategori. *Method:* tabel list artikel (search/filter/status), `ArticleEditor` (Markdown/WYSIWYG, slug editor, kategori, status, panel SEO), halaman CRUD kategori. *Ref:* prd.md §10, componenttree.md §3.
21. **Media manager** — *Goal:* `MediaManagerModal` untuk unggah & pilih `id_gambar_unggulan`. *Ref:* componenttree.md §3.
22. **Homepage Builder UI** — *Goal:* atur beranda tanpa ubah kode. *Method:* daftar section drag & drop (reorder → API), form pengaturan per tipe section, toggle aktif, tombol publish; preview desktop/tablet/mobile. *Ref:* plan.md §10–15.

## Fase 7 — Lanjutan (mengikuti roadmap PRD, opsional bertahap)

23. **SEO lanjutan** — sitemap XML, canonical, Open Graph, pengalihan (tabel `pengalihan`), SEO preview. *Ref:* prd.md §56, database.md §6.
24. **Migrasi skema penuh** — tabel `peran`, `hak_akses`, `peran_hak_akses` (RBAC dinamis), `label_tag` + `artikel_label`, `revisi`, `log_audit`; middleware otorisasi beralih ke `peran_hak_akses`; audit log operasi mutating. *Ref:* database.md, erd.md, agentrules.md.
25. **Fitur advanced** — revisi/restore, autosave, scheduled publishing, trash/restore, bulk actions, dashboard statistik. *Ref:* prd.md §58, plan.md §44 Phase 5.

# 5. TESTING AND VALIDATION

- **Database:** setelah migrasi + seed, query validasi dari integrasi_landingpage.md §3 mengembalikan 3 artikel terbit dengan gambar & kategori; seluruh nama tabel/kolom lolos aturan Bahasa Indonesia (checklist agentrules.md §4).
- **API publik:** setiap endpoint di apispec.md §1 merespons `200` dengan struktur `{sukses, pesan, data}` persis seperti contoh kontrak; artikel berstatus `draf` tidak muncul di endpoint publik.
- **API admin:** login kredensial seed (`admin@synclab.id`) mengembalikan token; endpoint admin tanpa token → `401`; peran non-admin ditolak → `403`; payload JSONB tidak valid ditolak validator.
- **Landing page:** me-render section persis urutan `posisi` dari `/api/v1/beranda/aktif`; menonaktifkan section di admin menghilangkannya dari halaman tanpa deploy ulang; token warna Tailwind dan ikon Material Symbols tampil sesuai componenttree.md.
- **E2E (acceptance PRD §59 subset MVP):** login → buat artikel (upload gambar, pilih kategori, isi SEO) → publish → artikel otomatis muncul di section "Latest Articles" landing page; ubah judul hero dari admin → langsung tercermin di landing page.
- **Checklist agentrules.md §4** dijalankan sebelum setiap task dinyatakan selesai (nama DB Indonesia, token Tailwind selaras, SQL valid + FK tepat, struktur response konsisten).
