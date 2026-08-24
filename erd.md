# Entity Relationship Diagram (ERD) - CMS Arsitektur
Dibuat berdasarkan struktur CMS spesifikasi tingkat tinggi (React, Node.js, PostgreSQL).
Sesuai dengan ketentuan, seluruh nama tabel dan kolom menggunakan penamaan Bahasa Indonesia.

## 1. Diagram ERD (Mermaid)

```mermaid
erDiagram
    %% MANAJEMEN PENGGUNA & AKSES (RBAC)
    peran {
        uuid id PK
        varchar nama
        varchar deskripsi
        timestamp dibuat_pada
        timestamp diperbarui_pada
    }
    hak_akses {
        uuid id PK
        varchar nama
        varchar deskripsi
    }
    peran_hak_akses {
        uuid id_peran FK
        uuid id_hak_akses FK
    }
    pengguna {
        uuid id PK
        uuid id_peran FK
        varchar surel
        varchar kata_sandi
        varchar nama_lengkap
        text profil
        boolean aktif
        timestamp login_terakhir
        timestamp dibuat_pada
    }

    %% MEDIA
    media {
        uuid id PK
        varchar nama_file
        varchar nama_file_asli
        varchar tipe_mime
        integer ukuran
        varchar url
        varchar teks_alternatif
        varchar takarir
        text deskripsi
        integer lebar
        integer tinggi
        uuid dibuat_oleh FK
        timestamp dibuat_pada
        timestamp diperbarui_pada
    }

    %% KONTEN UTAMA
    artikel {
        uuid id PK
        varchar judul
        varchar subjudul
        varchar slug
        text konten
        text kutipan
        uuid id_gambar_unggulan FK
        uuid id_penulis FK
        varchar status "draf, terbit, jadwal, sampah"
        timestamp diterbitkan_pada
        timestamp dibuat_pada
        timestamp diperbarui_pada
    }
    halaman {
        uuid id PK
        varchar judul
        varchar subjudul
        varchar slug
        text konten
        uuid id_induk FK
        uuid id_gambar_unggulan FK
        uuid id_penulis FK
        varchar templat
        varchar status
        timestamp diterbitkan_pada
        timestamp dibuat_pada
    }

    %% TAKSONOMI
    kategori {
        uuid id PK
        varchar nama
        varchar slug
        text deskripsi
        uuid id_induk FK
    }
    label_tag {
        uuid id PK
        varchar nama
        varchar slug
        text deskripsi
    }
    artikel_kategori {
        uuid id_artikel FK
        uuid id_kategori FK
    }
    artikel_label {
        uuid id_artikel FK
        uuid id_label FK
    }

    %% HOMEPAGE BUILDER
    beranda {
        uuid id PK
        varchar nama
        varchar status "draf, terbit"
        timestamp dibuat_pada
        timestamp diperbarui_pada
    }
    bagian_beranda {
        uuid id PK
        uuid id_beranda FK
        varchar tipe
        varchar nama
        integer posisi
        boolean aktif
        jsonb pengaturan "Menyimpan layout, design, content source"
        timestamp dibuat_pada
    }

    %% SEO & METADATA (Polymorphic)
    metadata_seo {
        uuid id PK
        varchar tipe_konten "artikel, halaman"
        uuid id_konten
        varchar judul_seo
        varchar deskripsi_meta
        varchar kata_kunci_fokus
        varchar url_kanonikal
        boolean indeks_robot
        boolean ikuti_robot
        varchar tipe_skema
        varchar judul_og
        text deskripsi_og
        uuid id_gambar_og FK
        timestamp diperbarui_pada
    }

    %% PENGATURAN & NAVIGASI
    menu {
        uuid id PK
        varchar nama
        varchar lokasi "header, footer"
    }
    item_menu {
        uuid id PK
        uuid id_menu FK
        uuid id_induk FK
        varchar judul
        varchar tipe "tautan_khusus, halaman, artikel, kategori"
        varchar url
        uuid id_referensi
        integer posisi
    }
    pengaturan_global {
        uuid id PK
        varchar kunci
        text nilai
        varchar grup "umum, branding, permalink"
    }
    pengalihan {
        uuid id PK
        varchar url_asal
        varchar url_tujuan
        integer kode_status "301, 302"
        boolean aktif
    }

    %% REVISI & AUDIT
    revisi {
        uuid id PK
        varchar tipe_konten
        uuid id_konten
        integer versi
        jsonb konten "Snapshot dari post/page/homepage"
        uuid dibuat_oleh FK
        timestamp dibuat_pada
    }
    log_audit {
        uuid id PK
        uuid id_pengguna FK
        varchar aksi
        varchar tipe_entitas
        uuid id_entitas
        jsonb rincian
        varchar alamat_ip
        timestamp dibuat_pada
    }

    %% RELASI
    peran ||--o{ pengguna : "memiliki"
    peran ||--o{ peran_hak_akses : "mendefinisikan"
    hak_akses ||--o{ peran_hak_akses : "diberikan pada"
    
    pengguna ||--o{ artikel : "menulis"
    pengguna ||--o{ halaman : "membuat"
    pengguna ||--o{ media : "mengunggah"
    pengguna ||--o{ log_audit : "tercatat"
    
    media ||--o{ artikel : "sebagai gambar unggulan"
    media ||--o{ halaman : "sebagai gambar unggulan"
    media ||--o{ metadata_seo : "sebagai gambar OG"
    
    artikel ||--o{ artikel_kategori : "diklasifikasikan"
    kategori ||--o{ artikel_kategori : "mengelompokkan"
    kategori ||--o{ kategori : "memiliki sub-kategori"
    
    artikel ||--o{ artikel_label : "ditandai"
    label_tag ||--o{ artikel_label : "menandai"
    
    halaman ||--o{ halaman : "memiliki sub-halaman"
    
    beranda ||--o{ bagian_beranda : "terdiri dari"
    
    menu ||--o{ item_menu : "memiliki"
    item_menu ||--o{ item_menu : "memiliki sub-menu"
```

## 2. Rasionalisasi Desain Database Berdasarkan PRD

Desain tabel dan relasi di atas dirancang secara spesifik untuk menjawab kebutuhan sistem berdasarkan dokumen panduan awal:

### A. Fleksibilitas Struktur (JSONB pada `bagian_beranda`)
Tabel `bagian_beranda` (*homepage_sections*) menggunakan kolom tipe `jsonb` bernama `pengaturan`. Ini krusial karena PRD Bab 18 & 43 menuntut Homepage Builder untuk menyimpan `Content`, `Design`, `Layout`, dan `Advanced Settings` yang bentuk/skemanya sangat bervariasi bergantung pada tipe seksi (misal: hero vs grid konten). Jika menggunakan kolom relasional biasa, tabel akan mengalami pembengkakan (kolom kosong/null yang masif).

### B. Pemisahan Total Data CMS (Polymorphism)
PRD Bab 25, 41, dan 61 menekankan pemisahan *Content* dan *Configuration*. Oleh sebab itu:
- **`metadata_seo`** dipisah dan dirancang *polymorphic* (`tipe_konten` & `id_konten`). Hal ini mencegah pelebaran struktur (bloating) pada tabel utama `artikel` maupun `halaman`, sekaligus memperlancar logika React saat hanya membutuhkan data publik.
- **`revisi`** juga menggunakan pola *polymorphic*. Dengan menyimpan format snapshot JSON di kolom `konten`, sistem bisa me-restore tidak hanya artikel/halaman, tapi juga arsitektur visual Beranda (PRD Bab 32 & 36).

### C. Efisiensi File Objek (Tabel `media`)
Diselaraskan dengan arahan Bab 7 dan Bab 15, PostgreSQL murni berperan sebagai *metadata registry* untuk media. Binary file ditaruh di *Object Storage*. Semua tabel konten (`artikel`, `halaman`, `metadata_seo`) hanya menyimpan *Foreign Key* ke tabel `media` guna mempertahankan konsistensi referensial untuk Alt text dan Caption tanpa redundansi text string berulang di database.

### D. Hierarki & Taksonomi Berjenjang
Bab 13 dan Bab 29 menitikberatkan pada Parent-Child relationship. Skema relasional yang dipakai adalah *Self-Referencing Foreign Keys* pada:
- `kategori` (`id_induk` mengarah ke `id` kategori).
- `halaman` (`id_induk` mengarah ke `id` halaman pembentuk parent/child URL struktur hirarki page).
- `item_menu` memungkinkan infinite nesting untuk navigasi dropdown multi-level.

### E. RBAC (Role-Based Access Control) Murni
Sistem akses tidak "hard-coded" pada entitas tabel *pengguna*, melainkan dijembatani melalui `peran` dan tabel junction `peran_hak_akses`. Ini memenuhi requirement Bab 9.3 (Permission Examples), sehingga admin bisa secara dinamis mencabut/memberi izin seperti `posts.delete` tanpa merombak sistem atau source code backend.
