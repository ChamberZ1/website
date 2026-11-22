// Navigation links and homepage cards. Set `enabled: true` once a section has a
// page and real content.
export interface Section {
    label: string;
    href: string;
    summary: string;
    image?: string;
    enabled: boolean;
}

const sections: Section[] = [
    { label: '/Photography', href: '/photography', summary: 'Photo gallery.', image: '/assets/img/mtn-ridges1-800px.webp', enabled: true },
    { label: '/Toolbox', href: '/toolbox', summary: 'Useful bookmarks and resources.', enabled: false },
    { label: '/Archives', href: '/archives', summary: 'Writing, guides, and experiences.', enabled: false },
    { label: '/Garage', href: '/garage', summary: 'My Honda Rebel 500 and its modifications.', enabled: false },
];

export const liveSections = sections.filter((section) => section.enabled);
