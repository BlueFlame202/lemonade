import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { categories } from './types/blog';

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string(),
    image: z.string().optional(),
    updated: z.string().optional(),
    category: z.array(z.enum(categories)),
    tags: z.array(z.string()).optional(),
  }),
});

const notesCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/aletheia' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    writer: z.string(),
    image: z.string().optional(),
    updated: z.string().optional(),
    category: z.array(z.enum(categories)),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  aletheia: notesCollection,
};
