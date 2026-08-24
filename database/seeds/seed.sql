-- 1. SEED PENGGUNA (Admin Master & Penulis)
INSERT INTO pengguna (id, nama_lengkap, surel, kata_sandi, peran, aktif)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin SYNCLAB', 'admin@synclab.id', '$2a$10$6aB2LOxUFQdA0uGkCUUG0e/umsOIbvy2iFW5.PNA3MjniSpBfpqge', 'admin', TRUE),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Rian Febrian', 'rian@synclab.id', '$2a$10$6aB2LOxUFQdA0uGkCUUG0e/umsOIbvy2iFW5.PNA3MjniSpBfpqge', 'penulis', TRUE);

-- 2. SEED KATEGORI
INSERT INTO kategori (id, nama, slug, deskripsi, warna, ikon)
VALUES 
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Web Dev', 'web-dev', 'Frontend & Backend modern tech stack', 'primary', 'code'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Linux', 'linux', 'Sistem operasi, Kernel, & Shell Scripting', 'secondary', 'terminal'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Network', 'network', 'Jaringan, Keamanan, & Protokol', 'tertiary', 'hub'),
('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'AI & Data', 'ai-data', 'Machine Learning & Rekayasa Data', 'ai-purple', 'psychology');

-- 3. SEED MEDIA
INSERT INTO media (id, nama_berkas, url, tipe_mime, ukuran_berkas, id_pengunggah)
VALUES 
('91eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'api_architecture.jpg', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c', 'image/jpeg', 245000, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('92eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'linux_kernel.jpg', 'https://images.unsplash.com/photo-1629654297299-c8506221ca97', 'image/jpeg', 312000, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('93eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'mesh_network.jpg', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8', 'image/jpeg', 189000, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- 4. SEED ARTIKEL
INSERT INTO artikel (id, judul, slug, kutipan, konten, status, id_penulis, id_gambar_unggulan, diterbitkan_pada)
VALUES 
(
  'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'Building Scalable APIs with Node.js & PostgreSQL',
  'building-scalable-apis-nodejs-postgresql',
  'Pelajari cara merancang arsitektur API yang tangguh, aman, dan berkinerja tinggi menggunakan Node.js dan PostgreSQL.',
  '## Pendahuluan

Dalam era aplikasi web modern...',
  'terbit',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '91eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  CURRENT_TIMESTAMP - INTERVAL '2 days'
),
(
  'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
  'Understanding Linux Kernel Memory Management',
  'understanding-linux-kernel-memory-management',
  'Panduan mendalam tentang bagaimana kernel Linux mengelola RAM, alokasi halaman, dan virtual memory.',
  '## Pengenalan Memory Management

Kernel Linux menggunakan...',
  'terbit',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '92eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
  CURRENT_TIMESTAMP - INTERVAL '5 days'
),
(
  'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
  'Designing High-Performance Mesh Networks',
  'designing-high-performance-mesh-networks',
  'Konsep dasar dan implementasi praktis arsitektur jaringan mesh untuk redundansi dan throughput maksimal.',
  '## Arsitektur Mesh Network

Jaringan mesh menawarkan...',
  'terbit',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '93eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
  CURRENT_TIMESTAMP - INTERVAL '7 days'
),
(
  'd4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
  'Getting Started with Docker & Containerization',
  'getting-started-with-docker-containerization',
  'Panduan praktis membangun, menjalankan, dan mengorkestrasi container Docker untuk lingkungan pengembangan dan produksi.',
  '## Mengapa Container?

Container mengemas aplikasi beserta dependensinya...',
  'terbit',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '91eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  CURRENT_TIMESTAMP - INTERVAL '3 days'
),
(
  'd5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
  'Modern CSS: Grid, Flexbox, dan Container Queries',
  'modern-css-grid-flexbox-container-queries',
  'Kuasai teknik layout CSS modern untuk membangun antarmuka yang responsif tanpa media query yang rumit.',
  '## Evolusi Layout CSS

CSS Grid dan Flexbox mengubah cara kita...',
  'terbit',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '92eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
  CURRENT_TIMESTAMP - INTERVAL '4 days'
),
(
  'd6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
  'Pengantar Machine Learning untuk Developer',
  'pengantar-machine-learning-untuk-developer',
  'Konsep fundamental machine learning, dari regresi hingga neural network, dengan contoh kode Python yang langsung bisa dijalankan.',
  '## Apa itu Machine Learning?

Machine learning memungkinkan komputer...',
  'terbit',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '93eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
  CURRENT_TIMESTAMP - INTERVAL '6 days'
);

-- 5. RELASI ARTIKEL DAN KATEGORI
INSERT INTO artikel_kategori (id_artikel, id_kategori)
VALUES 
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02'),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03'),
('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'),
('d6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04');

-- 6. SEED BERANDA MASTER
INSERT INTO beranda (id, judul, versi, aktif)
VALUES 
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Tampilan Utama V1 SYNCLAB', 1, TRUE);

-- 7. SEED BAGIAN BERANDA (Homepage Builder Sections)
INSERT INTO bagian_beranda (id, id_beranda, judul_bagian, tipe, posisi, pengaturan, aktif)
VALUES 
(
  'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'Hero Section Utama',
  'hero_section',
  1,
  '{
    "judul_utama": "Master the Tech Stack of Tomorrow",
    "deskripsi": "Dive deep into high-quality programming tutorials designed for developers and systems architects. Build precision, ensure clarity, and understand what is under the hood.",
    "cta": {
      "teks_tombol": "Start Learning",
      "url_tujuan": "/tutorials",
      "ikon": "arrow_forward"
    }
  }'::jsonb,
  TRUE
),
(
  'f2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
  'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'Grid Explore Topics',
  'explore_topics',
  2,
  '{
    "subjudul": "Curated Knowledge Base",
    "judul_seksi": "Explore Topics"
  }'::jsonb,
  TRUE
),
(
  'f4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
  'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'Daftar Artikel Trending',
  'trending_articles',
  3,
  '{
    "subjudul": "Paling Banyak Dibaca",
    "judul_seksi": "Trending Articles",
    "jumlah_tampil": 6,
    "teks_tautan": "View All Posts"
  }'::jsonb,
  TRUE
),
(
  'f3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
  'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
  'Daftar Artikel Terbaru',
  'latest_articles',
  4,
  '{
    "judul_seksi": "Latest Articles",
    "jumlah_tampil": 6,
    "teks_tautan": "View All Posts"
  }'::jsonb,
  TRUE
);

-- 8. SEED KUNJUNGAN AWAL (data awal agar trending tidak kosong;
--    selanjutnya data diisi realtime oleh sistem saat pengunjung membaca)
INSERT INTO kunjungan_artikel (id_artikel, dikunjungi_pada)
SELECT d.id, now() - (random() * INTERVAL '7 days')
FROM (
  VALUES
    ('d6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06'::uuid, 42),
    ('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04'::uuid, 35),
    ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'::uuid, 28),
    ('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05'::uuid, 19),
    ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02'::uuid, 12),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03'::uuid, 7)
) AS d(id, jumlah)
CROSS JOIN generate_series(1, d.jumlah);

-- 9. SEED MENU NAVIGASI
INSERT INTO menu (id, nama, lokasi)
VALUES 
('71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Header Navigation', 'header'),
('72eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Footer Navigation', 'footer');

INSERT INTO item_menu (id, id_menu, label, url, posisi)
VALUES 
('81eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Web Dev', '/kategori/web-dev', 1),
('82eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Linux', '/kategori/linux', 2),
('83eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '71eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Network', '/kategori/network', 3),
('84eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '72eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Documentation', '/halaman/documentation', 1),
('85eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '72eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'API Terms', '/halaman/api-terms', 2);

-- 9. SEED PENGATURAN GLOBAL
INSERT INTO pengaturan_global (kunci, nilai, deskripsi, tipe_data)
VALUES 
('judul_situs', 'SYNCLAB', 'Nama utama platform / website', 'string'),
('deskripsi_situs', 'High-Quality Programming & System Engineering Tutorials', 'Slogan dan deskripsi default platform', 'string'),
('surel_kontak', 'contact@synclab.id', 'Alamat surel kontak resmi', 'string');

-- 9. SINKRONISASI COUNTER OTORITATIF dari data kunjungan awal di atas
UPDATE artikel a SET jumlah_dilihat = sub.total
FROM (
  SELECT id_artikel, COUNT(*)::int AS total
  FROM kunjungan_artikel
  WHERE sah = TRUE
  GROUP BY id_artikel
) sub
WHERE a.id = sub.id_artikel;
