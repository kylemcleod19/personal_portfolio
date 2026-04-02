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
    learningQuestion: z.string().optional(),
    primaryTools: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
    phases: z.array(z.object({
      label: z.string(),
      status: z.enum(["done", "active", "planned"]),
    })).default([]),
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
