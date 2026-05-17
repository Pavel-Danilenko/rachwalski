import { defineCollection, z } from "astro:content";

const galleryCollection = defineCollection({
   type: "content",
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

const blogCollection = defineCollection({
   type: "content",
   schema: ({ image }) =>
      z.object({
         title: z.string(),
         excerpt: z.string(),
         date: z.date(),
         readTime: z.number(),
         category: z.string(),
         tags: z.array(z.string()).default([]),
         image: image(),
         author: z.object({
            name: z.string(),
            avatar: z.string(),
            specialty: z.string(),
         }),
         toc: z.array(z.object({
            id: z.string(),
            title: z.string(),
         })).default([]),
         featured: z.boolean().default(false),
      }),
});

export const collections = {
   gallery: galleryCollection,
   blog: blogCollection,
};
