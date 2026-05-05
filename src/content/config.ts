import { defineCollection, z } from "astro:content";

const galleryCollection = defineCollection({
   type: "content", // або 'data', якщо не потрібен body в markdown
   schema: ({ image }) =>
      z.object({
         title: z.string(),
         shortDesc: z.string().optional(),
         fullCaption: z.string().optional(),
         thumb: image(),
         full: image().optional(),
         width: z.number().optional(),
         height: z.number().optional(),
         order: z.number().optional(),
      }),
});

const productsCollection = defineCollection({
   type: "content",
   schema: ({ image }) =>
      z.object({
         // --- Обов'язкові ---
         title: z.string(),
         enabled: z.boolean().default(true),
         variant: z.enum(["shop", "landing"]).default("shop"),

         // --- Зображення (через image() як в gallery) ---
         images: z
            .array(
               z.object({
                  src: image(),
                  alt: z.string().optional(),
               }),
            )
            .optional(),

         // --- Ціна ---
         price: z.number().optional(),
         priceOld: z.number().optional(), // є → знижка автоматично
         currency: z.string().default("USD"),

         // --- Бейджі ---
         inStock: z.boolean().optional(),
         isNew: z.boolean().optional(),
         badgeCustom: z.string().optional(),

         // --- Рейтинг ---
         rating: z.number().min(0).max(5).optional(),
         reviewCount: z.number().optional(),

         // --- Варіанти ---
         colors: z
            .array(
               z.object({
                  label: z.string(),
                  labelKey: z.string().optional(), // i18n ключ
                  hex: z.string(),
                  available: z.boolean().default(true),
               }),
            )
            .optional(),

         sizes: z
            .array(
               z.object({
                  label: z.string(),
                  stock: z.number().default(0),
               }),
            )
            .optional(),

         // --- Описи ---
         shortDescription: z.string().optional(), // → product list картка
         // довгий опис — markdown body файлу

         // --- Таби (є поле true → таб рендериться) ---
         tabs: z
            .object({
               details: z.boolean().default(true),
               reviews: z.boolean().optional(),
               faqs: z.boolean().optional(),
            })
            .optional(),

         // --- Опціональні блоки ---
         countdown: z.string().optional(), // ISO date → Countdown компонент
         sizeChart: z.boolean().optional(), // → таблиця розмірів
         relatedSlugs: z.array(z.string()).optional(), // → "You Might Also Like"

         // --- Accordion items ---
         accordion: z
            .array(
               z.object({
                  titleKey: z.string(), // i18n ключ
                  contentKey: z.string(), // i18n ключ
               }),
            )
            .optional(),

         // --- Meta ---
         sku: z.string().optional(),
         category: z.array(z.string()).optional(),
         material: z.string().optional(),
         tags: z.array(z.string()).optional(),

         // --- SEO ---
         seoTitle: z.string().optional(),
         seoDescription: z.string().optional(),
      }),
});

export const collections = {
   gallery: galleryCollection,
   products: productsCollection,
};
