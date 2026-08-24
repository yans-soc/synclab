# Desain Database Skema Inti - CMS PostgreSQL

Dokumen ini mendefinisikan struktur skema database PostgreSQL untuk arsitektur CMS (Content Management System) yang menggunakan React dan Node.js. 
Sesuai standar penamaan, seluruh tabel dan kolom didefinisikan menggunakan **Bahasa Indonesia**.

## 1. Manajemen Pengguna & Akses (RBAC)

### Tabel `peran` (Roles)
Menyimpan daftar peran (misal: Administrator, Editor, Penulis).
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik peran |
| `nama` | VARCHAR(50) | Nama peran (Unik) |
| `deskripsi` | TEXT | Penjelasan peran |
| `dibuat_pada` | TIMESTAMP | Waktu pembuatan |
| `diperbarui_pada` | TIMESTAMP | Waktu pembaruan terakhir |

### Tabel `hak_akses` (Permissions)
Menyimpan daftar hak akses spesifik (misal: `artikel.buat`, `pengguna.hapus`).
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik hak akses |
| `nama` | VARCHAR(100) | Kode/nama hak akses (Unik) |
| `deskripsi` | TEXT | Penjelasan fungsionalitas |

### Tabel `peran_hak_akses` (Role Permissions)
Tabel *junction* yang memetakan peran ke hak akses.
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id_peran` | UUID (FK) | Merujuk ke `peran.id` |
| `id_hak_akses` | UUID (FK) | Merujuk ke `hak_akses.id` |

*(Primary Key gabungan: `id_peran`, `id_hak_akses`)*

### Tabel `pengguna` (Users)
Menyimpan data otentikasi dan profil pengguna.
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik pengguna |
| `id_peran` | UUID (FK) | Merujuk ke `peran.id` |
| `surel` | VARCHAR(255) | Email otentikasi (Unik) |
| `kata_sandi` | VARCHAR(255) | Hash *password* (Bcrypt/Argon2) |
| `nama_lengkap` | VARCHAR(150) | Nama tampilan pengguna |
| `profil` | TEXT | Deskripsi/Bio pengguna |
| `aktif` | BOOLEAN | Status *enable/disable* (Default: true) |
| `login_terakhir`| TIMESTAMP | Waktu akses terakhir |
| `dibuat_pada` | TIMESTAMP | Waktu pembuatan akun |

---

## 2. Pustaka Media

### Tabel `media`
Menyimpan metadata untuk file gambar, video, atau dokumen (file fisik di *Object Storage*).
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik file |
| `nama_file` | VARCHAR(255) | Nama file acak untuk penyimpanan |
| `nama_file_asli`| VARCHAR(255) | Nama file sebelum diunggah |
| `tipe_mime` | VARCHAR(100) | MIME Type (misal: `image/jpeg`) |
| `ukuran` | INTEGER | Ukuran file dalam bytes |
| `url` | VARCHAR(500) | Tautan absolut/relatif ke objek |
| `teks_alternatif`| VARCHAR(255) | Alt Text untuk SEO/Aksesibilitas |
| `takarir` | VARCHAR(255) | *Caption* gambar |
| `deskripsi` | TEXT | Keterangan internal |
| `lebar` | INTEGER | Dimensi gambar (jika tipe gambar) |
| `tinggi` | INTEGER | Dimensi gambar (jika tipe gambar) |
| `dibuat_oleh` | UUID (FK) | Merujuk ke `pengguna.id` |
| `dibuat_pada` | TIMESTAMP | Waktu diunggah |
| `diperbarui_pada`| TIMESTAMP | Waktu pembaruan metadata |

---

## 3. Manajemen Konten Inti

### Tabel `artikel` (Posts)
Menyimpan konten blog/artikel yang bersifat dinamis dan memiliki aliran waktu.
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik artikel |
| `judul` | VARCHAR(255) | Judul utama |
| `subjudul` | VARCHAR(255) | Subjudul pendukung (Opsional) |
| `slug` | VARCHAR(255) | URL-friendly string (Unik) |
| `konten` | TEXT / JSONB| Struktur *Block-based content* |
| `kutipan` | TEXT | Ringkasan/Excerpt |
| `id_gambar_unggulan`| UUID (FK) | Merujuk ke `media.id` |
| `id_penulis` | UUID (FK) | Merujuk ke `pengguna.id` |
| `status` | VARCHAR(50) | `draf`, `terbit`, `jadwal`, `sampah` |
| `diterbitkan_pada`| TIMESTAMP | Waktu *publish* |
| `dibuat_pada` | TIMESTAMP | Waktu draf pertama dibuat |
| `diperbarui_pada`| TIMESTAMP | Waktu pengubahan terakhir |

### Tabel `halaman` (Pages)
Menyimpan konten statis (About, Contact, Terms, dll) dengan struktur hirarki.
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik halaman |
| `judul` | VARCHAR(255) | Judul halaman |
| `subjudul` | VARCHAR(255) | Subjudul halaman (Opsional) |
| `slug` | VARCHAR(255) | URL-friendly string (Unik) |
| `konten` | TEXT / JSONB| Struktur *Block-based content* |
| `id_induk` | UUID (FK) | Merujuk ke `halaman.id` (*Self-reference*) |
| `id_gambar_unggulan`| UUID (FK) | Merujuk ke `media.id` |
| `id_penulis` | UUID (FK) | Merujuk ke `pengguna.id` |
| `templat` | VARCHAR(100) | Layout khusus (jika ada) |
| `status` | VARCHAR(50) | `draf`, `terbit`, `sampah` |
| `diterbitkan_pada`| TIMESTAMP | Waktu terbit |
| `dibuat_pada` | TIMESTAMP | Waktu draf dibuat |

---

## 4. Taksonomi (Kategori & Label)

### Tabel `kategori`
Pengelompokan hirarkis untuk artikel.
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik kategori |
| `nama` | VARCHAR(100) | Nama kategori |
| `slug` | VARCHAR(100) | URL-friendly string (Unik) |
| `deskripsi` | TEXT | Keterangan singkat kategori |
| `id_induk` | UUID (FK) | Merujuk ke `kategori.id` (*Nested*) |

### Tabel `label_tag` (Tags)
Topik tidak berstruktur untuk artikel.
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik label |
| `nama` | VARCHAR(100) | Nama label |
| `slug` | VARCHAR(100) | URL-friendly string (Unik) |
| `deskripsi` | TEXT | Keterangan singkat |

### Tabel `artikel_kategori` & `artikel_label`
Tabel *junction* untuk relasi *Many-to-Many*.
| Tabel | Kolom 1 | Kolom 2 | PK Gabungan |
| --- | --- | --- | --- |
| `artikel_kategori` | `id_artikel` (FK) | `id_kategori` (FK) | (`id_artikel`, `id_kategori`) |
| `artikel_label` | `id_artikel` (FK) | `id_label` (FK) | (`id_artikel`, `id_label`) |

---

## 5. Homepage Builder & Struktur Visual

### Tabel `beranda` (Homepages)
Konteks penyimpanan revisi / draf struktur halaman beranda.
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik konfigurasi beranda |
| `nama` | VARCHAR(100) | Alias (misal: "Versi Lebaran 2026") |
| `status` | VARCHAR(50) | `draf` atau `terbit` |
| `dibuat_pada` | TIMESTAMP | Waktu pembuatan |
| `diperbarui_pada`| TIMESTAMP | Waktu modifikasi terakhir |

### Tabel `bagian_beranda` (Homepage Sections)
Definisi tiap komponen visual yang menempel pada sebuah konfigurasi beranda.
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik seksi |
| `id_beranda` | UUID (FK) | Merujuk ke `beranda.id` |
| `tipe` | VARCHAR(50) | Identitas *Renderer* (misal: `artikel_terbaru`) |
| `nama` | VARCHAR(100) | Label internal seksi |
| `posisi` | INTEGER | Urutan urut *render* (Index dari 0) |
| `aktif` | BOOLEAN | *Toggle visibility* |
| `pengaturan` | JSONB | Data dinamis (Content, Design, Layout, Source) |
| `dibuat_pada` | TIMESTAMP | Waktu penambahan seksi |

---

## 6. SEO Metadata & Pengalihan (Redirect)

### Tabel `metadata_seo`
Disimpan terpisah dan bersifat polimorfik agar tidak menumpuk di tabel konten.
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik metadata SEO |
| `tipe_konten` | VARCHAR(50) | Menandakan target relasi (`artikel` / `halaman`) |
| `id_konten` | UUID | Nilai referensi target konten |
| `judul_seo` | VARCHAR(255) | Judul khusus *Search Engine* |
| `deskripsi_meta`| VARCHAR(500) | Cuplikan *Meta Description* |
| `kata_kunci_fokus`| VARCHAR(255)| *Focus Keyword* utama |
| `url_kanonikal` | VARCHAR(500) | *Canonical link* khusus |
| `indeks_robot` | BOOLEAN | Flag (true = `index`, false = `noindex`) |
| `ikuti_robot` | BOOLEAN | Flag (true = `follow`, false = `nofollow`) |
| `tipe_skema` | VARCHAR(100) | JSON-LD Schema (misal: `Article`, `FAQPage`) |
| `judul_og` | VARCHAR(255) | Judul untuk *Open Graph / Socmed* |
| `deskripsi_og` | TEXT | Deskripsi untuk *Open Graph* |
| `id_gambar_og` | UUID (FK) | Merujuk ke `media.id` untuk *thumbnail sharing* |
| `diperbarui_pada`| TIMESTAMP | Waktu modifikasi data SEO terakhir |

### Tabel `pengalihan` (Redirects)
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik pengalihan |
| `url_asal` | VARCHAR(500) | Path/URL lama |
| `url_tujuan` | VARCHAR(500) | Path/URL baru |
| `kode_status` | INTEGER | HTTP *Status code* (301 atau 302) |
| `aktif` | BOOLEAN | Status penerapan pengalihan |

---

## 7. Navigasi & Pengaturan Global

### Tabel `menu`
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik menu |
| `nama` | VARCHAR(100) | Nama menu (misal: "Menu Utama") |
| `lokasi` | VARCHAR(50) | Target *render* (`header`, `footer`) |

### Tabel `item_menu`
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik item |
| `id_menu` | UUID (FK) | Merujuk ke `menu.id` |
| `id_induk` | UUID (FK) | Merujuk ke `item_menu.id` (*Nested dropdown*) |
| `judul` | VARCHAR(100) | Label teks tautan |
| `tipe` | VARCHAR(50) | `halaman`, `artikel`, `kategori`, `tautan_khusus` |
| `url` | VARCHAR(500) | Path absolut atau string jika tipe *custom* |
| `id_referensi` | UUID | Relasi longgar ke ID entitas terkait (tergantung tipe) |
| `posisi` | INTEGER | Urutan *render* (Index dari 0) |

### Tabel `pengaturan_global` (Settings)
Format *Key-Value Store* untuk branding dan opsi sistem.
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik |
| `kunci` | VARCHAR(100) | Identifier unik (misal: `site_title`, `favicon_id`) |
| `nilai` | TEXT / JSONB| Nilai konfigurasi |
| `grup` | VARCHAR(50) | Kategori letak pengaturan (`umum`, `branding`) |

---

## 8. Pencatatan Audit & Revisi

### Tabel `revisi`
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID revisi unik |
| `tipe_konten` | VARCHAR(50) | Referensi ke `artikel`, `halaman`, `beranda` |
| `id_konten` | UUID | Identifier konten asli |
| `versi` | INTEGER | Nomor urut revisi beruntun |
| `konten` | JSONB | *Snapshot* penuh *payload* yang diubah |
| `dibuat_oleh` | UUID (FK) | Merujuk ke `pengguna.id` |
| `dibuat_pada` | TIMESTAMP | Waktu snapshot direkam |

### Tabel `log_audit` (Audit Logs)
Mencatat aktivitas admin untuk pemantauan keamanan.
| Kolom | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | UUID (PK) | ID unik log |
| `id_pengguna` | UUID (FK) | Merujuk ke `pengguna.id` yang memicu aksi |
| `aksi` | VARCHAR(100) | Nama aktivitas (misal: `MENGHAPUS_HALAMAN`) |
| `tipe_entitas` | VARCHAR(50) | Entitas terdampak (misal: `halaman`) |
| `id_entitas` | UUID | Identifier entitas |
| `rincian` | JSONB | Payload informasi tambahan tentang kejadian |
| `alamat_ip` | VARCHAR(45) | IP asal pengguna yang bertindak |
| `dibuat_pada` | TIMESTAMP | Waktu terekam |

---

## 9. Indeks yang Disarankan (Performance Tuning)
Untuk mengoptimalkan waktu baca (read-heavy CMS), direkomendasikan membuat B-Tree Indexing pada kolom pencarian dan foreign key:

1. `CREATE INDEX idx_artikel_slug ON artikel(slug);`
2. `CREATE INDEX idx_halaman_slug ON halaman(slug);`
3. `CREATE INDEX idx_artikel_status ON artikel(status);`
4. `CREATE INDEX idx_bagian_beranda_aktif ON bagian_beranda(id_beranda) WHERE aktif = true;`
5. `CREATE INDEX idx_metadata_seo_polymorph ON metadata_seo(tipe_konten, id_konten);`
6. `CREATE INDEX idx_pengalihan_url_asal ON pengalihan(url_asal) WHERE aktif = true;`
