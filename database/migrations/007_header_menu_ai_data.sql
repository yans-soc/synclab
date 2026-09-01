-- 007: Add "AI & Data" to the header navigation and reorder categories to
-- match the homepage Explore Topics order: Home, AI & Data, Linux, Network,
-- Web Dev, Community.
-- Idempotent:, safe to run repeatedly.

BEGIN;

INSERT INTO menu_items (menu_id, label, url, position)
SELECT '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'AI & Data', '/category/ai-data', 1
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items
  WHERE menu_id = '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'
    AND (label = 'AI & Data' OR url = '/category/ai-data')
);

UPDATE menu_items SET position = 0
WHERE menu_id = '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'
  AND label = 'Home' AND url = '/';

UPDATE menu_items SET position = 1
WHERE menu_id = '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'
  AND (label = 'AI & Data' OR url = '/category/ai-data');

UPDATE menu_items SET position = 2
WHERE menu_id = '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'
  AND label = 'Linux' AND url = '/category/linux';

UPDATE menu_items SET position = 3
WHERE menu_id = '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'
  AND label = 'Network' AND url = '/category/network';

UPDATE menu_items SET position = 4
WHERE menu_id = '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'
  AND label = 'Web Dev' AND url = '/category/web-dev';

UPDATE menu_items SET position = 5
WHERE menu_id = '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'
  AND label = 'Community' AND url = '/community';

COMMIT;