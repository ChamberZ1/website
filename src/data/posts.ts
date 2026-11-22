import { getCollection } from 'astro:content';

/** Newest first. Drafts are included only by `npm run dev`. */
export async function getPosts() {
    const posts = await getCollection('archives', ({ data }) => import.meta.env.DEV || !data.draft);
    return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Dates are written as YYYY-MM-DD, which parses as UTC. */
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export const longDate = (date: Date) =>
    date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
