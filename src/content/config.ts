import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
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

const portfolioCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    category: z.string(),
    client: z.string(),
    date: z.string(),
    featured: z.boolean().default(false),
    featuredImage: z.string(),
    shortDescription: z.string(),
    liveUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    duration: z.string(),
    teamSize: z.number(),
    technologies: z.array(z.string()),
    gallery: z.array(z.string()),
  }),
});

export const collections = {
  insights: blogCollection,
  portfolio: portfolioCollection,
};
