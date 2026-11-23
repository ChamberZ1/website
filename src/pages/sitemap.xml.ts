// Pages linked from the site navigation, plus published posts.
import type { APIRoute } from 'astro';
import { getPosts, isoDate } from '../data/posts';
import { getLiveSections } from '../data/sections';

export const GET: APIRoute = async ({ site }) => {
    const pages: { path: string; modified?: string }[] = [
        { path: '/' },
        ...(await getLiveSections()).map(({ href }) => ({ path: href })),
        ...(await getPosts()).map(({ id, data }) => ({ path: `/archives/${id}`, modified: isoDate(data.updated ?? data.date) })),
    ];
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(({ path, modified }) => `<url><loc>${new URL(path, site).href}</loc>${modified ? `<lastmod>${modified}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`, { headers: { 'Content-Type': 'application/xml' } });
};
