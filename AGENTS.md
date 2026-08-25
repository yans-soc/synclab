# SYNCLAB CMS — Repository Notes

## Stack & Layout
- `backend/`: Node.js/Express REST API (ESM), controller-service pattern, modules under `backend/src/modules/` (auth, articles, homepage, categories, media, menus, pages, visits, settings).
- `frontend/`: React + Vite + Tailwind. Pages in `frontend/src/pages/`, admin in `pages/admin/`, home sections in `components/home/`.
- `database/`: `migrations/` (numbered SQL, applied in order) + `seeds/seed.sql`.
- All code, UI strings, identifiers, API routes, and DB schema are in **English** (converted from Indonesian in commit c48c9c9; migration `005_english_rename.sql` renamed the live DB in place and is idempotent).

## Conventions
- API envelope: `{ success, message, data, meta? }` via `backend/src/utils/response.js`.
- Validation with zod in `backend/src/validators/index.js`; errors thrown as `{ status, message, data }`.
- `view_count` on articles is the authoritative counter; only `modules/visits/service.js` may increment it (validated claims with HMAC visit tokens).
- Public GETs are cached in-memory (`middleware/cache.js`); all admin mutations call `invalidatePublicCache()`.
- LocalStorage keys: `synclab_token`, `synclab_user`, `synclab_theme`.
- Legacy Indonesian frontend routes (`/artikel`, `/kategori/:slug`, `/halaman/:slug`, `/admin/masuk`, etc.) redirect to the English paths in `frontend/src/App.jsx`.

## Verification
- Backend: `node --check` each file (no test suite).
- Frontend: `cd frontend && npm run build`.
- Full stack: start Postgres (`docker run -p 55432:5432 postgres:16-alpine`), apply migrations + seed, run backend with `DATABASE_URL=... node src/index.js`, curl `/api/health` + `/api/v1/*` endpoints.

## Deployment
- Push to `main` triggers the webhook on the VPS (`root@43.156.102.177`):   `git pull` in `/synclab`, frontend build, `pm2 restart synclab-api` (deploys are verified via the live site API; DB migrations are applied manually over SSH).
- DB migrations are NOT auto-applied — run new `database/migrations/*.sql` manually: `docker exec -i synclab-postgres psql -U synclab -d synclab < file.sql`.
- Seeded admin: `admin@synclab.id` / `SandiAman123!` (see README).

## Community Module (added)
- Backend: `modules/threads/` (categories, threads, replies, reactions, bookmarks, reports, moderation). Qualified views run through the central `modules/visits/` service with resource-type-bound tokens.
- DB: `view_records` (post + thread), `community_categories`, `threads`, `thread_replies`, `thread_reactions`, `thread_bookmarks`, `thread_reports` in migration 006. IPs hashed at the DB layer via `hash_ip()` + trigger.
- Frontend: `/community`, `/community/category/:slug`, `/community/thread/:slug`, `/community/new`; CMS moderation under `/admin/threads`. Homepage includes the `community_trending` section type.
- Rate limits (env-configurable): `COMMUNITY_THREAD_LIMIT` (5/h), `COMMUNITY_REPLY_LIMIT` (30/10min), `COMMUNITY_REACTION_LIMIT` (60/10min), `COMMUNITY_REPORT_LIMIT` (10/h). View tuning: `VIEW_TOKEN_TTL_SECONDS`, `VIEW_CLAIM_WINDOW_SECONDS`, `VIEW_COOLDOWN_HOURS`, `VIEW_MIN_ACTIVE_SECONDS`.
