import { z } from 'zod';

const uuid = z.string().uuid();

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const seoSchema = z.object({
  seo_title: z.string().max(150).optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().max(255).optional(),
  canonical_url: z.string().max(500).optional(),
  og_image: z.string().max(500).optional(),
});

export const articleCreateSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().max(280).optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featured_image_id: uuid.nullish(),
  category_ids: z.array(uuid).default([]),
  seo: seoSchema.optional(),
});

export const articleUpdateSchema = articleCreateSchema.partial();

export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().max(120).optional(),
  description: z.string().optional(),
  color: z.enum(['primary', 'secondary', 'tertiary', 'ai-purple']).default('primary'),
  icon: z.string().max(100).default('folder'),
});

export const categoryUpdateSchema = categorySchema.partial();

export const pageSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().max(280).optional(),
  content: z.string().min(1),
  status: z.enum(['draft', 'published']).default('draft'),
  seo: seoSchema.optional(),
});

export const pageUpdateSchema = pageSchema.partial();

const ctaSchema = z.object({
  button_text: z.string().min(1),
  target_url: z.string().min(1),
  icon: z.string().optional(),
});

// Validasi JSONB homepage_sections.settings per type section (wajib Zod, lihat agentrules.md §2)
export const settingsSchemaByType = {
  hero_section: z.object({
    main_title: z.string().min(1),
    description: z.string().min(1),
    cta: ctaSchema,
    design: z.object({ button_color: z.string().optional() }).optional(),
  }),
  explore_topics: z.object({
    subtitle: z.string().optional(),
    section_title: z.string().min(1),
  }),
  latest_articles: z.object({
    section_title: z.string().min(1),
    display_count: z.number().int().min(1).max(24).default(3),
    link_text: z.string().optional(),
  }),
  trending_articles: z.object({
    subtitle: z.string().optional(),
    section_title: z.string().min(1),
    display_count: z.number().int().min(1).max(24).default(6),
    link_text: z.string().optional(),
  }),
  cta_banner: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    cta: ctaSchema,
  }),
};

export const SECTION_TYPES = Object.keys(settingsSchemaByType);

export const sectionSchema = z
  .object({
    section_title: z.string().min(1).max(150),
    type: z.enum(SECTION_TYPES),
    position: z.number().int().min(0).default(0),
    active: z.boolean().default(true),
    settings: z.record(z.unknown()),
  })
  .superRefine((value, ctx) => {
    const result = settingsSchemaByType[value.type].safeParse(value.settings);
    if (!result.success) {
      result.error.issues.forEach((i) =>
        ctx.addIssue({ code: 'custom', path: ['settings', ...i.path], message: i.message })
      );
    }
  })
  .transform((value) => ({
    ...value,
    settings: settingsSchemaByType[value.type].parse(value.settings),
  }));

export const sectionUpdateSchema = z
  .object({
    section_title: z.string().min(1).max(150).optional(),
    type: z.enum(SECTION_TYPES).optional(),
    position: z.number().int().min(0).optional(),
    active: z.boolean().optional(),
    settings: z.record(z.unknown()).optional(),
  })
  .refine((value) => !value.settings || !!value.type, {
    message: 'type is required when updating settings',
    path: ['type'],
  })
  .superRefine((value, ctx) => {
    if (value.settings && value.type) {
      const result = settingsSchemaByType[value.type].safeParse(value.settings);
      if (!result.success) {
        result.error.issues.forEach((i) =>
          ctx.addIssue({ code: 'custom', path: ['settings', ...i.path], message: i.message })
        );
      }
    }
  })
  .transform((value) => ({
    ...value,
    ...(value.settings && value.type
      ? { settings: settingsSchemaByType[value.type].parse(value.settings) }
      : {}),
  }));

export const reorderSchema = z.object({
  order: z.array(z.object({ id: uuid, position: z.number().int().min(0) })).min(1),
});

export const menuSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.string().min(1).max(50),
});

export const menuItemSchema = z.object({
  parent_id: uuid.nullish(),
  label: z.string().min(1).max(100),
  url: z.string().min(1).max(500),
  position: z.number().int().min(0).default(0),
  icon: z.string().max(100).optional(),
});

export const bulkSettingsSchema = z.object({
  settings: z
    .array(z.object({ key: z.string().min(1), value: z.string() }))
    .min(1),
});
