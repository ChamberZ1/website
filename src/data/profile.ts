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
        { label: 'Contact', href: 'mailto:zcharles@vt.edu' },
    ],
    experience: [
        {
            role: 'Cybersecurity Intern',
            organization: 'Lawrence Livermore National Laboratory',
            location: 'Livermore, CA',
            dates: 'Summer 2023 & 2024',
            points: [
                'Wrote pytest unit and integration tests against SQLite and PostgreSQL backends, validating query behavior and schema compatibility within the CI/CD pipeline.',
                'Built a MEAN-stack web application giving DHS analysts a browser interface to create, query, and update records in a backing database.',
                'Wrote a Python script using regex to extract IP addresses and domains, flagging suspicious entries against allow/deny lists, validated against sample report data.',
            ],
        },
    ],
    education: {
        school: 'Virginia Tech',
        degrees: [
            { name: 'Master of Engineering, Computer Engineering', date: 'May 2025' },
            { name: 'Bachelor of Science, Computer Engineering, Magna Cum Laude', date: 'May 2024' },
        ],
        programs: ['SFS CyberCorps Scholar', 'IC CAE'],
    },
    certifications: ['CompTIA Security+', 'Cranium AI Red Team Certification'],
    skills: ['Python', 'C++', 'Bash', 'Kubernetes', 'Proxmox', 'Wireshark', 'Burp Suite', 'Ghidra', 'scikit-learn', 'pytest'],
};
