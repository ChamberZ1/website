import { getCollection } from 'astro:content';
import order from '../content/bookmarks/bookmarks.json';

/**
 * Sections in bookmarks.json order, without empty groups.
 * Draft links are included only by `npm run dev`.
 */
export async function getBookmarks() {
    const sections = await getCollection('bookmarks');
    const position = (id: string) => order.findIndex((section) => section.id === id);
    return sections
        .sort((a, b) => position(a.id) - position(b.id))
        .map(({ id, data }) => ({
            id,
            name: data.name,
            groups: data.groups
                .map((group) => ({ ...group, links: group.links.filter(({ draft }) => import.meta.env.DEV || !draft) }))
                .filter(({ links }) => links.length > 0),
        }))
        .filter(({ groups }) => groups.length > 0);
}
