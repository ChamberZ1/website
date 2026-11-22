import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const archives = defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content/archives' }),
    schema: ({ image }) => z.object({
        title: z.string(),
        date: z.coerce.date(),
        updated: z.coerce.date().optional(),
        summary: z.string(),
        category: z.string(),
        cover: image().optional(),
        coverAlt: z.string().default(''),
        // Posts stay hidden until draft is false, and off the homepage unless asked for.
        draft: z.boolean().default(true),
        showOnHome: z.boolean().default(false),
    }),
});

export const collections = { archives };
