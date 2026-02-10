import { defineCollection, z } from "astro:content";

const Insights = defineCollection({
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
    logo: z.string().optional(),
    coverImage: z.string().optional(),
    coverAlt: z.string().optional(),
  }),
});

export const Services = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    blurb: z.string(),
    image: z.string(),
    category: z.string().default("Uncategorized"),
    points: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().int().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  insights: Insights,
  portfolio: Portfolio,
  services: Services,
};
