(function () {
    /* ---------- theme toggle ---------- */

    const toggle = document.getElementById('theme-toggle');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

    function currentTheme() {
        const set = document.documentElement.getAttribute('data-theme');
        if (set === 'dark' || set === 'light') return set;
        return systemTheme.matches ? 'dark' : 'light';
    }

    if (toggle) {
        function updateThemeLabel() {
            const next = currentTheme() === 'dark' ? 'light' : 'dark';
            toggle.setAttribute('aria-label', `Switch to ${next} mode`);
        }

        updateThemeLabel();
        systemTheme.addEventListener('change', updateThemeLabel);

        toggle.addEventListener('click', function () {
            const next = currentTheme() === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            updateThemeLabel();
            try {
                localStorage.setItem('theme', next);
            } catch {
                /* storage unavailable — theme still applies for this page view */
            }
        });
    }

    /* ---------- mobile navigation disclosure ---------- */

    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarContent = document.getElementById('sidebar-content');

    if (!sidebarToggle || !sidebarContent) return;

    sidebarContent.classList.add('is-collapsible');
    const mobileLayout = window.matchMedia('(max-width: 820px), (max-width: 960px) and (max-height: 500px)');

    function setSidebarOpen(open, restoreFocus = false) {
        const expanded = mobileLayout.matches && open;
        sidebarContent.hidden = mobileLayout.matches && !expanded;
        sidebarToggle.setAttribute('aria-expanded', String(expanded));
        sidebarToggle.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
        if (restoreFocus && mobileLayout.matches) sidebarToggle.focus();
    }

    function syncSidebarLayout() {
        const focusWasInside = sidebarContent.contains(document.activeElement);
        const toggleHadFocus = document.activeElement === sidebarToggle;
        sidebarToggle.hidden = !mobileLayout.matches;
        setSidebarOpen(false);
        if (mobileLayout.matches && focusWasInside) sidebarToggle.focus();
        if (!mobileLayout.matches && toggleHadFocus) {
            sidebarContent.querySelector('a[href]')?.focus();
        }
    }

    sidebarToggle.addEventListener('click', function () {
        setSidebarOpen(sidebarContent.hidden);
    });

    sidebarContent.addEventListener('click', function (event) {
        if (mobileLayout.matches && event.target.closest('a[href]')) {
            setSidebarOpen(false, true);
        }
    });

    const sidebar = sidebarToggle.closest('.sidebar');
    sidebar?.addEventListener('focusout', function (event) {
        // Safari reports no relatedTarget when a link or button is tapped.
        if (mobileLayout.matches && event.relatedTarget && !sidebar.contains(event.relatedTarget)) {
            setSidebarOpen(false);
        }
    });

    // iOS Safari does not send click for taps on plain page content.
    document.addEventListener('pointerdown', function (event) {
        if (mobileLayout.matches && !sidebarContent.hidden &&
            !sidebarContent.contains(event.target) && !sidebarToggle.contains(event.target)) {
            setSidebarOpen(false);
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !event.defaultPrevented &&
            mobileLayout.matches && !sidebarContent.hidden) {
            event.preventDefault();
            setSidebarOpen(false, sidebarContent.contains(document.activeElement) ||
                document.activeElement === sidebarToggle);
        }
    });

    mobileLayout.addEventListener('change', syncSidebarLayout);
    syncSidebarLayout();
})();
