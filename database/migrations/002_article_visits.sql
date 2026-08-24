-- Migration 002: Article visits table for the Trending Articles feature
-- Records every article detail-page visit so the most popular articles
-- of the last 7 days can be computed in realtime.

CREATE TABLE IF NOT EXISTS article_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_article_visits_time
    ON article_visits (visited_at);

CREATE INDEX IF NOT EXISTS idx_article_visits_article_time
    ON article_visits (article_id, visited_at);
