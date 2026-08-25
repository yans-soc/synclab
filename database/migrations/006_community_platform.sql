-- 006 — Community platform: generalized view records + forum schema.
-- Idempotent: guarded CREATE IF NOT EXISTS / ON CONFLICT.

-- ============================================================================
-- 1. Generalized qualified-view records (one table for posts + threads)
-- ============================================================================
CREATE TABLE IF NOT EXISTS view_records (
  id            UUID        NOT NULL DEFAULT (gen_random_uuid()) PRIMARY KEY,
  resource_type VARCHAR(16) NOT NULL CHECK (resource_type IN ('post','thread')),
  resource_id   UUID        NOT NULL,
  ip_address    VARCHAR(64) NULL,
  user_agent    VARCHAR(500) NULL,
  visit_id      VARCHAR(64)  NULL,
  visit_token   VARCHAR(120) NULL,
  valid         BOOLEAN     NOT NULL DEFAULT FALSE,
  detail_page   BOOLEAN     NOT NULL DEFAULT TRUE,
  visited_at    TIMESTAMPTZ NOT NULL DEFAULT (now())
);
ALTER TABLE view_records OWNER TO synclab;

CREATE UNIQUE INDEX IF NOT EXISTS idx_view_records_token
  ON view_records (visit_id)
  WHERE valid = TRUE AND visit_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_view_records_resource_time
  ON view_records (resource_id, visited_at);
CREATE INDEX IF NOT EXISTS idx_view_records_ip_cooldown
  ON view_records (ip_address, resource_id, visited_at);

-- Backfill article_visits into view_records
INSERT INTO view_records (resource_type, resource_id, ip_address, user_agent, visit_id, visit_token, valid, visited_at)
SELECT 'post', article_id, ip_address, user_agent, visit_id, visit_token, valid, visited_at
FROM article_visits
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. Privacy hardening: hashes IPs at the DB layer so plaintext IPs are never
--    readable to roles that can select from view_records. The app hashes via
--    hash_ip(); the trigger below re-hashes anything missed.
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION hash_ip(ip_value TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF ip_value IS NULL THEN RETURN NULL; END IF;
  RETURN encode(digest(ip_value || '::synclab-view-v1', 'sha256'), 'hex');
END $$;

CREATE OR REPLACE FUNCTION hash_ip_before_write()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- A manually-assigned value is re-hashed by this trigger.
  -- Length 64 hex sha256 digests are treated as already-hashed.
  IF NEW.ip_address IS NOT NULL AND NEW.ip_address !~ '^[0-9a-f]{64}$' THEN
    NEW.ip_address := hash_ip(NEW.ip_address::TEXT);
  END IF;
  RETURN NEW;
END $$;

REVOKE ALL ON FUNCTION hash_ip(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION hash_ip(TEXT) TO synclab;

DROP TRIGGER IF EXISTS hash_ip_view_records ON view_records;
CREATE TRIGGER hash_ip_view_records
  BEFORE INSERT ON view_records
  FOR EACH ROW EXECUTE FUNCTION hash_ip_before_write();

UPDATE view_records SET ip_address = hash_ip(ip_address::TEXT)
WHERE ip_address IS NOT NULL;

-- ============================================================================
-- 3. Community schema
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_categories (
  id          UUID        NOT NULL DEFAULT (gen_random_uuid()) PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(140) NOT NULL UNIQUE,
  description TEXT         NULL,
  icon        VARCHAR(60)  NULL,
  thread_count INT         NOT NULL DEFAULT 0,
  position    INT          NOT NULL DEFAULT 0,
  enabled     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT (now()),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT (now())
);
ALTER TABLE community_categories OWNER TO synclab;
CREATE INDEX IF NOT EXISTS idx_community_categories_enabled
  ON community_categories (enabled, position);

CREATE TABLE IF NOT EXISTS threads (
  id             UUID        NOT NULL DEFAULT (gen_random_uuid()) PRIMARY KEY,
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  category_id    UUID        NOT NULL REFERENCES community_categories(id) ON DELETE RESTRICT,
  title          VARCHAR(200) NOT NULL,
  slug           VARCHAR(220) NOT NULL UNIQUE,
  content        TEXT         NOT NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'published'
                 CHECK (status IN ('pending','published','hidden','locked','deleted')),
  is_pinned      BOOLEAN      NOT NULL DEFAULT FALSE,
  view_count     BIGINT       NOT NULL DEFAULT 0,
  reply_count    BIGINT       NOT NULL DEFAULT 0,
  reaction_count BIGINT       NOT NULL DEFAULT 0,
  bookmark_count BIGINT       NOT NULL DEFAULT 0,
  last_reply_at  TIMESTAMPTZ  NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT (now()),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT (now())
);
ALTER TABLE threads OWNER TO synclab;
CREATE INDEX IF NOT EXISTS idx_threads_category_status
  ON threads (category_id, status, last_reply_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_status_recent
  ON threads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_status_views
  ON threads (status, view_count DESC);

CREATE TABLE IF NOT EXISTS thread_replies (
  id              UUID        NOT NULL DEFAULT (gen_random_uuid()) PRIMARY KEY,
  thread_id       UUID        NOT NULL REFERENCES threads(id) ON DELETE RESTRICT,
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  parent_reply_id UUID        NULL REFERENCES thread_replies(id) ON DELETE CASCADE,
  content         TEXT        NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'published'
                  CHECK (status IN ('published','hidden','deleted')),
  reaction_count  BIGINT      NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT (now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT (now())
);
ALTER TABLE thread_replies OWNER TO synclab;
CREATE INDEX IF NOT EXISTS idx_thread_replies_thread_status
  ON thread_replies (thread_id, status, created_at);

-- Like reactions; composite unique prevents duplicates per user/target.
CREATE TABLE IF NOT EXISTS thread_reactions (
  id          UUID        NOT NULL DEFAULT (gen_random_uuid()) PRIMARY KEY,
  target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('thread','reply')),
  target_id   UUID        NOT NULL,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT (now())
);
ALTER TABLE thread_reactions OWNER TO synclab;
CREATE UNIQUE INDEX IF NOT EXISTS idx_thread_reactions_unique
  ON thread_reactions (target_type, target_id, user_id);

-- Bookmarks are private per user.
CREATE TABLE IF NOT EXISTS thread_bookmarks (
  id         UUID        NOT NULL DEFAULT (gen_random_uuid()) PRIMARY KEY,
  thread_id  UUID        NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT (now())
);
ALTER TABLE thread_bookmarks OWNER TO synclab;
CREATE UNIQUE INDEX IF NOT EXISTS idx_thread_bookmarks_unique
  ON thread_bookmarks (thread_id, user_id);

-- Reports agregated for moderation.
CREATE TABLE IF NOT EXISTS thread_reports (
  id          UUID        NOT NULL DEFAULT (gen_random_uuid()) PRIMARY KEY,
  thread_id   UUID        NULL REFERENCES threads(id) ON DELETE CASCADE,
  reply_id    UUID        NULL REFERENCES thread_replies(id) ON DELETE CASCADE,
  reporter_id UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  reason      VARCHAR(500) NOT NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'open'
              CHECK (status IN ('open','resolved','dismissed')),
  resolved_by UUID        NULL REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT (now())
);
ALTER TABLE thread_reports OWNER TO synclab;
CREATE INDEX IF NOT EXISTS idx_thread_reports_status
  ON thread_reports (status, created_at DESC);
