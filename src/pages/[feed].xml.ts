// RSS feed at /rss.xml. Not built while there are no posts.
import type { APIRoute } from 'astro';
import { getPosts } from '../data/posts';

export async function getStaticPaths() {
    return (await getPosts()).length ? [{ params: { feed: 'rss' } }] : [];
}

const escape = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: APIRoute = async ({ site }) => {
    const items = (await getPosts()).map(({ id, data }) => {
        const url = new URL(`/archives/${id}`, site).href;
        return `<item><title>${escape(data.title)}</title><link>${url}</link><guid>${url}</guid>`
            + `<pubDate>${data.date.toUTCString()}</pubDate><description>${escape(data.summary)}</description></item>`;
    });
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Charles Zhao</title><link>${new URL('/archives', site).href}</link><description>Writing by Charles Zhao</description>
${items.join('\n')}
</channel></rss>
`, { headers: { 'Content-Type': 'application/rss+xml' } });
};
