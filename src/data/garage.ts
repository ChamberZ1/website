import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import order from '../content/garage/mods.json';

export const bike = {
    name: '2026 Honda Rebel 500 ABS',
    photoAlt: '2026 Honda Rebel 500 ABS with numbered modifications',
};

// Add the photo as src/content/garage/bike.jpg (or .jpeg, .png, .webp).
const photos = import.meta.glob<{ default: ImageMetadata }>('../content/garage/bike.{jpg,jpeg,png,webp}', { eager: true });
export const bikePhoto = Object.values(photos)[0]?.default;

/** In mods.json order. Drafts are included only by `npm run dev`. */
export async function getMods() {
    const mods = await getCollection('garage', ({ data }) => import.meta.env.DEV || !data.draft);
    const position = (id: string) => order.findIndex((mod) => mod.id === id);
    return mods.sort((a, b) => position(a.id) - position(b.id));
}

/** Garage is published once it has a photo and at least one finished mod. */
export async function isGarageLive() {
    return (await getMods()).length > 0 && (import.meta.env.DEV || Boolean(bikePhoto));
}
