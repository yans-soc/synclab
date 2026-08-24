# Panduan Integrasi Landing Page SYNCLAB dengan CMS

Dokumen ini menjelaskan bagaimana struktur HTML statis dari Landing Page SYNCLAB dipetakan ke dalam desain database CMS PostgreSQL yang telah dibuat sebelumnya. Pendekatan ini memungkinkan *Hero Section*, *Call to Action* (CTA), dan *Grid Postingan* dikelola secara dinamis melalui panel admin.

---

## 1. Integrasi Hero Section & CTA

Bagian *Hero* (teks utama dan tombol CTA) akan dikelola menggunakan arsitektur *Homepage Builder* pada tabel `beranda` dan `bagian_beranda`.

### Pemetaan Elemen HTML:
```html
<!-- Data Statis HTML -->
<h1 class="...">Master the Tech Stack of Tomorrow</h1>
<p class="...">Dive deep into high-quality...</p>
<button class="...">Start Learning</button>
```

### Penyimpanan di Database:
Data ini disimpan di tabel `bagian_beranda` dengan tipe render khusus (misal: `tipe = 'hero_section'`). Kolom `pengaturan` (JSONB) akan berisi payload berikut:

```json
{
  "judul_utama": "Master the Tech Stack of Tomorrow",
  "deskripsi": "Dive deep into high-quality programming tutorials designed for developers and systems architects. Build precision, ensure clarity, and understand what's under the hood.",
  "cta": {
    "teks_tombol": "Start Learning",
    "ikon": "arrow_forward",
    "url_tujuan": "/tutorials"
  },
  "desain": {
    "warna_tombol": "primary"
  }
}
```

**Alur Kerja API:**
1. Frontend memanggil *endpoint* `/api/beranda/aktif`.
2. API mengembalikan daftar seksi beranda yang berstatus `aktif = true` diurutkan berdasarkan `posisi`.
3. Frontend merender komponen `<HeroSection />` menggunakan data JSON di atas.

---

## 2. Integrasi Grid "Explore Topics" (Kategori)

Bagian kategori ("Web Dev", "Linux", "Network", "AI") dipetakan ke tabel `kategori`.

### Pemetaan Database:
Tabel `kategori` akan memiliki data sebagai berikut:
- Kategori 1: `nama = 'Web Dev'`, `slug = 'web-dev'`
- Kategori 2: `nama = 'Linux'`, `slug = 'linux'`

*Catatan: Ikon dan warna (seperti `bg-secondary`, warna ikon, dsb) dapat disimpan di dalam tabel pengaturan global atau ditambahkan sebagai kolom `metadata` (JSONB) di tabel `kategori` untuk manajemen warna per kategori.*

---

## 3. Integrasi Grid "Latest Articles"

Grid ini adalah area paling dinamis. Artikel akan ditarik dari tabel `artikel`, direlasikan dengan tabel `media` (untuk gambar *thumbnail*), dan tabel `kategori` (untuk label/tag kategori).

### Pemetaan Elemen HTML ke Kolom Database:

| Elemen HTML / UI | Sumber Tabel & Kolom Database | Keterangan |
| :--- | :--- | :--- |
| **Gambar Latar (Thumbnail)** | `media.url` | Didapat dari relasi `artikel.id_gambar_unggulan` ke `media.id`. |
| **Label Kategori** | `kategori.nama` | Didapat dari relasi melalui *junction table* `artikel_kategori`. |
| **Waktu Baca (Read Time)** | *Dihitung secara dinamis* | Biasanya dihitung di *backend* / *frontend* berdasarkan panjang teks di `artikel.konten` (rata-rata 200 kata/menit). |
| **Judul Artikel** | `artikel.judul` | Judul postingan (contoh: "Building Scalable APIs..."). |
| **Kutipan (Excerpt)** | `artikel.kutipan` | Ringkasan singkat postingan. Tampil di bawah judul. |
| **Tautan Artikel** | `artikel.slug` | URL klik untuk masuk ke halaman detail artikel (contoh: `/artikel/building-scalable-apis`). |

### Contoh Query SQL yang Menjadi Basis Endpoint API:
Untuk menampilkan 3 postingan terbaru berstatus *terbit*:

```sql
SELECT 
    a.judul, 
    a.slug, 
    a.kutipan, 
    a.diterbitkan_pada,
    m.url AS url_gambar,
    k.nama AS nama_kategori
FROM artikel a
LEFT JOIN media m ON a.id_gambar_unggulan = m.id
LEFT JOIN artikel_kategori ak ON a.id = ak.id_artikel
LEFT JOIN kategori k ON ak.id_kategori = k.id
WHERE a.status = 'terbit'
ORDER BY a.diterbitkan_pada DESC
LIMIT 3;
```

---

## 4. Integrasi Menu Navigasi & Footer

Navigasi atas (TopNavBar) dan tautan Footer diintegrasikan menggunakan tabel `menu` dan `item_menu`.

1. **TopNavBar:** Menggunakan menu dengan `lokasi = 'header'`.
   - Data `item_menu`: "Web Dev", "Linux", dll. Mengarah ke filter kategori.
2. **Footer Links:** Menggunakan menu dengan `lokasi = 'footer'`.
   - Data `item_menu`: "Documentation", "API", "Privacy", "Terms". Tautan ini bisa dihubungkan ke data tabel `halaman` (Halaman Statis).

---

## 5. Integrasi Pengaturan Global (Branding)

Teks "SYNCLAB", logo, dan tautan sosial media dikelola dari tabel `pengaturan_global`. 
- `kunci = 'site_title'`, `nilai = 'SYNCLAB'`
- `kunci = 'site_description'`, `nilai = 'Tech Tutorials'` 
Ini memastikan SEO dan judul *Header* sinkron secara global tanpa perlu mengubah kode sumber HTML (hardcode).
