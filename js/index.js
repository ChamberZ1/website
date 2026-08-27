(function () {
    /* ---------- theme toggle ---------- */

    const toggle = document.getElementById('theme-toggle');

    function currentTheme() {
        const set = document.documentElement.getAttribute('data-theme');
        if (set === 'dark' || set === 'light') return set;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    if (toggle) {
        toggle.addEventListener('click', function () {
            const next = currentTheme() === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try {
                localStorage.setItem('theme', next);
            } catch (e) {
                /* storage unavailable — theme still applies for this page view */
            }
        });
    }

    /* ---------- files dropdown ---------- */

    const btn = document.getElementById('files-btn');
    const menu = document.getElementById('files-menu');

    if (!btn || !menu) return;

    function setOpen(open) {
        btn.setAttribute('aria-expanded', String(open));
        menu.hidden = !open;
    }

    btn.addEventListener('click', function (event) {
        event.stopPropagation();
        setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('click', function (event) {
        if (!menu.hidden && !menu.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !menu.hidden) {
            setOpen(false);
            btn.focus();
        }
    });

    /* close after picking a file, since the PDF opens in a new tab */
    menu.addEventListener('click', function () { setOpen(false); });
})();
