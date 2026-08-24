import { z } from 'zod';

const uuid = z.string().uuid();

export const skemaMasuk = z.object({
  surel: z.string().email(),
  kata_sandi: z.string().min(6),
});

export const skemaSeo = z.object({
  judul_seo: z.string().max(150).optional(),
  deskripsi_seo: z.string().optional(),
  kata_kunci: z.string().max(255).optional(),
  url_kanonis: z.string().max(500).optional(),
  gambar_og: z.string().max(500).optional(),
});

export const skemaArtikelBuat = z.object({
  judul: z.string().min(1).max(255),
  slug: z.string().max(280).optional(),
  kutipan: z.string().optional(),
  konten: z.string().min(1),
  status: z.enum(['draf', 'terbit', 'arsip']).default('draf'),
  id_gambar_unggulan: uuid.nullish(),
  kategori_ids: z.array(uuid).default([]),
  seo: skemaSeo.optional(),
});

export const skemaArtikelPerbarui = skemaArtikelBuat.partial();

export const skemaKategori = z.object({
  nama: z.string().min(1).max(100),
  slug: z.string().max(120).optional(),
  deskripsi: z.string().optional(),
  warna: z.enum(['primary', 'secondary', 'tertiary', 'ai-purple']).default('primary'),
  ikon: z.string().max(100).default('folder'),
});

export const skemaKategoriPerbarui = skemaKategori.partial();

export const skemaHalaman = z.object({
  judul: z.string().min(1).max(255),
  slug: z.string().max(280).optional(),
  konten: z.string().min(1),
  status: z.enum(['draf', 'terbit']).default('draf'),
  seo: skemaSeo.optional(),
});

export const skemaHalamanPerbarui = skemaHalaman.partial();

const skemaCta = z.object({
  teks_tombol: z.string().min(1),
  url_tujuan: z.string().min(1),
  ikon: z.string().optional(),
});

// Validasi JSONB bagian_beranda.pengaturan per tipe section (wajib Zod, lihat agentrules.md §2)
export const skemaPengaturanPerTipe = {
  hero_section: z.object({
    judul_utama: z.string().min(1),
    deskripsi: z.string().min(1),
    cta: skemaCta,
    desain: z.object({ warna_tombol: z.string().optional() }).optional(),
  }),
  explore_topics: z.object({
    subjudul: z.string().optional(),
    judul_seksi: z.string().min(1),
  }),
  latest_articles: z.object({
    judul_seksi: z.string().min(1),
    jumlah_tampil: z.number().int().min(1).max(24).default(3),
    teks_tautan: z.string().optional(),
  }),
  trending_articles: z.object({
    subjudul: z.string().optional(),
    judul_seksi: z.string().min(1),
    jumlah_tampil: z.number().int().min(1).max(24).default(6),
    teks_tautan: z.string().optional(),
  }),
  cta_banner: z.object({
    judul: z.string().min(1),
    deskripsi: z.string().optional(),
    cta: skemaCta,
  }),
};

export const TIPE_BAGIAN = Object.keys(skemaPengaturanPerTipe);

export const skemaBagianBeranda = z
  .object({
    judul_bagian: z.string().min(1).max(150),
    tipe: z.enum(TIPE_BAGIAN),
    posisi: z.number().int().min(0).default(0),
    aktif: z.boolean().default(true),
    pengaturan: z.record(z.unknown()),
  })
  .superRefine((nilai, ctx) => {
    const hasil = skemaPengaturanPerTipe[nilai.tipe].safeParse(nilai.pengaturan);
    if (!hasil.success) {
      hasil.error.issues.forEach((i) =>
        ctx.addIssue({ code: 'custom', path: ['pengaturan', ...i.path], message: i.message })
      );
    }
  })
  .transform((nilai) => ({
    ...nilai,
    pengaturan: skemaPengaturanPerTipe[nilai.tipe].parse(nilai.pengaturan),
  }));

export const skemaBagianPerbarui = z
  .object({
    judul_bagian: z.string().min(1).max(150).optional(),
    tipe: z.enum(TIPE_BAGIAN).optional(),
    posisi: z.number().int().min(0).optional(),
    aktif: z.boolean().optional(),
    pengaturan: z.record(z.unknown()).optional(),
  })
  .refine((nilai) => !nilai.pengaturan || !!nilai.tipe, {
    message: 'tipe wajib disertakan saat mengubah pengaturan',
    path: ['tipe'],
  })
  .superRefine((nilai, ctx) => {
    if (nilai.pengaturan && nilai.tipe) {
      const hasil = skemaPengaturanPerTipe[nilai.tipe].safeParse(nilai.pengaturan);
      if (!hasil.success) {
        hasil.error.issues.forEach((i) =>
          ctx.addIssue({ code: 'custom', path: ['pengaturan', ...i.path], message: i.message })
        );
      }
    }
  })
  .transform((nilai) => ({
    ...nilai,
    ...(nilai.pengaturan && nilai.tipe
      ? { pengaturan: skemaPengaturanPerTipe[nilai.tipe].parse(nilai.pengaturan) }
      : {}),
  }));

export const skemaSusunUlangBagian = z.object({
  urutan: z.array(z.object({ id: uuid, posisi: z.number().int().min(0) })).min(1),
});

export const skemaMenu = z.object({
  nama: z.string().min(1).max(100),
  lokasi: z.string().min(1).max(50),
});

export const skemaItemMenu = z.object({
  id_induk: uuid.nullish(),
  label: z.string().min(1).max(100),
  url: z.string().min(1).max(500),
  posisi: z.number().int().min(0).default(0),
  ikon: z.string().max(100).optional(),
});

export const skemaPengaturanMassal = z.object({
  pengaturan: z
    .array(z.object({ kunci: z.string().min(1), nilai: z.string() }))
    .min(1),
});
