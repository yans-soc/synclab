-- Migration 004: performance & responsive media
-- Indexes follow the actual query patterns; media columns support responsive variants
-- and dimension reservation (CLS) on the frontend.

-- Category page filter: WHERE category_id = ? (PK points the other way)
CREATE INDEX IF NOT EXISTS idx_article_categories_category
    ON article_categories(category_id, article_id);

-- Popular ordering: WHERE status = 'published' ORDER BY view_count DESC
CREATE INDEX IF NOT EXISTS idx_articles_status_views
    ON articles(status, view_count DESC);

-- Media dimensions & responsive variants (webp: thumbnail/small/medium/large)
ALTER TABLE media ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE media ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE media ADD COLUMN IF NOT EXISTS variants JSONB NOT NULL DEFAULT '{}'::jsonb;
