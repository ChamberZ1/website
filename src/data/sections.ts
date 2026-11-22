import { isGarageLive } from './garage';
import { getPosts } from './posts';
import { getToolSections } from './toolbox';

// Navigation links and homepage cards. Toolbox, Archives and Garage appear by
// themselves when they have published content.
interface Section {
    label: string;
    href: string;
    summary: string;
    image?: string;
    /** SVG path on a 24-unit grid, shown when there is no image. */
    icon?: string;
}

const sections: Section[] = [
    { label: '/Photography', href: '/photography', summary: 'Photo gallery.', image: '/assets/img/mtn-ridges1-800px.webp' },
    { label: '/Toolbox', href: '/toolbox', summary: 'Useful bookmarks and resources.', icon: 'M4 9h16v10H4zM9 9V6h6v3M4 13h6m4 0h6M10 12h4v3h-4z' },
    { label: '/Archives', href: '/archives', summary: 'Writing, guides, and experiences.', icon: 'M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h7' },
    { label: '/Garage', href: '/garage', summary: 'My Honda Rebel 500 and its modifications.', icon: 'M3 10l9-6 9 6v10H3zM7 20v-7h10v7M7 16.5h10' },
];

export async function getLiveSections() {
    const ready: Record<string, boolean> = {
        '/photography': true,
        '/toolbox': (await getToolSections()).length > 0,
        '/archives': (await getPosts()).length > 0,
        '/garage': await isGarageLive(),
    };
    return sections.filter(({ href }) => ready[href]);
}
