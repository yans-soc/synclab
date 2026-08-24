# PRD — CMS WordPress-like dengan React, Node.js, dan PostgreSQL

**Status:** Draft / Ready for Development Planning  
**Versi:** 1.0  
**Tanggal:** 24 Agustus 2026

---

# 1. Ringkasan Produk

Produk ini adalah **Content Management System (CMS) full-stack bergaya WordPress** yang dibangun menggunakan:

- **Frontend:** React
- **Backend:** Node.js
- **Database:** PostgreSQL
- **API:** REST API atau arsitektur API modular
- **Media Storage:** Object Storage / filesystem
- **Database Flexible Configuration:** PostgreSQL JSONB

CMS memungkinkan administrator mengelola konten, halaman, media, SEO, branding, navigation, user permissions, serta membangun homepage secara visual menggunakan **Homepage Builder**.

Fokus utama produk adalah memberikan kemampuan kepada admin untuk mengelola website tanpa harus mengubah kode frontend setiap kali ingin mengubah konten, struktur homepage, section, layout, atau konfigurasi SEO.

---

# 2. Product Vision

Membangun CMS yang:

1. Mudah digunakan oleh non-developer.
2. Fleksibel untuk berbagai jenis website.
3. Memiliki content management seperti WordPress.
4. Memiliki Homepage Builder yang dapat dikustomisasi.
5. Memiliki SEO management global dan per halaman.
6. Memiliki struktur data yang scalable.
7. Memisahkan content, presentation, dan data source.
8. Memungkinkan React frontend merender website secara dinamis berdasarkan konfigurasi CMS.

---

# 3. Problem Statement

Website tradisional sering membutuhkan developer untuk melakukan perubahan seperti:

- Mengubah homepage.
- Mengganti urutan section.
- Mengubah artikel yang tampil di homepage.
- Mengganti logo.
- Mengubah favicon.
- Mengubah SEO title.
- Mengubah meta description.
- Mengubah menu.
- Menambahkan section baru.

CMS ini harus memungkinkan perubahan tersebut dilakukan langsung dari admin panel.

---

# 4. Goals

## 4.1 Primary Goals

- Admin dapat membuat dan mengelola Post.
- Admin dapat membuat dan mengelola Page.
- Admin dapat mengelola Media.
- Admin dapat mengelola Category dan Tag.
- Admin dapat mengatur SEO global.
- Admin dapat mengatur SEO setiap Post/Page.
- Admin dapat mengatur permalink dan redirect.
- Admin dapat mengatur Logo dan Favicon.
- Admin dapat mengatur Header, Footer, dan Menu.
- Admin dapat membangun Homepage secara visual.
- Homepage dapat mengambil data secara dinamis dari CMS.
- Admin dapat melakukan Draft, Preview, dan Publish.
- Sistem memiliki Revision.
- Sistem memiliki User, Role, dan Permission.

## 4.2 Secondary Goals

- Responsive admin interface.
- Reusable section templates.
- Data source yang fleksibel.
- API modular.
- Struktur database scalable.
- Support untuk integrasi analytics dan search engine tools.

---

# 5. Non-Goals

Untuk versi awal, sistem tidak wajib menyediakan:

- Full visual website builder untuk seluruh halaman.
- Marketplace plugin seperti WordPress.
- Theme marketplace.
- Page builder tanpa batas seperti Elementor.
- Built-in email marketing platform.
- Built-in analytics engine yang kompleks.
- E-commerce penuh.
- Membership system.
- Multisite management.

Fitur tersebut dapat dipertimbangkan sebagai fase lanjutan.

---

# 6. Target Users

## 6.1 Administrator

Memiliki akses penuh terhadap CMS.

Kebutuhan:

- Mengelola semua konten.
- Mengelola user.
- Mengatur website.
- Mengatur SEO.
- Mengatur homepage.
- Mengatur branding.

## 6.2 Editor

Kebutuhan:

- Membuat/edit Post.
- Membuat/edit Page.
- Mengelola media.
- Publish konten.
- Mengatur SEO konten sesuai permission.

## 6.3 Author

Kebutuhan:

- Membuat Post.
- Mengedit Post miliknya.
- Upload media.
- Menyimpan draft.
- Tidak memiliki akses ke system settings.

## 6.4 Contributor

Kebutuhan:

- Membuat draft.
- Mengedit draft miliknya.
- Tidak dapat publish tanpa approval.

---

# 7. Product Architecture

```text
┌─────────────────────────────┐
│        React Frontend       │
│                             │
│ Admin Panel + Public Web    │
└──────────────┬──────────────┘
               │
               │ HTTP / REST API
               ▼
┌─────────────────────────────┐
│         Node.js API         │
│                             │
│ Auth                        │
│ Content                     │
│ Homepage                    │
│ SEO                         │
│ Media                       │
│ Settings                    │
│ Users / RBAC                │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        PostgreSQL           │
│                             │
│ Posts / Pages               │
│ Media Metadata              │
│ SEO                         │
│ Homepage Sections           │
│ Users / Roles               │
│ Settings                    │
└─────────────────────────────┘

             +

┌─────────────────────────────┐
│ Object Storage / Filesystem │
│                             │
│ Images / Videos / Documents │
└─────────────────────────────┘
```

---

# 8. Core Product Modules

```text
Dashboard
Content
├── Posts
├── Pages
├── Categories
├── Tags
└── Media

Appearance
├── Homepage Builder
├── Header
├── Footer
└── Menus

SEO
├── Global SEO
├── Post SEO
├── Page SEO
├── Sitemap
├── Schema
└── Redirects

Users
├── Users
├── Roles
└── Permissions

Settings
├── General
├── Branding
├── Permalinks
├── Homepage
├── Media
├── Discussion
└── Advanced
```

---

# 9. Functional Requirements

# 9.1 Authentication

## Requirements

- Login.
- Logout.
- Password hashing.
- Session/token management.
- Authentication middleware.
- Password reset.
- Account activation/deactivation.

## Acceptance Criteria

- User yang valid dapat login.
- User yang tidak valid ditolak.
- Password tidak pernah disimpan dalam plaintext.
- API membutuhkan authentication untuk endpoint admin.
- Permission diperiksa sebelum resource dimodifikasi.

---

# 9.2 Users

Admin dapat:

- Create User.
- Edit User.
- Delete User.
- Activate/deactivate User.
- Mengubah role.
- Mengubah profile.
- Mengubah password.
- Melihat last login.

## Acceptance Criteria

- Admin dapat membuat user.
- Email/user identity harus unik.
- User non-admin tidak dapat mengelola user tanpa permission.
- User yang dinonaktifkan tidak dapat login.

---

# 9.3 Roles & Permissions

Gunakan RBAC.

## Default Roles

- Administrator
- Editor
- Author
- Contributor

## Permission Examples

```text
users.read
users.create
users.update
users.delete

posts.read
posts.create
posts.update
posts.delete
posts.publish

pages.read
pages.create
pages.update
pages.delete
pages.publish

media.read
media.create
media.update
media.delete

seo.read
seo.update

homepage.read
homepage.update
homepage.publish

settings.read
settings.update
```

## Acceptance Criteria

Setiap endpoint sensitif harus melakukan permission check.

---

# 10. Post Management

## User Story

> Sebagai editor, saya ingin membuat dan mengelola artikel agar konten website dapat dipublikasikan tanpa bantuan developer.

## Requirements

Post harus mendukung:

- Title.
- Subtitle.
- Slug.
- Content.
- Excerpt.
- Featured image.
- Author.
- Category.
- Tags.
- Status.
- Publish date.
- Visibility.
- SEO.
- Revision.

## Status

```text
draft
scheduled
published
trash
```

## Actions

- Create.
- Save draft.
- Update.
- Preview.
- Publish.
- Schedule.
- Trash.
- Restore.
- Duplicate.

## Acceptance Criteria

1. Post dapat dibuat.
2. Slug dibuat otomatis dari title.
3. Slug dapat diedit manual.
4. Slug harus unik sesuai URL strategy.
5. Draft tidak muncul di public website.
6. Scheduled post tidak muncul sebelum waktu publish.
7. Published post dapat diakses public.
8. Perubahan penting tersimpan dalam revision.

---

# 11. Page Management

## User Story

> Sebagai admin, saya ingin membuat halaman statis dan mengatur struktur parent-child agar website dapat memiliki struktur informasi yang jelas.

## Requirements

Page mendukung:

- Title.
- Subtitle.
- Slug.
- Content.
- Featured Image.
- Parent Page.
- Template.
- Status.
- Publish date.
- SEO.
- Revision.

## Acceptance Criteria

- Page dapat dibuat.
- Page dapat menjadi child dari Page lain.
- Slug dapat dikustomisasi.
- Page dapat menggunakan template.
- Page dapat memiliki SEO metadata sendiri.
- Page dapat dipreview sebelum publish.

---

# 12. Content Editor

Editor harus mendukung block-based content.

## Minimum Blocks

- Paragraph.
- Heading.
- Image.
- Gallery.
- Video.
- Quote.
- List.
- Link.
- Button.
- Divider.
- Table.
- Code.
- Embed.
- Columns.
- Spacer.

## Requirements

- Drag/reorder block.
- Edit block.
- Delete block.
- Duplicate block.
- Undo/redo.
- Autosave.
- Preview.
- Responsive content handling.

Content dapat disimpan sebagai JSON/JSONB.

---

# 13. Categories

## Requirements

- Create.
- Update.
- Delete.
- Search.
- Description.
- Slug.
- Parent category.
- Nested category.

## Acceptance Criteria

- Slug unik.
- Category dapat memiliki parent.
- Post dapat memiliki category.
- Category archive dapat menampilkan Post terkait.

---

# 14. Tags

## Requirements

- Create.
- Update.
- Delete.
- Search.
- Slug.
- Description.

## Acceptance Criteria

- Tag slug unik.
- Post dapat memiliki banyak tag.
- Tag dapat digunakan sebagai filter Post.

---

# 15. Media Library

## User Story

> Sebagai admin, saya ingin mengelola semua aset media dari satu tempat agar gambar dan file dapat digunakan kembali di banyak halaman.

## Requirements

- Upload.
- Delete.
- Replace.
- Search.
- Filter.
- Preview.
- Select.
- Alt text.
- Caption.
- Description.
- Metadata file.
- Media picker.

## Storage

File fisik disimpan di object storage/filesystem.

PostgreSQL menyimpan:

```text
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

## Acceptance Criteria

- File berhasil diupload.
- Metadata tersimpan.
- Media dapat dipilih dari editor.
- Media dapat digunakan ulang.
- File yang tidak valid ditolak berdasarkan policy.

---

# 16. Homepage Builder

Ini adalah fitur utama produk.

## User Story

> Sebagai admin, saya ingin membuat dan mengubah homepage secara visual tanpa mengubah source code React.

## Requirements

Homepage Builder harus mendukung:

- Add Section.
- Edit Section.
- Delete Section.
- Duplicate Section.
- Drag & Drop.
- Reorder.
- Enable/Disable.
- Preview.
- Draft.
- Publish.
- Revision.
- Desktop preview.
- Tablet preview.
- Mobile preview.

---

# 17. Homepage Sections

Minimum section types:

```text
hero
rich_text
image_text
features
services
posts
featured_post
latest_posts
category_posts
popular_posts
related_posts
testimonials
team
gallery
video
faq
pricing
stats
logo_cloud
cta
newsletter
contact
spacer
custom_html
```

## Section Contract

Setiap section minimal memiliki:

```text
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

---

# 18. Homepage Section Settings

Setiap section memiliki:

```text
Content
Design
Layout
Advanced
```

## Content

Bergantung pada section:

```text
title
subtitle
description
image
button
button_url
items
```

## Design

```text
background
text_color
overlay
border_radius
image_position
```

## Layout

```text
container_width
columns
alignment
spacing
padding
```

## Advanced

```text
custom_class
html_id
desktop_visibility
tablet_visibility
mobile_visibility
```

---

# 19. Homepage Data Source

Setiap section yang membutuhkan data dinamis harus mendukung Data Source.

## Source Types

```text
static
posts
pages
categories
media
custom
```

## Post Source

Mendukung:

- Manual selection.
- Latest.
- Category.
- Tag.
- Author.
- Limit.
- Sort.

## Acceptance Criteria

Jika section menggunakan `latest posts`, Post baru yang dipublish otomatis dapat muncul tanpa perlu mengedit Homepage.

---

# 20. Homepage Post Layout

Minimum layout:

- Grid.
- List.
- Masonry.
- Featured + Grid.
- Carousel.
- Horizontal Scroll.

Admin dapat menentukan:

```text
limit
sort
columns
category
tag
author
```

---

# 21. Homepage Templates

Sediakan template untuk mempercepat pembuatan.

## Hero

- Hero Split.
- Hero Center.
- Hero Fullscreen.
- Hero Image Background.

## Posts

- 3 Card Grid.
- 4 Card Grid.
- Featured + 3 Cards.
- Horizontal List.
- Carousel.

Template dapat diedit setelah digunakan.

---

# 22. Homepage Draft / Preview / Publish

Homepage memiliki state:

```text
draft
published
```

Flow:

```text
Edit
 ↓
Save Draft
 ↓
Preview
 ↓
Publish
```

## Acceptance Criteria

- Draft tidak mengubah homepage live.
- Preview menampilkan draft.
- Publish mengganti konfigurasi live.
- Admin dapat membatalkan perubahan dengan restore revision.

---

# 23. Homepage Revision

Setiap publish/update penting membuat revision.

Requirements:

- View.
- Compare.
- Restore.
- Publish revision.

---

# 24. SEO Global

## Requirements

- Global SEO title.
- Global meta description.
- Default OG image.
- Robots.
- Sitemap.
- Canonical defaults.
- Organization schema.
- Website schema.
- Social profiles.
- Search engine verification.
- Analytics integration.

## Acceptance Criteria

Default SEO dapat diwariskan oleh Post/Page jika metadata individual tidak diisi.

---

# 25. SEO Per Post/Page

## Fields

```text
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
```

## Acceptance Criteria

- Admin dapat mengubah SEO metadata setiap Post.
- Admin dapat mengubah SEO metadata setiap Page.
- SEO title dapat berbeda dari content title.
- Canonical dapat dikustomisasi.
- Noindex dapat diterapkan pada konten tertentu.
- Social sharing metadata dapat dikustomisasi.

---

# 26. SEO Preview

Admin dapat melihat preview:

```text
Search Result
------------------------
SEO Title
URL
Meta Description
```

Dan social preview:

```text
Open Graph
------------------------
Image
Title
Description
```

---

# 27. Sitemap

Sistem menghasilkan XML sitemap untuk konten yang eligible.

Minimum:

```text
posts
pages
categories
tags
```

Konfigurasi harus dapat mengecualikan konten yang `noindex`.

---

# 28. Robots

Sistem menyediakan robots configuration.

Contoh konsep:

```text
User-agent
Allow
Disallow
Sitemap
```

Konfigurasi tidak boleh menyebabkan seluruh website terblokir secara tidak sengaja tanpa warning.

---

# 29. Schema

Sistem harus mendukung schema type yang relevan.

Minimum:

- Organization.
- WebSite.
- Article.
- WebPage.
- BreadcrumbList.
- Service.
- FAQPage jika section FAQ digunakan.

Schema dapat berasal dari konfigurasi global maupun per content.

---

# 30. Permalink

## Requirements

- Post structure.
- Page structure.
- Category base.
- Tag base.
- Slug editor.
- URL validation.
- Redirect on slug change.

Contoh:

```text
Post:
 /blog/:slug/

Page:
 /:slug/

Category:
 /category/:slug/

Tag:
 /tag/:slug/
```

Struktur harus dapat dikonfigurasi.

---

# 31. Redirect

## Requirements

- Create redirect.
- Update redirect.
- Delete redirect.
- Enable/disable.
- 301.
- 302.
- Automatic redirect saat slug berubah.

## Acceptance Criteria

Request ke URL lama dapat diarahkan ke URL baru sesuai redirect yang aktif.

---

# 32. Branding

## Requirements

- Site Title.
- Tagline.
- Logo.
- Mobile Logo.
- Favicon.
- Default OG Image.

Branding harus tersedia sebagai global setting sehingga dapat digunakan oleh Header, Footer, SEO, dan frontend.

---

# 33. Header

Minimum:

- Logo.
- Navigation.
- Menu.
- CTA.
- Search.
- Social links.
- Sticky behavior.
- Desktop configuration.
- Mobile configuration.

---

# 34. Footer

Minimum:

- Logo.
- Description.
- Navigation.
- Columns.
- Social links.
- Contact.
- Newsletter.
- Copyright.
- Custom content.

---

# 35. Menu Management

## Requirements

- Create menu.
- Rename menu.
- Delete menu.
- Drag/drop.
- Nested menu.
- Page item.
- Post item.
- Category item.
- Custom URL.
- External URL.
- Header menu.
- Footer menu.

---

# 36. Revisions

Revision harus tersedia minimal untuk:

- Posts.
- Pages.
- Homepage.

## Requirements

- Autosave.
- Version.
- Author.
- Timestamp.
- Compare.
- Restore.

---

# 37. General Settings

## Requirements

- Site title.
- Tagline.
- Site URL.
- Language.
- Timezone.
- Date format.
- Time format.
- Admin email.
- Homepage assignment.
- Blog page.
- Privacy policy.
- Search engine visibility.
- Media settings.
- Discussion settings.

---

# 38. Homepage Assignment

Admin dapat memilih:

```text
Homepage
○ Latest Posts
● Custom Homepage
```

Jika Custom Homepage:

```text
Homepage:
[Homepage A]
```

Blog page dapat ditentukan secara terpisah:

```text
Posts Page:
[Blog]
```

---

# 39. Search

## Admin Search

Search:

- Posts.
- Pages.
- Media.
- Users.
- Categories.
- Tags.

## Public Search

Search:

- Posts.
- Pages.
- Categories.
- Tags.

Fitur:

- Keyword search.
- Pagination.
- Filter.
- Sorting.

---

# 40. Comments

Jika comments diaktifkan:

- Enable/disable.
- Approve.
- Reject.
- Delete.
- Spam.
- Reply.
- Notifications.

---

# 41. 404

## Requirements

- Custom 404 page.
- Search.
- Back to homepage.
- Suggested pages.
- Optional redirect management.

---

# 42. Database Requirements

## Core Tables

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

# 43. Database Relationship

```text
USERS
  │
  ├── POSTS
  │
  └── REVISIONS

POSTS
  ├── CATEGORIES
  ├── TAGS
  ├── MEDIA
  └── SEO

PAGES
  ├── MEDIA
  ├── SEO
  ├── PARENT PAGE
  └── REVISIONS

HOMEPAGE
  └── HOMEPAGE SECTIONS
        ├── POSTS
        ├── PAGES
        ├── MEDIA
        └── CUSTOM DATA
```

---

# 44. API Requirements

API harus modular.

Contoh:

```text
/api/auth
/api/users
/api/roles
/api/posts
/api/pages
/api/categories
/api/tags
/api/media
/api/homepage
/api/seo
/api/menus
/api/redirects
/api/revisions
/api/settings
```

## Contoh Post API

```text
GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id
POST   /api/posts/:id/publish
POST   /api/posts/:id/duplicate
POST   /api/posts/:id/restore
```

## Contoh Homepage API

```text
GET    /api/homepage
GET    /api/homepage/draft
PUT    /api/homepage
POST   /api/homepage/preview
POST   /api/homepage/publish
GET    /api/homepage/revisions
POST   /api/homepage/revisions/:id/restore
```

---

# 45. Public Frontend Rendering

Public React frontend harus dapat menerima konfigurasi homepage.

Flow:

```text
Browser
  ↓
React
  ↓
GET /api/homepage
  ↓
Node.js
  ↓
PostgreSQL
  ↓
Homepage Config
  ↓
Data Source Resolution
  ↓
React Section Renderer
```

Contoh:

```text
homepage_sections
      ↓
type = latest_posts
      ↓
resolve posts
      ↓
PostsSection
      ↓
render cards
```

---

# 46. Section Renderer

React menggunakan registry:

```text
HeroSection
PostsSection
ServicesSection
GallerySection
TestimonialsSection
CTASection
FAQSection
...
```

Pseudo architecture:

```text
SectionRenderer
    ↓
section.type
    ↓
Component Registry
    ↓
React Component
    ↓
section.settings
```

Dengan pendekatan ini, section baru dapat ditambahkan tanpa mengubah struktur homepage lama.

---

# 47. Frontend Admin Structure

```text
src/
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

# 48. Backend Structure

```text
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── roles/
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

# 49. Non-Functional Requirements

## Performance

- API response cepat untuk request umum.
- Pagination wajib untuk list besar.
- Query database menggunakan index yang sesuai.
- Media tidak disimpan sebagai binary utama di PostgreSQL.
- Homepage harus meminimalkan query yang tidak perlu.
- Data source section dapat menggunakan caching jika dibutuhkan.

## Security

- Password hashing.
- Authentication.
- Authorization.
- RBAC.
- Input validation.
- SQL injection protection.
- XSS protection.
- CSRF protection sesuai arsitektur auth.
- Rate limiting untuk endpoint sensitif.
- Secure file upload.
- MIME/type validation.
- File size limit.
- Audit logging untuk aksi penting.

## Scalability

Sistem harus dapat berkembang untuk:

- Banyak Post.
- Banyak Page.
- Banyak Media.
- Banyak User.
- Banyak Homepage Sections.
- Banyak website traffic.

---

# 50. SEO Technical Requirements

Frontend public harus dapat menghasilkan:

```text
<title>
<meta name="description">
<link rel="canonical">
<meta name="robots">
Open Graph
Twitter/X Card
JSON-LD Schema
```

Sitemap harus dapat diakses public.

URL public harus stabil dan dapat di-redirect ketika slug berubah.

---

# 51. Responsive Requirements

Admin panel:

- Desktop.
- Tablet.
- Mobile.

Homepage Builder:

- Desktop preview.
- Tablet preview.
- Mobile preview.

Public website:

- Responsive.
- Touch friendly.
- Accessible.

---

# 52. Accessibility

Minimum:

- Semantic HTML.
- Keyboard navigation.
- Label untuk form.
- Alt text untuk image.
- Contrast yang memadai.
- Focus state.
- Accessible buttons.
- ARIA hanya jika diperlukan.

---

# 53. Audit & Logging

Disarankan menyediakan audit log untuk:

- Login.
- Logout.
- User creation.
- User deletion.
- Post publish.
- Page publish.
- Homepage publish.
- Settings changes.
- SEO changes.
- Redirect changes.

Contoh:

```text
audit_logs
----------------
id
user_id
action
entity_type
entity_id
metadata
ip_address
created_at
```

---

# 54. MVP Scope

## Phase 1 — Core CMS

### Must Have

- Authentication.
- Users.
- Roles.
- Permissions.
- Posts.
- Pages.
- Categories.
- Tags.
- Media.
- Content Editor.
- Draft.
- Publish.
- Preview.
- Slug.
- Search.

---

# 55. Phase 2 — Homepage Builder

### Must Have

- Homepage Builder.
- Add Section.
- Delete Section.
- Edit Section.
- Duplicate Section.
- Drag & Drop.
- Reorder.
- Enable/Disable.
- Section Settings.
- Data Source.
- Posts Integration.
- Pages Integration.
- Media Integration.
- Responsive Preview.
- Draft.
- Preview.
- Publish.
- Revision.

---

# 56. Phase 3 — SEO

### Must Have

- Global SEO.
- SEO per Post.
- SEO per Page.
- SEO Title.
- Meta Description.
- Canonical.
- Robots.
- Sitemap.
- Open Graph.
- Schema.
- SEO Preview.
- Redirect.

---

# 57. Phase 4 — Appearance

### Must Have

- Site Title.
- Tagline.
- Logo.
- Favicon.
- Header.
- Footer.
- Menus.
- Homepage Assignment.
- Permalink.

---

# 58. Phase 5 — Advanced

### Nice to Have

- Advanced Revision.
- Autosave.
- Scheduled Publishing.
- Trash/Restore.
- Bulk Actions.
- Custom Fields.
- Advanced Page Builder.
- Audit Log.
- Analytics.
- Image Optimization.
- Advanced RBAC.
- Custom Section Builder.

---

# 59. Acceptance Criteria Global

Produk dianggap memenuhi MVP apabila:

1. Admin dapat login.
2. Admin dapat membuat Post.
3. Admin dapat membuat Page.
4. Admin dapat mengupload Media.
5. Admin dapat mengatur Category dan Tag.
6. Admin dapat publish dan preview konten.
7. Admin dapat mengatur slug.
8. Admin dapat mengatur SEO per konten.
9. Admin dapat mengatur SEO global.
10. Admin dapat mengatur Logo dan Favicon.
11. Admin dapat mengatur permalink.
12. Admin dapat membuat Menu.
13. Admin dapat membangun Homepage menggunakan Section.
14. Homepage Section dapat mengambil data Post/Page/Media.
15. Section dapat diurutkan dengan drag & drop.
16. Homepage dapat disimpan sebagai Draft.
17. Homepage dapat dipreview.
18. Homepage dapat dipublish.
19. Homepage memiliki revision.
20. Role dan permission berjalan.
21. Public frontend merender data CMS secara dinamis.
22. Perubahan Post dapat tercermin otomatis pada section Homepage yang menggunakan data source dinamis.
23. SEO metadata muncul dengan benar pada public frontend.
24. Sitemap dapat diakses.
25. Redirect aktif bekerja sesuai konfigurasi.

---

# 60. Contoh End-to-End User Flow

## Membuat Artikel

```text
Login
 ↓
Posts
 ↓
Add Post
 ↓
Title
 ↓
Subtitle
 ↓
Content Editor
 ↓
Featured Image
 ↓
Category
 ↓
Tags
 ↓
SEO
 ↓
Save Draft
 ↓
Preview
 ↓
Publish
```

## Menampilkan Artikel di Homepage

```text
Homepage Builder
 ↓
Add Section
 ↓
Latest Posts
 ↓
Select Category
 ↓
Limit = 6
 ↓
Layout = Grid
 ↓
Save
 ↓
Preview
 ↓
Publish
```

Setelah itu:

```text
Post baru dipublish
       ↓
Homepage Data Source
       ↓
Latest Posts query
       ↓
Post baru muncul otomatis
```

---

# 61. Prinsip Data & Presentation

CMS harus memisahkan:

```text
CONTENT
```

dari:

```text
PRESENTATION
```

dan:

```text
DATA SOURCE
```

Contoh:

```text
POST
├── title
├── content
├── image
└── metadata

HOMEPAGE SECTION
├── layout
├── design
├── title
└── data source

DATA SOURCE
├── posts
├── category
├── tag
└── limit
```

Dengan model ini, content dapat digunakan kembali di banyak tempat.

---

# 62. Final Product Model

Produk akhir memiliki tiga lapisan utama:

```text
┌────────────────────────────────────┐
│             CONTENT                │
│                                    │
│ Posts / Pages / Media / Taxonomy   │
└─────────────────┬──────────────────┘
                  │
                  ▼
┌────────────────────────────────────┐
│             CMS CONFIG             │
│                                    │
│ Homepage / Sections / Menus / SEO  │
│ Branding / Settings / Permalinks  │
└─────────────────┬──────────────────┘
                  │
                  ▼
┌────────────────────────────────────┐
│            REACT FRONTEND          │
│                                    │
│ Renderer / Layout / Components     │
└────────────────────────────────────┘
```

---

# 63. Product Success Criteria

Produk dianggap berhasil apabila pengguna non-developer dapat:

- Membuat website content.
- Mengubah homepage.
- Menambah section.
- Menghapus section.
- Mengubah urutan section.
- Mengubah desain section yang tersedia.
- Menghubungkan section dengan Post.
- Menghubungkan section dengan Category.
- Mengubah logo.
- Mengubah favicon.
- Mengubah navigation.
- Mengubah SEO.
- Mengubah permalink.
- Preview perubahan.
- Publish perubahan.

Semua proses tersebut harus dapat dilakukan dari CMS tanpa mengubah source code React.

---

# 64. Recommended Development Priority

Urutan implementasi yang disarankan:

```text
1. Database & migration
2. Authentication
3. RBAC
4. Posts
5. Pages
6. Media
7. Categories & Tags
8. Content Editor
9. Public Content API
10. Homepage Builder Core
11. Section Renderer
12. Data Source System
13. Homepage Draft/Preview/Publish
14. Revision
15. SEO
16. Permalink
17. Redirect
18. Branding
19. Header/Footer
20. Menu
21. General Settings
22. Search
23. Comments
24. Audit Log
25. Advanced Features
```

---

# 65. Final Technical Direction

Arsitektur inti yang direkomendasikan:

```text
React
  │
  ├── Admin CMS
  └── Public Frontend
          │
          ▼
      Node.js API
          │
          ├── Auth
          ├── RBAC
          ├── Content
          ├── Homepage
          ├── SEO
          ├── Media
          ├── Appearance
          └── Settings
          │
          ▼
      PostgreSQL
          │
          ├── Content
          ├── Configuration
          ├── Relations
          └── JSONB Section Settings
```

Core principle:

> **Admin mengelola content dan configuration. React merender configuration tersebut menjadi website. Node.js menjadi business logic/API layer. PostgreSQL menjadi source of truth untuk data CMS.**

Dengan desain ini, CMS dapat berkembang dari CMS artikel sederhana menjadi **full website CMS dengan customizable homepage builder**, tanpa membuat frontend React menjadi hard-coded untuk setiap website atau perubahan desain.
