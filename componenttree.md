# Pohon Komponen Frontend (componenttree.md) - SYNCLAB Landing Page

Dokumen ini menjelaskan struktur hirarki komponen React/Next.js untuk Landing Page SYNCLAB beserta instruksi pemetaannya ke API CMS.

---

## 1. Struktur Hirarki Komponen Landing Page

```text
<AppLayout>
 ├── <TopNavBar /> (Data dari GET /api/v1/menu/header & /api/v1/pengaturan)
 │    ├── <BrandLogo />
 │    ├── <NavLinks />
 │    └── <ThemeToggle />
 │
 ├── <MainContent>
 │    └── <LandingPageBuilder> (Data dari GET /api/v1/beranda/aktif)
 │         │
 │         ├── <HeroSection /> (Render jika tipe === 'hero_section')
 │         │    ├── <HeadlineTitle />
 │         │    ├── <BodyText />
 │         │    └── <PrimaryCTAButton />
 │         │
 │         ├── <CategoryExplorer /> (Render jika tipe === 'explore_topics')
 │         │    ├── <SectionHeader />
 │         │    └── <CategoryGrid>
 │         │         └── <CategoryCard /> (Data dari GET /api/v1/kategori)
 │         │
 │         ├── <LatestArticlesGrid /> (Render jika tipe === 'latest_articles')
 │         │    ├── <SectionHeader />
 │         │    └── <ArticleGrid>
 │         │         └── <ArticleCard /> (Data dari GET /api/v1/artikel?limit=3)
 │         │              ├── <CardThumbnail />
 │         │              ├── <CategoryBadge />
 │         │              ├── <ReadTimeIndicator />
 │         │              ├── <CardTitle />
 │         │              └── <CardExcerpt />
 │         │
 │         └── <CallToActionBanner /> (Render jika tipe === 'cta_banner')
 │
 └── <Footer /> (Data dari GET /api/v1/menu/footer)
      ├── <FooterBrandInfo />
      └── <FooterLinkColumns />
```

---

## 2. Pemetaan Props Komponen Utama

### A. `<HeroSection />`
* **Props**:
  ```typescript
  interface HeroSectionProps {
    judul_utama: string;
    deskripsi: string;
    cta: {
      teks_tombol: string;
      url_tujuan: string;
      ikon?: string;
    };
  }
  ```
* **Kelas Tailwind Utama**: `font-headline-lg`, `text-primary`, `bg-surface-container-lowest`.

---

### B. `<CategoryCard />`
* **Props**:
  ```typescript
  interface CategoryCardProps {
    nama: string;
    slug: string;
    deskripsi: string;
    warna: 'primary' | 'secondary' | 'tertiary' | 'ai-purple';
    ikon: string;
  }
  ```
* **Penanganan Warna Dinamis**:
  ```tsx
  const colorMap = {
    'primary': 'bg-primary/10 text-primary border-primary/20',
    'secondary': 'bg-secondary/10 text-secondary border-secondary/20',
    'tertiary': 'bg-tertiary/10 text-tertiary border-tertiary/20',
    'ai-purple': 'bg-ai-purple/10 text-ai-purple border-ai-purple/20'
  };
  ```

---

### C. `<ArticleCard />`
* **Props**:
  ```typescript
  interface ArticleCardProps {
    judul: string;
    slug: string;
    kutipan: string;
    diterbitkan_pada: string;
    gambar_unggulan: string;
    kategori: Array<{ nama: string; slug: string; warna: string }>;
  }
  ```
* **Utilitas Pengolah Waktu Baca**:
  ```typescript
  function hitungWaktuBaca(konten: string): number {
    const kataPerMenit = 200;
    const jumlahKata = konten.trim().split(/\s+/).length;
    return Math.ceil(jumlahKata / kataPerMenit);
  }
  ```

---

## 3. Komponen Panel Admin (Dashboard CMS)

Untuk manajemen konten di sisi Admin:

* **`<AdminLayout />`**: Sidebar navigasi CMS (`/admin/beranda`, `/admin/artikel`, `/admin/kategori`, `/admin/media`).
* **`<HomepageBuilder />`**: Interface *drag-and-drop* / pengatur susunan posisi `bagian_beranda`.
* **`<ArticleEditor />`**: Editor Markdown / WYSIWYG untuk mengelola kolom `konten` dan metadata SEO artikel.
* **`<MediaManagerModal />`**: Modal picker untuk memilih `id_gambar_unggulan` dari galeri tabel `media`.
