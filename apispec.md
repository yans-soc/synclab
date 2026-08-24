# Spesifikasi REST API (apispec.md) - SYNCLAB CMS

Dokumen ini mendefinisikan kontrak RESTful API untuk **SYNCLAB CMS**. Seluruh payload request/response menggunakan Bahasa Indonesia untuk entitas database.

---

## 1. Public API (Landing Page & Konsumsi Publik)

### A. Mendapatkan Struktur Landing Page Aktif
* **Endpoint**: `GET /api/v1/beranda/aktif`
* **Deskripsi**: Mengambil seluruh seksi beranda yang berstatus `aktif = true` diurutkan berdasarkan `posisi`.
* **Response `200 OK`**:
  ```json
  {
    "sukses": true,
    "pesan": "Beranda aktif berhasil dimuat",
    "data": {
      "id_beranda": "e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
      "judul_beranda": "Tampilan Utama V1 SYNCLAB",
      "bagian": [
        {
          "id": "f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
          "judul_bagian": "Hero Section Utama",
          "tipe": "hero_section",
          "posisi": 1,
          "pengaturan": {
            "judul_utama": "Master the Tech Stack of Tomorrow",
            "deskripsi": "Dive deep into high-quality programming tutorials...",
            "cta": {
              "teks_tombol": "Start Learning",
              "url_tujuan": "/tutorials",
              "ikon": "arrow_forward"
            }
          }
        },
        {
          "id": "f2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
          "judul_bagian": "Grid Explore Topics",
          "tipe": "explore_topics",
          "posisi": 2,
          "pengaturan": {
            "subjudul": "Curated Knowledge Base",
            "judul_seksi": "Explore Topics"
          }
        }
      ]
    }
  }
  ```

---

### B. Mendapatkan Daftar Artikel Publik
* **Endpoint**: `GET /api/v1/artikel`
* **Query Parameters**:
  * `kategori` (opsional): Slug kategori (e.g., `web-dev`)
  * `halaman` (default: 1): Nomor halaman
  * `limit` (default: 10): Jumlah item per halaman
* **Response `200 OK`**:
  ```json
  {
    "sukses": true,
    "pesan": "Daftar artikel berhasil diambil",
    "data": [
      {
        "id": "d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
        "judul": "Building Scalable APIs with Node.js & PostgreSQL",
        "slug": "building-scalable-apis-nodejs-postgresql",
        "kutipan": "Pelajari cara merancang arsitektur API yang tangguh...",
        "diterbitkan_pada": "2026-08-22T10:00:00Z",
        "gambar_unggulan": "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
        "penulis": {
          "nama_lengkap": "Admin SYNCLAB",
          "foto_profil": null
        },
        "kategori": [
          {
            "nama": "Web Dev",
            "slug": "web-dev",
            "warna": "primary"
          }
        ]
      }
    ],
    "meta": {
      "halaman": 1,
      "limit": 10,
      "total_item": 3,
      "total_halaman": 1
    }
  }
  ```

---

### C. Mendapatkan Detail Artikel Berdasarkan Slug
* **Endpoint**: `GET /api/v1/artikel/:slug`
* **Response `200 OK`**:
  ```json
  {
    "sukses": true,
    "pesan": "Detail artikel berhasil ditemukan",
    "data": {
      "id": "d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
      "judul": "Building Scalable APIs with Node.js & PostgreSQL",
      "slug": "building-scalable-apis-nodejs-postgresql",
      "kutipan": "Pelajari cara merancang...",
      "konten": "## Pendahuluan\n\nDalam era aplikasi web modern...",
      "diterbitkan_pada": "2026-08-22T10:00:00Z",
      "gambar_unggulan": "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
      "penulis": {
        "nama_lengkap": "Admin SYNCLAB"
      },
      "kategori": [
        { "nama": "Web Dev", "slug": "web-dev" }
      ],
      "seo": {
        "judul_seo": "Building Scalable APIs with Node.js & PostgreSQL - SYNCLAB",
        "deskripsi_seo": "Tutorial lengkap membangun REST API scalable dengan Node.js",
        "kata_kunci": "nodejs, postgresql, rest api, backend"
      }
    }
  }
  ```

---

### D. Mendapatkan Menu Navigasi
* **Endpoint**: `GET /api/v1/menu/:lokasi`
* **Contoh Path**: `/api/v1/menu/header`
* **Response `200 OK`**:
  ```json
  {
    "sukses": true,
    "data": [
      { "id": "i1", "label": "Web Dev", "url": "/kategori/web-dev", "posisi": 1 },
      { "id": "i2", "label": "Linux", "url": "/kategori/linux", "posisi": 2 }
    ]
  }
  ```

---

## 2. Admin API (Otentikasi & Manajemen CMS)

### A. Otentikasi Admin (Login)
* **Endpoint**: `POST /api/v1/otentikasi/masuk`
* **Request Payload**:
  ```json
  {
    "surel": "admin@synclab.id",
    "kata_sandi": "SandiAman123!"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "sukses": true,
    "pesan": "Login berhasil",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "pengguna": {
        "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "nama_lengkap": "Admin SYNCLAB",
        "surel": "admin@synclab.id",
        "peran": "admin"
      }
    }
  }
  ```

---

### B. Membuat Artikel Baru (Admin / Editor)
* **Endpoint**: `POST /api/v1/admin/artikel`
* **Header**: `Authorization: Bearer <TOKEN>`
* **Request Payload**:
  ```json
  {
    "judul": "Panduan Praktis Docker untuk Pemula",
    "slug": "panduan-praktis-docker-pemula",
    "kutipan": "Langkah dasar menggunakan Docker container.",
    "konten": "## Apa itu Docker?... ",
    "status": "terbit",
    "id_gambar_unggulan": "m1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "kategori_ids": ["c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02"]
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "sukses": true,
    "pesan": "Artikel berhasil dibuat",
    "data": {
      "id": "d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
      "judul": "Panduan Praktis Docker untuk Pemula",
      "status": "terbit"
    }
  }
  ```
