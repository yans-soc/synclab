# SYNCLAB CMS

A WordPress-style CMS built with **React + Tailwind CSS** (frontend), a **Node.js REST API** (backend), and **PostgreSQL** (database). MVP target: a fully data-driven SYNCLAB landing page (hero, explore topics, latest articles, CTA, header/footer menus) plus an admin panel.

## Project Structure

```text
synclab/
├── backend/            # Node.js REST API (Express, controller-service pattern)
├── frontend/           # React + Vite + Tailwind CSS
├── database/
│   ├── migrations/     # 001_schema.sql (extracted from schema.md)
│   └── seeds/          # seed.sql (extracted from seed.md)
├── docker-compose.yml  # PostgreSQL
└── .env.example
```

## Running the Project

```bash
cp .env.example .env          # adjust if needed
docker compose up -d          # start PostgreSQL

# Migrations + seed
cat database/migrations/001_schema.sql | docker exec -i synclab-postgres psql -U synclab -d synclab
cat database/seeds/seed.sql            | docker exec -i synclab-postgres psql -U synclab -d synclab

# Backend (port 12000)
cd backend && npm install && npm run dev

# Frontend (port 12001, proxies /api -> backend)
cd frontend && npm install && npm run dev
```

Seeded admin credentials: `admin@synclab.id` / `SandiAman123!`.

## Document Reconciliation Decisions (v1)

- **Schema baseline v1**: `schema.md` + `seed.md` + `apispec.md` (mutually consistent). The full target schema lives in `database.md`/`erd.md`.
- **Content status v1**: `'draft' | 'published' | 'archived'`, not `draft/scheduled/published/trash` from the PRD.
- The `desain_database.md` reference in `agentrules.md` has been corrected to `database.md`.

### Future Migration List (toward the full database.md/erd.md schema)

1. Dynamic RBAC tables: `roles`, `permissions`, `role_permissions` (the authorization middleware switches from the `users.role` column).
2. `tags` + `article_tags` tables.
3. `revisions` table (content versioning + restore) and autosave.
4. `audit_logs` table (recording important mutating operations).
5. `redirects` table (URL redirects for SEO).
6. Polymorphic `seo_metadata` (`content_type` + `content_id`) replacing direct FKs.
7. Advanced content statuses: `scheduled` + `trash` (soft delete) per the PRD.

## Deployment (VPS)

Production: http://43.156.102.177 - auto-deploy via GitHub webhook (push to main -> VPS runs git pull, builds the frontend, restarts PM2).

> Webhook endpoint: `http://43.156.102.177:9000/hooks/synclab-deploy` (HMAC-SHA256, push events to main only).
