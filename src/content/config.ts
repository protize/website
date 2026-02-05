import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("Protize Team"),
    tags: z.array(z.string()).default([]),
    category: z.string().default("Uncategorized"),
    featured: z.boolean().default(false),
    coverImage: z.string().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const Portfolio = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    excerpt: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("Protize Team"),
    tags: z.array(z.string()).default([]),
    category: z.string().default("Uncategorized"),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    coverImage: z.string().optional(),
    coverAlt: z.string().optional(),
  }),
});

export const collections = {
  blog,
  portfolio: Portfolio,
};
