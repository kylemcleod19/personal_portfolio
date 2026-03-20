import { defineCollection, z } from 'astro:content';

const work = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    cover: z.string().optional(),
    showCoverOnPage: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    outcome: z.string().optional(),
    role: z.string().optional(),
    duration: z.string().optional(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work, blog };
