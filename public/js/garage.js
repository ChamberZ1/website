/* Highlights the matching hotspot and list item. Without JavaScript the links still jump. */
(function () {
    const hotspots = [...document.querySelectorAll('.hotspot')];
    const mods = [...document.querySelectorAll('.mods > li')];

    function select(id) {
        hotspots.forEach((hotspot) => hotspot.classList.toggle('is-selected', hotspot.getAttribute('href') === `#${id}`));
        mods.forEach((mod) => mod.classList.toggle('is-selected', mod.id === id));
    }

    function selectFromAddress() {
        const id = location.hash.slice(1);
        if (mods.some((mod) => mod.id === id)) select(id);
    }

    document.querySelectorAll('.mod-links a[data-mod]').forEach((link) => {
        link.addEventListener('click', () => select(link.dataset.mod));
    });

    window.addEventListener('hashchange', selectFromAddress);
    selectFromAddress();
})();
