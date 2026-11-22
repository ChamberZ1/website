import { getCollection } from 'astro:content';
import order from '../content/toolbox/tools.json';

/**
 * Sections in tools.json order, without empty groups.
 * Draft tools are included only by `npm run dev`.
 */
export async function getToolSections() {
    const sections = await getCollection('toolbox');
    const position = (id: string) => order.findIndex((section) => section.id === id);
    return sections
        .sort((a, b) => position(a.id) - position(b.id))
        .map(({ id, data }) => ({
            id,
            name: data.name,
            groups: data.groups
                .map((group) => ({ ...group, tools: group.tools.filter(({ draft }) => import.meta.env.DEV || !draft) }))
                .filter(({ tools }) => tools.length > 0),
        }))
        .filter(({ groups }) => groups.length > 0);
}
