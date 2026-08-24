-- Migration 003: Unified global view system (single source of truth).
-- articles.view_count becomes the single authoritative counter; rows in
-- article_visits are only recorded through the centralized view validation service.

ALTER TABLE articles
    ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE article_visits
    ADD COLUMN IF NOT EXISTS ip_address INET,
    ADD COLUMN IF NOT EXISTS user_agent TEXT,
    ADD COLUMN IF NOT EXISTS visit_id UUID,
    ADD COLUMN IF NOT EXISTS visit_token TEXT,
    ADD COLUMN IF NOT EXISTS valid BOOLEAN NOT NULL DEFAULT TRUE;

-- Indexes for duplicate protection & time-based trending/stats queries
CREATE INDEX IF NOT EXISTS idx_article_visits_ip_time
    ON article_visits (ip_address, article_id, visited_at DESC);

CREATE INDEX IF NOT EXISTS idx_visits_token
    ON article_visits (visit_token);

-- Backfill the authoritative counter from existing visit data
UPDATE articles a SET view_count = sub.total
FROM (
    SELECT article_id, COUNT(*)::int AS total
    FROM article_visits
    WHERE valid = TRUE
    GROUP BY article_id
) sub
WHERE a.id = sub.article_id;
