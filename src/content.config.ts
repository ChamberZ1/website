import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
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

const garage = defineCollection({
    loader: file('src/content/garage/mods.json'),
    schema: ({ image }) => z.object({
        name: z.string(),
        description: z.string(),
        brand: z.string().optional(),
        price: z.string().optional(),
        notes: z.string().optional(),
        link: z.url().optional(),
        video: z.url().optional(),
        photo: image().optional(),
        photoAlt: z.string().default(''),
        post: reference('archives').optional(),
        // Percentages from the left and top of the bike photo.
        hotspot: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).optional(),
        draft: z.boolean().default(true),
    }),
});

export const collections = { archives, garage };
