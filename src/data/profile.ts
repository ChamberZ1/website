// Facts come from public/assets/zcharles-resume.pdf. Keep the two in step.
export const profile = {
    name: 'Charles Zhao',
    // Owner-written introduction. Left out of the published page while empty.
    intro: '',
    resume: '/assets/zcharles-resume.pdf',
    links: [
        { label: 'GitHub', href: 'https://github.com/ChamberZ1' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/zcharles/' },
        { label: 'CyLab', href: 'https://learn.cylabacademy.org/users/zcharles517' },
        { label: 'YouTube', href: 'https://www.youtube.com/@cztrailblaze' },
        { label: 'Contact', href: 'mailto:contact@zcharles.com' },
    ],
    experience: [
        {
            role: 'Cybersecurity Intern',
            organization: 'Lawrence Livermore National Laboratory',
            location: 'Livermore, CA',
            dates: 'Summers 2023 & 2024',
            points: [
                'Developed Python unit and integration tests with pytest for SQLite and PostgreSQL, validating database behavior and compatibility with CI/CD workflows.',
                'Built a MEAN-stack web application for Department of Homeland Security analysts to create, query, and update database records through a browser interface.',
                'Automated extraction of IP addresses and domains from security reports using Python and regular expressions, flagging indicators against allow/deny lists.',
            ],
        },
    ],
    education: {
        school: 'Virginia Tech',
        degrees: [
            { name: 'Master of Engineering, Computer Engineering', date: 'May 2025', details: "Master's project: Windows Defender evasion research using Sliver C2" },
            { name: 'Bachelor of Science, Computer Engineering', date: 'May 2024', details: 'Magna Cum Laude, Networking & Cybersecurity concentration' },
        ],
        program: 'CyberCorps Scholarship for Service Scholar',
    },
    certifications: ['CompTIA Security+'],
    skills: [
        { group: 'Languages', items: ['Python', 'C++', 'Bash'] },
        { group: 'Security', items: ['Sliver C2', 'Wireshark', 'Burp Suite', 'Ghidra', 'VirusTotal API'] },
        { group: 'Infrastructure', items: ['Linux', 'Windows', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Elasticsearch', 'Kibana'] },
        { group: 'Development', items: ['Git', 'GitHub Actions', 'pytest', 'CI/CD', 'FastAPI', 'React', 'Node.js'] },
        { group: 'ML', items: ['scikit-learn', 'PyTorch'] },
    ],
};
