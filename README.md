# SYNCLAB CMS

CMS bergaya WordPress dengan stack **React + Tailwind CSS** (frontend), **Node.js REST API** (backend), dan **PostgreSQL** (database). Target MVP: Landing Page SYNCLAB yang sepenuhnya data-driven dari CMS (hero, explore topics, latest articles, CTA, menu header/footer) beserta admin panel.

## Struktur Proyek

```text
synclab/
├── backend/            # Node.js REST API (Express, controller-service pattern)
├── frontend/           # React + Vite + Tailwind CSS
├── database/
│   ├── migrations/     # 001_schema.sql (diekstrak dari schema.md)
│   └── seeds/          # seed.sql (diekstrak dari seed.md)
├── docker-compose.yml  # PostgreSQL
└── .env.example
```

## Menjalankan Proyek

```bash
cp .env.example .env          # sesuaikan bila perlu
docker compose up -d          # nyalakan PostgreSQL

# Migrasi + seed
cat database/migrations/001_schema.sql | docker exec -i synclab-postgres psql -U synclab -d synclab
cat database/seeds/seed.sql            | docker exec -i synclab-postgres psql -U synclab -d synclab

# Backend (port 12000)
cd backend && npm install && npm run dev

# Frontend (port 12001, proxy /api -> backend)
cd frontend && npm install && npm run dev
```

Kredensial admin hasil seed: `admin@synclab.id` / `SandiAman123!`.

## Keputusan Rekonsiliasi Dokumen (v1)

- **Baseline skema v1**: `schema.md` + `seed.md` + `apispec.md` (sudah saling konsisten). Skema target penuh ada di `database.md`/`erd.md`.
- **Status konten v1**: `'draf' | 'terbit' | 'arsip'` (mengikuti schema.md), bukan `draft/scheduled/published/trash` dari PRD.
- Referensi `desain_database.md` di `agentrules.md` sudah dikoreksi ke `database.md`.

### Daftar Migrasi Masa Depan (menuju skema penuh database.md/erd.md)

1. Tabel RBAC dinamis: `peran`, `hak_akses`, `peran_hak_akses` (middleware `otorisasi` beralih dari kolom `pengguna.peran`).
2. Tabel `label_tag` + `artikel_label` (tags).
3. Tabel `revisi` (versioning konten + restore) dan autosave.
4. Tabel `log_audit` (pencatatan operasi mutating penting).
5. Tabel `pengalihan` (redirect URL untuk SEO).
6. `metadata_seo` polimorfik (`tipe_konten` + `id_konten`) menggantikan FK langsung.
7. Status konten lanjutan: `scheduled` + `trash` (soft delete) sesuai PRD.
## Deployment (VPS)

Production: http://43.156.102.177 - auto-deploy via GitHub webhook (push ke main -> VPS menjalankan git pull, build frontend, restart PM2).
