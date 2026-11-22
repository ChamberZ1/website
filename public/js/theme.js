/* Runs synchronously in <head> so the stored theme is applied before first paint. */
(function () {
    try {
        var stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') {
            document.documentElement.setAttribute('data-theme', stored);
        }
    } catch (e) {
        /* localStorage blocked (private mode, blocked site data) — fall back to system preference */
    }
})();
