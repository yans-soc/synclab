-- 1. SEED USERS (Master Admin & Author)
INSERT INTO users (id, full_name, email, password, role, active)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin SYNCLAB', 'admin@synclab.id', '$2a$10$6aB2LOxUFQdA0uGkCUUG0e/umsOIbvy2iFW5.PNA3MjniSpBfpqge', 'admin', TRUE),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Rian Febrian', 'rian@synclab.id', '$2a$10$6aB2LOxUFQdA0uGkCUUG0e/umsOIbvy2iFW5.PNA3MjniSpBfpqge', 'author', TRUE);

-- 2. SEED CATEGORIES
INSERT INTO categories (id, name, slug, description, color, icon)
VALUES
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Web Dev', 'web-dev', 'Modern frontend & backend tech stack', 'primary', 'code'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Linux', 'linux', 'Operating systems, kernel, & shell scripting', 'secondary', 'terminal'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Network', 'network', 'Networking, security, & protocols', 'tertiary', 'hub'),
('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'AI & Data', 'ai-data', 'Machine learning & data engineering', 'ai-purple', 'psychology');

-- 3. SEED MEDIA
INSERT INTO media (id, file_name, url, mime_type, file_size, uploader_id)
VALUES
('91eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'api_architecture.jpg', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c', 'image/jpeg', 245000, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('92eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'linux_kernel.jpg', 'https://images.unsplash.com/photo-1629654297299-c8506221ca97', 'image/jpeg', 312000, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('93eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'mesh_network.jpg', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8', 'image/jpeg', 189000, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- 4. SEED ARTICLES
INSERT INTO articles (id, title, slug, excerpt, content, status, author_id, featured_image_id, published_at)
VALUES
(
  'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'Building Scalable APIs with Node.js & PostgreSQL',
  'building-scalable-apis-nodejs-postgresql',
  'Learn how to design robust, secure, and high-performance API architectures using Node.js and PostgreSQL.',
  '## Introduction

In the era of modern web applications...',
  'published',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '91eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  CURRENT_TIMESTAMP - INTERVAL '2 days'
),
(
  'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
  'Understanding Linux Kernel Memory Management',
  'understanding-linux-kernel-memory-management',
  'A deep dive into how the Linux kernel manages RAM, page allocation, and virtual memory.',
  '## Introduction to Memory Management

The Linux kernel uses...',
  'published',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '92eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
  CURRENT_TIMESTAMP - INTERVAL '5 days'
),
(
  'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
  'Designing High-Performance Mesh Networks',
  'designing-high-performance-mesh-networks',
  'Core concepts and practical implementation of mesh network architectures for redundancy and maximum throughput.',
  '## Mesh Network Architecture

Mesh networks offer...',
  'published',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '93eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
  CURRENT_TIMESTAMP - INTERVAL '7 days'
),
(
  'd4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
  'Getting Started with Docker & Containerization',
  'getting-started-with-docker-containerization',
  'A practical guide to building, running, and orchestrating Docker containers for development and production environments.',
  '## Why Containers?

Containers package applications with their dependencies...',
  'published',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '91eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  CURRENT_TIMESTAMP - INTERVAL '3 days'
),
(
  'd5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
  'Modern CSS: Grid, Flexbox, and Container Queries',
  'modern-css-grid-flexbox-container-queries',
  'Master modern CSS layout techniques to build responsive interfaces without complex media queries.',
  '## The Evolution of CSS Layout

CSS Grid and Flexbox changed the way we...',
  'published',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '92eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
  CURRENT_TIMESTAMP - INTERVAL '4 days'
),
(
  'd6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
  'Introduction to Machine Learning for Developers',
  'introduction-to-machine-learning-for-developers',
  'Fundamental machine learning concepts, from regression to neural networks, with Python examples you can run right away.',
  '## What is Machine Learning?

Machine learning lets computers...',
  'published',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '93eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
  CURRENT_TIMESTAMP - INTERVAL '6 days'
);

-- 5. ARTICLE-CATEGORY RELATIONS
INSERT INTO article_categories (article_id, category_id)
VALUES
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02'),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03'),
('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
('d6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04');

-- 6. SEED MASTER HOMEPAGE
INSERT INTO homepages (id, title, version, active)
VALUES
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'SYNCLAB Main Layout V1', 1, TRUE);

-- 7. SEED HOMEPAGE SECTIONS (Homepage Builder Sections)
INSERT INTO homepage_sections (id, homepage_id, section_title, type, position, settings, active)
VALUES
(
  'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'Main Hero Section',
  'hero_section',
  1,
  '{
    "main_title": "Master the Tech Stack of Tomorrow",
    "description": "Dive deep into high-quality programming tutorials designed for developers and systems architects. Build precision, ensure clarity, and understand what is under the hood.",
    "cta": {
      "button_text": "Start Learning",
      "target_url": "/tutorials",
      "icon": "arrow_forward"
    }
  }'::jsonb,
  TRUE
),
(
  'f2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
  'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'Explore Topics Grid',
  'explore_topics',
  2,
  '{
    "subtitle": "Curated Knowledge Base",
    "section_title": "Explore Topics"
  }'::jsonb,
  TRUE
),
(
  'f4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
  'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'Trending Articles List',
  'trending_articles',
  3,
  '{
    "subtitle": "Most Read",
    "section_title": "Trending Articles",
    "display_count": 6,
    "link_text": "View All Posts"
  }'::jsonb,
  TRUE
),
(
  'f3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
  'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'Latest Articles List',
  'latest_articles',
  4,
  '{
    "section_title": "Latest Articles",
    "display_count": 6,
    "link_text": "View All Posts"
  }'::jsonb,
  TRUE
);

-- 8. SEED INITIAL VISITS (seed data so trending is not empty;
--    afterwards data is filled in realtime as visitors read)
INSERT INTO article_visits (article_id, visited_at)
SELECT d.id, now() - (random() * INTERVAL '7 days')
FROM (
  VALUES
    ('d6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06'::uuid, 42),
    ('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04'::uuid, 35),
    ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'::uuid, 28),
    ('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05'::uuid, 19),
    ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02'::uuid, 12),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03'::uuid, 7)
) AS d(id, total)
CROSS JOIN generate_series(1, d.total);

-- 9. SEED NAVIGATION MENUS
INSERT INTO menus (id, name, location)
VALUES
('71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Header Navigation', 'header'),
('72eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Footer Navigation', 'footer');

INSERT INTO menu_items (id, menu_id, label, url, position)
VALUES
('81eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Web Dev', '/category/web-dev', 1),
('82eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Linux', '/category/linux', 2),
('83eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Network', '/category/network', 3),
('86eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Community', '/community', 4),
('84eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '72eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Documentation', '/page/documentation', 1),
('85eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '72eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'API Terms', '/page/api-terms', 2);

-- 10. SEED GLOBAL SETTINGS
INSERT INTO global_settings (key, value, description, data_type)
VALUES
('site_title', 'SYNCLAB', 'Main platform / website name', 'string'),
('site_description', 'High-Quality Programming & System Engineering Tutorials', 'Default platform slogan and description', 'string'),
('contact_email', 'contact@synclab.id', 'Official contact email address', 'string');

-- 11. SYNC THE AUTHORITATIVE COUNTER from the seed visit data above
UPDATE articles a SET view_count = sub.total
FROM (
  SELECT article_id, COUNT(*)::int AS total
  FROM article_visits
  WHERE valid = TRUE
  GROUP BY article_id
) sub
WHERE a.id = sub.article_id;

-- 11. SEED COMMUNITY
INSERT INTO community_categories (id, name, slug, description, icon, position, enabled)
VALUES
('31eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Web Dev', 'web-dev', 'Frontend, backend, and API engineering discussions', 'code', 1, TRUE),
('32eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Linux', 'linux', 'Kernel, shell, and system administration discussions', 'terminal', 2, TRUE),
('33eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Network', 'network', 'Mesh networks, routing, and protocol engineering', 'hub', 3, TRUE),
('34eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'AI & Data', 'ai-data', 'Machine learning and data engineering discussions', 'psychology', 4, TRUE);

INSERT INTO threads (id, user_id, category_id, title, slug, content, status, is_pinned, view_count, reply_count, reaction_count, bookmark_count, last_reply_at)
VALUES
('91eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '31eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
 'How do you structure large Express apps?', 'how-do-you-structure-large-express-apps',
 'I am trying to keep our Express codebase maintainable as it grows. Controller-service per module, or a different pattern? What has worked for you in production?',
 'published', TRUE, 0, 2, 0, 0, now()),
('92eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '32eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
 'Kernel memory management: what confused you most?', 'kernel-memory-management-confusion',
 'Starting with the article on Linux kernel memory management. The zone model and page reclaim logic tripped me up. What parts were hardest for you?',
 'published', FALSE, 0, 1, 0, 0, now());

INSERT INTO thread_replies (id, thread_id, user_id, parent_reply_id, content, status)
VALUES
('93eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '91eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', NULL,
 'Controller-service per module works well for us. We keep routes thin and push logic down into services so it is testable without HTTP.', 'published'),
('94eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '91eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '93eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
 'Agreed. Add zod validation at the boundary and it scales nicely.', 'published'),
('95eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '92eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL,
 'Once you see page frames as a resource ledger it clicks. Try diagramming the buddy allocator.', 'published');

UPDATE community_categories SET thread_count = 1 WHERE id IN ('31eebc99-9c0b-4ef8-bb6d-6bb9bd380a01','32eebc99-9c0b-4ef8-bb6d-6bb9bd380a02');

