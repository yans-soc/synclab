# CMS WordPress-like — Final Feature Recap

## Stack

- **Frontend:** React
- **Backend:** Node.js
- **Database:** PostgreSQL
- **Architecture:** React → Node.js API → PostgreSQL
- **Media:** Object storage / filesystem, PostgreSQL menyimpan metadata dan referensi file
- **Database JSON:** PostgreSQL `JSONB` untuk konfigurasi section/page builder yang fleksibel

---

# 1. Dashboard

Dashboard admin untuk melihat kondisi dan aktivitas website.

### Fitur

- Ringkasan jumlah Posts
- Ringkasan jumlah Pages
- Draft
- Scheduled content
- Published content
- Recent posts
- Recent pages
- Recent media
- Aktivitas pengguna
- Quick action:
  - Add Post
  - Add Page
  - Upload Media
  - Edit Homepage
- Statistik dasar website jika analytics tersedia

---

# 2. Posts

Modul untuk membuat dan mengelola artikel/blog.

### Fitur

- Create Post
- Edit Post
- Delete / Trash
- Restore
- Duplicate Post
- Draft
- Publish
- Schedule
- Preview
- Autosave
- Revision
- Bulk Edit
- Search
- Filter
- Author
- Category
- Tags
- Featured Image
- Excerpt
- Slug
- Publish Date
- Visibility
- Comments
- SEO per Post

### Field utama

```text
id
title
subtitle
slug
content
excerpt
featured_image_id
author_id
status
published_at
created_at
updated_at
```

### Status

```text
draft
published
scheduled
trash
```

---

# 3. Pages

Modul untuk halaman statis seperti Home, About, Contact, Services, Privacy Policy, dan lainnya.

### Fitur

- Create Page
- Edit Page
- Delete / Trash
- Restore
- Duplicate
- Draft
- Publish
- Schedule
- Preview
- Revision
- Autosave
- Featured Image
- Slug
- Parent Page
- Child Page
- Page Template
- SEO per Page

### Field utama

```text
id
title
subtitle
slug
content
status
template
parent_id
featured_image_id
author_id
published_at
created_at
updated_at
```

---

# 4. Content Editor

Editor utama untuk membuat konten Post dan Page.

## Konsep

Disarankan menggunakan **block-based editor**, bukan hanya textarea HTML.

### Block yang dapat disediakan

- Paragraph
- Heading H1-H6
- Image
- Gallery
- Video
- Quote
- Bullet List
- Ordered List
- Link
- Button
- Divider
- Table
- Code
- Embed
- Columns
- Spacer
- Custom Block

### Contoh struktur content

```json
[
  {
    "type": "paragraph",
    "content": "Ini adalah paragraf."
  },
  {
    "type": "heading",
    "level": 2,
    "content": "Judul Section"
  },
  {
    "type": "image",
    "mediaId": "uuid"
  }
]
```

---

# 5. Categories

Untuk mengelompokkan Post.

### Fitur

- Create Category
- Edit Category
- Delete Category
- Category Description
- Category Slug
- Parent Category
- Nested Category
- Post Count

### Database

```text
categories
----------------
id
name
slug
description
parent_id
created_at
updated_at
```

Contoh:

```text
Technology
├── Web Development
│   ├── React
│   └── Node.js
└── Database
```

---

# 6. Tags

Untuk memberikan label/topik tambahan pada Post.

### Fitur

- Create Tag
- Edit Tag
- Delete Tag
- Tag Description
- Tag Slug
- Post Count
- Search

### Database

```text
tags
----------------
id
name
slug
description
created_at
updated_at
```

Relasi:

```text
post_tags
----------------
post_id
tag_id
```

---

# 7. Media Library

Pusat pengelolaan gambar, dokumen, video, dan file lainnya.

### Fitur

- Upload
- Delete
- Replace
- Search
- Filter
- Preview
- Select Media
- Copy URL
- Alt Text
- Caption
- Description
- Filename
- MIME Type
- File Size
- Width
- Height
- Created By

### Database

```text
media
----------------
id
filename
original_filename
mime_type
size
url
alt_text
caption
description
width
height
created_by
created_at
updated_at
```

> File fisik sebaiknya tidak disimpan langsung di PostgreSQL. PostgreSQL menyimpan metadata dan URL/reference file.

---

# 8. Homepage Builder

Homepage harus dibuat sebagai **visual section builder**, bukan hanya Page biasa.

Tujuannya agar admin dapat mengatur:

- Section yang muncul
- Urutan section
- Layout
- Desain
- Teks
- Gambar
- CTA
- Post yang ditampilkan
- Kategori Post
- Jumlah Post
- Background
- Visibility
- Desktop/mobile visibility
- Integrasi dengan data CMS

---

# 9. Homepage Sections

Section bawaan yang disarankan:

- Hero
- Rich Text
- Image + Text
- Features
- Services
- Posts
- Featured Post
- Latest Posts
- Category Posts
- Popular Posts
- Related Posts
- Testimonials
- Team
- Gallery
- Video
- FAQ
- Pricing
- Stats
- Logo Cloud
- CTA
- Newsletter
- Contact
- Spacer
- Custom HTML

---

# 10. Homepage Section Management

Setiap section dapat:

- Add
- Edit
- Delete
- Duplicate
- Enable / Disable
- Drag & Drop
- Reorder
- Preview
- Save Draft
- Publish

Contoh:

```text
Homepage

☰ Hero
☰ Introduction
☰ Services
☰ Latest Posts
☰ Testimonials
☰ CTA
```

---

# 11. Homepage Section Settings

Setiap section memiliki pengaturan:

```text
Content
Design
Layout
Advanced
```

## Content

Contoh:

```text
Title
Subtitle
Description
Image
Button
Button URL
```

## Design

```text
Background
Text Color
Overlay
Border Radius
Image Position
```

## Layout

```text
Container Width
Columns
Alignment
Spacing
Padding
```

## Advanced

```text
Custom CSS Class
HTML ID
Visibility
Desktop
Tablet
Mobile
```

---

# 12. Homepage Data Source

Setiap section dapat mengambil data dari CMS.

## Static

Admin memasukkan konten secara manual.

```text
Source: Static
```

## Posts

```text
Source: Posts
```

Filter:

- Manual Selection
- Latest Posts
- Category
- Tag
- Author
- Limit
- Sort

## Pages

```text
Source: Pages
```

## Categories

```text
Source: Categories
```

## Media

```text
Source: Media
```

## Custom

Data khusus yang ditentukan aplikasi.

---

# 13. Post Section di Homepage

Section Post dapat memiliki:

```text
Content Source
----------------
Manual Selection
Latest Posts
Category
Tag
Author
```

Pengaturan:

```text
Category
Tag
Author
Limit
Sort
Layout
```

Layout:

- Grid
- List
- Masonry
- Featured + Grid
- Carousel
- Horizontal Scroll

Contoh:

```text
Source: Posts
Category: Technology
Limit: 6
Sort: Latest
Layout: Grid
Columns: 3
```

Ketika Post baru dipublish, section akan otomatis menampilkan data terbaru sesuai konfigurasi.

---

# 14. Homepage Section Templates

Untuk mempercepat pembuatan homepage, sediakan template.

## Hero

- Hero Split
- Hero Center
- Hero Fullscreen
- Hero Image Background

## Posts

- 3 Card Grid
- 4 Card Grid
- Featured + 3 Cards
- Horizontal List
- Carousel

## CTA

- Center CTA
- Split CTA
- Image CTA

Template hanya menjadi starting point dan tetap bisa diedit.

---

# 15. Homepage Draft, Preview & Publish

Homepage memiliki lifecycle sendiri.

```text
Draft
  ↓
Preview
  ↓
Publish
```

Fitur:

- Save Draft
- Preview
- Publish
- Unpublish
- Revision
- Restore Revision
- Desktop Preview
- Tablet Preview
- Mobile Preview

Dengan demikian perubahan homepage tidak langsung memengaruhi halaman live sebelum admin menekan Publish.

---

# 16. Homepage Revision

Menyimpan versi homepage.

Contoh:

```text
Version 1
Version 2
Version 3
Version 4
```

Fitur:

- View Revision
- Compare
- Restore
- Publish Revision

---

# 17. Homepage Database

Disarankan:

```text
homepages
----------------
id
name
status
created_at
updated_at
```

dan:

```text
homepage_sections
----------------
id
homepage_id
type
name
position
is_enabled
settings
created_at
updated_at
```

`settings` menggunakan PostgreSQL `JSONB`.

Contoh:

```json
{
  "title": "Artikel Terbaru",
  "subtitle": "Baca artikel terbaru kami",
  "source": {
    "type": "posts",
    "categoryId": "abc123",
    "limit": 6,
    "sort": "latest"
  },
  "layout": {
    "type": "grid",
    "columns": 3
  }
}
```

---

# 18. SEO Global

SEO yang berlaku untuk keseluruhan website.

### Fitur

- Global SEO Title
- Global Meta Description
- Default Open Graph Image
- Robots
- XML Sitemap
- Canonical
- Organization Schema
- Website Schema
- Social Profiles
- Search Console Verification
- Analytics Integration
- Breadcrumb
- Default Schema

---

# 19. SEO Per Post / Page

Setiap Post dan Page memiliki pengaturan SEO sendiri.

### Fitur

- SEO Title
- Meta Description
- Focus Keyword
- Canonical URL
- Robots Index
- Robots Follow
- Schema Type
- Open Graph Title
- Open Graph Description
- Open Graph Image
- Twitter/X Title
- Twitter/X Description
- Twitter/X Image
- SEO Preview
- Noindex
- Nofollow

### Database

```text
seo_metadata
----------------
id
content_type
content_id
seo_title
meta_description
focus_keyword
canonical_url
robots_index
robots_follow
schema_type
og_title
og_description
og_image_id
twitter_title
twitter_description
twitter_image_id
created_at
updated_at
```

---

# 20. SEO Features

Fitur SEO tambahan:

- XML Sitemap
- Robots.txt
- Canonical URL
- Meta Robots
- Open Graph
- Twitter/X Card
- Schema Markup
- Breadcrumb
- Internal Linking Support
- Image SEO
- Redirect
- 404 Management
- Search Engine Verification
- SEO Preview

---

# 21. Permalinks

Pengaturan struktur URL website.

### Contoh

```text
Post:
 /blog/:slug

Page:
 /:slug

Category:
 /category/:slug

Tag:
 /tag/:slug
```

### Fitur

- Post URL Structure
- Page URL Structure
- Category Base
- Tag Base
- Custom Structure
- Slug Editor
- Trailing Slash Configuration
- URL Validation
- Redirect ketika slug berubah

Disarankan default:

```text
/blog/judul-artikel/
```

atau:

```text
/judul-artikel/
```

sesuai kebutuhan website.

---

# 22. Slug & Redirect

Jika:

```text
/jasa-seo
```

diubah menjadi:

```text
/layanan-seo
```

sistem dapat otomatis membuat:

```text
/jasa-seo → /layanan-seo
```

Database:

```text
redirects
----------------
id
source_url
destination_url
status_code
is_active
created_at
updated_at
```

Status yang disediakan:

```text
301 Permanent
302 Temporary
```

---

# 23. Title, Subtitle & Heading

## Site Title

Nama utama website.

## Tagline

Slogan/deskripsi singkat website.

## Post/Page Title

Judul utama konten.

## Subtitle

Subjudul pendukung konten.

## SEO Title

Judul khusus untuk search engine.

## Heading

```text
H1
H2
H3
H4
H5
H6
```

Title dan SEO Title harus dapat dibuat berbeda.

Contoh:

```text
Title:
Panduan SEO WordPress

Subtitle:
Cara meningkatkan ranking website secara organik

SEO Title:
Panduan SEO WordPress untuk Pemula | Brand
```

---

# 24. Branding

Pengaturan identitas visual website.

### Fitur

- Site Title
- Tagline
- Logo
- Mobile Logo
- Favicon / Site Icon
- Default Open Graph Image
- Brand Settings

---

# 25. Logo

### Fitur

- Upload Logo
- Custom Logo
- Logo Width
- Logo Height
- Mobile Logo
- Sticky Header Logo
- Dark/Light Logo
- Logo Link
- Alt Text
- Retina Logo jika diperlukan

Logo biasanya mengarah ke Homepage.

---

# 26. Favicon / Site Icon

### Fitur

- Upload Favicon
- Site Icon
- Browser Icon
- Bookmark Icon
- Mobile/Web App Icon
- Favicon Preview

Disarankan menggunakan simbol/logo sederhana yang tetap jelas pada ukuran kecil.

---

# 27. Header

Modul header untuk mengatur bagian atas website.

### Fitur

- Logo
- Navigation
- Menu
- CTA
- Search
- Social Links
- Sticky Header
- Desktop Header
- Mobile Header
- Header Variants

---

# 28. Footer

Modul footer.

### Fitur

- Footer Columns
- Menu
- Logo
- Description
- Social Links
- Contact
- Newsletter
- Copyright
- Custom Text
- Footer Widgets/Blocks

---

# 29. Menu Management

Membuat navigation menu.

### Fitur

- Create Menu
- Edit Menu
- Delete Menu
- Drag & Drop
- Nested Menu
- Page Menu Item
- Post Menu Item
- Category Menu Item
- Custom URL
- External Link
- Header Menu
- Footer Menu

Contoh:

```text
Main Menu
├── Home
├── About
├── Services
│   ├── Web Development
│   └── SEO
├── Blog
└── Contact
```

---

# 30. Users

Manajemen pengguna CMS.

### Fitur

- Create User
- Edit User
- Delete User
- Activate/Deactivate
- Profile
- Avatar
- Password
- Email
- Role
- Permission
- Last Login

---

# 31. Roles & Permissions

Gunakan konsep **RBAC — Role-Based Access Control**.

### Role default

- Administrator
- Editor
- Author
- Contributor

Contoh:

| Permission | Admin | Editor | Author |
|---|---:|---:|---:|
| Manage Users | ✓ | - | - |
| Manage Settings | ✓ | - | - |
| Create Post | ✓ | ✓ | ✓ |
| Edit All Posts | ✓ | ✓ | - |
| Edit Own Posts | ✓ | ✓ | ✓ |
| Publish Post | ✓ | ✓ | - |
| Delete Post | ✓ | ✓ | Own |
| Manage Pages | ✓ | ✓ | - |
| Manage SEO | ✓ | ✓ | Own |

---

# 32. Revisions

Histori perubahan Post, Page, dan Homepage.

### Fitur

- Autosave
- Revision History
- View Revision
- Compare
- Restore
- Version Number
- Author
- Timestamp

Database:

```text
revisions
----------------
id
content_type
content_id
version
content
title
subtitle
created_by
created_at
```

---

# 33. General Settings

Pengaturan umum website.

### Fitur

- Site Title
- Tagline
- Site URL
- Language
- Timezone
- Date Format
- Time Format
- Admin Email
- Homepage
- Blog Page
- Privacy Policy
- Search Engine Visibility
- Media Settings
- Discussion Settings

---

# 34. Homepage Assignment

Selain Homepage Builder, sistem menentukan halaman mana yang menjadi homepage.

Pilihan:

```text
Homepage:
○ Latest Posts
● Custom Homepage
```

Jika Custom Homepage dipilih:

```text
Homepage:
[ Homepage A ]
```

Blog dapat memiliki halaman terpisah:

```text
Posts Page:
[ Blog ]
```

---

# 35. Search

Search internal CMS dan website.

### Admin Search

- Search Posts
- Search Pages
- Search Media
- Search Users
- Search Categories
- Search Tags

### Website Search

- Search Posts
- Search Pages
- Search Categories
- Search Tags
- Filter
- Pagination

---

# 36. Comments

Jika website membutuhkan komentar.

### Fitur

- Enable/Disable Comments
- Approve
- Reject
- Delete
- Spam
- Reply
- Comment Notifications

---

# 37. 404 & Error Management

### Fitur

- Custom 404 Page
- Redirect URL
- Broken URL Detection jika tersedia
- Suggested Pages
- Search
- Back to Homepage

---

# 38. API Architecture

Backend Node.js dapat dibagi berdasarkan module:

```text
backend/
└── src/
    ├── modules/
    │   ├── auth/
    │   ├── users/
    │   ├── posts/
    │   ├── pages/
    │   ├── categories/
    │   ├── tags/
    │   ├── media/
    │   ├── homepage/
    │   ├── seo/
    │   ├── menus/
    │   ├── redirects/
    │   ├── revisions/
    │   └── settings/
    │
    ├── middleware/
    ├── database/
    ├── services/
    ├── routes/
    └── utils/
```

---

# 39. React Frontend Structure

```text
frontend/
└── src/
    ├── pages/
    │   ├── dashboard/
    │   ├── posts/
    │   ├── pages/
    │   ├── media/
    │   ├── categories/
    │   ├── tags/
    │   ├── users/
    │   ├── homepage/
    │   ├── seo/
    │   ├── menus/
    │   └── settings/
    │
    ├── components/
    │   ├── editor/
    │   ├── homepage-builder/
    │   ├── media-picker/
    │   ├── seo-panel/
    │   ├── slug-editor/
    │   ├── featured-image/
    │   └── layout/
    │
    ├── services/
    ├── hooks/
    ├── stores/
    ├── layouts/
    └── utils/
```

---

# 40. PostgreSQL Core Tables

Minimal database:

```text
users
roles
permissions
role_permissions

posts
pages

categories
tags
post_categories
post_tags

media

seo_metadata

homepages
homepage_sections

menus
menu_items

redirects

revisions

settings
```

---

# 41. Relasi Utama

```text
                    ┌──────────────┐
                    │    USERS     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │    POSTS     │
                    └───┬─────┬────┘
                        │     │
              ┌─────────▼─┐ ┌─▼─────────┐
              │ CATEGORIES│ │    TAGS   │
              └───────────┘ └───────────┘

                    ┌──────────────┐
                    │    PAGES     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ SEO METADATA  │
                    └───────────────┘

                    ┌──────────────┐
                    │    MEDIA     │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    ▼              ▼
                  POSTS          PAGES

                    ┌──────────────┐
                    │  HOMEPAGE    │
                    └──────┬───────┘
                           │
                    ┌──────▼────────┐
                    │   SECTIONS     │
                    └──────┬────────┘
                           │
                 ┌─────────┼─────────┐
                 ▼         ▼         ▼
               POSTS      PAGES     MEDIA
```

---

# 42. Arsitektur Homepage

Konsep utama:

```text
Homepage
   ↓
Sections
   ↓
Section Type
   ↓
Section Settings
   ↓
Data Source
   ↓
CMS Data
```

Contoh:

```text
Homepage
└── Latest Posts Section
    ├── Source: Posts
    ├── Category: Technology
    ├── Limit: 6
    ├── Sort: Latest
    └── Layout: 3 Column Grid
```

React kemudian merender:

```text
PostsSection
```

dan Node.js mengambil data Post dari PostgreSQL.

---

# 43. Prinsip Penting Homepage

Homepage **tidak menyimpan copy data Post**.

Homepage menyimpan:

```text
Apa yang ditampilkan?
Bagaimana tampilannya?
Dari mana datanya?
Berapa jumlahnya?
Bagaimana urutannya?
```

Sedangkan data sebenarnya tetap berada di:

```text
Posts
Pages
Categories
Tags
Media
```

Dengan demikian jika sebuah Post berubah, Homepage akan mengikuti data terbaru secara otomatis.

---

# 44. MVP Development Roadmap

## Phase 1 — Core CMS

- Authentication
- Users
- Roles
- Posts
- Pages
- Categories
- Tags
- Media
- Content Editor
- Draft
- Publish
- Preview
- Slug
- Search

## Phase 2 — Homepage

- Homepage Builder
- Section System
- Drag & Drop
- Section Templates
- Data Source
- Post Integration
- Page Integration
- Media Integration
- Responsive Preview
- Draft/Publish

## Phase 3 — SEO

- SEO Global
- SEO Post
- SEO Page
- Meta Description
- Canonical
- Robots
- Sitemap
- Open Graph
- Schema
- SEO Preview
- Redirect

## Phase 4 — Website Appearance

- Logo
- Favicon
- Site Title
- Tagline
- Header
- Footer
- Menu
- Homepage Assignment

## Phase 5 — Advanced

- Revision
- Autosave
- Scheduled Publishing
- Trash/Restore
- Bulk Actions
- Custom Fields
- Advanced Page Builder
- Audit Log
- Analytics
- Image Optimization
- Advanced RBAC

---

# 45. Final CMS Navigation

Struktur menu final yang disarankan:

```text
CMS
│
├── Dashboard
│
├── Content
│   ├── Posts
│   ├── Pages
│   ├── Categories
│   ├── Tags
│   └── Media
│
├── Appearance
│   ├── Homepage Builder
│   ├── Header
│   ├── Footer
│   └── Menus
│
├── SEO
│   ├── Global SEO
│   ├── Post SEO
│   ├── Page SEO
│   ├── Sitemap
│   ├── Schema
│   └── Redirects
│
├── Users
│   ├── Users
│   ├── Roles
│   └── Permissions
│
└── Settings
    ├── General
    ├── Branding
    ├── Permalinks
    ├── Homepage
    ├── Media
    ├── Discussion
    └── Advanced
```

---

# 46. Core Design Principle

CMS ini sebaiknya tidak sekadar menjadi "WordPress clone", tetapi menggunakan konsep:

```text
CONTENT
+
STRUCTURE
+
DESIGN
+
DATA SOURCE
+
SEO
+
PUBLISHING
```

Dengan demikian:

- **Post/Page** mengelola konten.
- **Media** mengelola aset.
- **Categories/Tags** mengelola taxonomy.
- **Homepage Builder** mengatur struktur dan tampilan homepage.
- **Sections** menentukan komponen yang tampil.
- **Data Source** menghubungkan section dengan Post/Page/Media.
- **SEO** mengatur metadata dan indexing.
- **Permalinks** mengatur URL.
- **Branding** mengatur logo, favicon, title, dan identitas website.
- **Header/Footer/Menu** mengatur navigasi dan area global.
- **Revision** menjaga histori perubahan.
- **Roles/Permissions** mengontrol akses.
- **Node.js** menjadi API/business logic.
- **React** menjadi admin UI dan frontend renderer.
- **PostgreSQL** menjadi sumber data utama.

## Target Akhir

Admin dapat masuk ke CMS lalu melakukan:

```text
1. Buat Post
2. Upload gambar
3. Atur Category/Tag
4. Atur SEO
5. Publish

        ↓

6. Buka Homepage Builder
7. Tambahkan "Latest Posts"
8. Pilih Category
9. Pilih jumlah Post
10. Pilih layout
11. Atur desain
12. Preview
13. Publish Homepage

        ↓

Frontend React

        ↓

Homepage otomatis mengambil
data terbaru dari CMS
```

Dengan model tersebut, website dapat diubah secara signifikan dari CMS **tanpa perlu mengubah kode React setiap kali admin ingin mengganti isi, urutan section, desain section, atau sumber data homepage**.
