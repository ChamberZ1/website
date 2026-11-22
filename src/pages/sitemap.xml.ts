// Pages linked from the site navigation, plus published posts.
import type { APIRoute } from 'astro';
import { getPosts } from '../data/posts';
import { getLiveSections } from '../data/sections';

export const GET: APIRoute = async ({ site }) => {
    const paths = [
        '/',
        ...(await getLiveSections()).map(({ href }) => href),
        ...(await getPosts()).map(({ id }) => `/archives/${id}`),
    ];
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `<url><loc>${new URL(path, site).href}</loc></url>`).join('\n')}
</urlset>
`, { headers: { 'Content-Type': 'application/xml' } });
};
