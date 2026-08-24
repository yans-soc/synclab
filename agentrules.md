# Agent Rules & Guidelines - SYNCLAB CMS Project

Dokumen ini berisi aturan baku (*System Prompt / Coding Guidelines*) yang wajib dipatuhi oleh setiap AI Coding Agent (Cursor, Copilot, Gemini, dll.) saat mengembangkan, merefaktor, atau menambahkan fitur pada repositori proyek **SYNCLAB CMS**.

---

## 1. Aturan Skema & Penamaan Database (STRICT RULE)

1. **Penggunaan Bahasa Indonesia**:
   - Seluruh nama tabel, nama kolom, *foreign key*, dan *junction table* di PostgreSQL **WAJIB** menggunakan **Bahasa Indonesia** dengan format `snake_case`.
   - **DILARANG HARAM** memuat istilah Bahasa Inggris pada nama tabel/kolom database (contoh keliru: `users`, `posts`, `created_at`; contoh benar: `pengguna`, `artikel`, `dibuat_pada`).
   - Rujukan skema utama wajib mengikuti berkas `database.md`.

2. **Tipe Data & Identifier**:
   - Seluruh *Primary Key* menggunakan tipe `UUID` (`id`).
   - Penamaan *Foreign Key* harus berawalan `id_` diikuti nama tabel tujuan (contoh: `id_pengguna`, `id_gambar_unggulan`).
   - Kolom audit waktu wajib menggunakan format `TIMESTAMP` (misal: `dibuat_pada`, `diperbarui_pada`).

---

## 2. Arsitektur Kode & Tech Stack

- **Frontend**: React.js dengan Tailwind CSS.
- **Backend**: Node.js (REST API / Controller-Service Pattern).
- **Database**: PostgreSQL dengan B-Tree Indexing teroptimasi.

### Frontend Guidelines (Tailwind & UI)
- **Desain Landing Page**: Wajib menyesuaikan dengan tokens dan skema warna Tailwind yang sudah didefinisikan pada `integrasi_landingpage.md` (menggunakan custom colors seperti `primary`, `secondary`, `tertiary`, `ai-purple`, `surface-container`, dll.).
- **Material Symbols**: Menggunakan font icon Google Material Symbols Outlined untuk elemen visual/icon.
- **Komponen Dinamis**: Komponen UI beranda (*Hero Section*, *Category Grid*, *Latest Articles*) harus dirancang *data-driven*, mengonsumsi API backend secara dinamis.

### Backend & API Guidelines
- **Payload Response**: API disarankan mengembalikan data JSON dengan format standar:
  ```json
  {
    "sukses": true,
    "pesan": "Berhasil mengambil data",
    "data": { ... }
  }
  ```
- **Keamanan (RBAC)**: Setiap middleware otorisasi wajib mengecek pemetaan pada tabel `peran_hak_akses`.
- **JSONB Parsing**: Kolom bertipe `JSONB` (seperti `bagian_beranda.pengaturan` atau `revisi.konten`) wajib divalidasi dengan *schema validator* (seperti Zod/Joi) sebelum disimpan ke database.

---

## 3. Instruksi Khusus Pengembangan Fitur

1. **Homepage Builder**:
   - Tambah/edit seksi landing page tidak boleh mengubah kode sumber frontend secara langsung (*hardcode*), melainkan melalui manipulasi entitas `beranda` dan `bagian_beranda`.
2. **SEO & Metadata**:
   - Setiap kali halaman/artikel dibuat, pastikan fungsionalitas penulisan relasi ke `metadata_seo` disediakan melalui *polymorphic identifier* (`tipe_konten` & `id_konten`).
3. **Pencatatan Log Audit**:
   - Setiap operasi mutating (INSERT/UPDATE/DELETE) oleh pengguna berelevansi tinggi wajib dicatat ke dalam tabel `log_audit`.

---

## 4. Checklist Verifikasi AI Agent

Sebelum menyelesaikan tugas (*Task Completion*), pastikan AI Agent memeriksa hal-hal berikut:
- [ ] Apakah ada nama tabel/kolom baru yang tidak sengaja menggunakan Bahasa Inggris? (Jika ada, ubah ke Bahasa Indonesia).
- [ ] Apakah kode komponen React sudah selaras dengan token Tailwind CSS di `integrasi_landingpage.md`?
- [ ] Apakah query SQL sudah menggunakan sintaks PostgreSQL yang valid dan menyertakan relasi FK yang tepat?
- [ ] Apakah pengujian API mengembalikan struktur data yang konsisten?
