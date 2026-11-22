/* Search. Without JavaScript the box stays hidden and every link shows. */
(function () {
    const search = document.getElementById('bookmark-search');
    const query = document.getElementById('bookmark-query');
    const empty = document.getElementById('bookmark-empty');
    if (!search || !query || !empty) return;

    const links = [...document.querySelectorAll('.bookmark-group li')];
    const groups = [...document.querySelectorAll('.bookmark-group')];
    const sections = [...document.querySelectorAll('.bookmark-section')];

    function filter() {
        const words = query.value.toLowerCase().split(/\s+/).filter(Boolean);
        links.forEach((link) => {
            link.hidden = !words.every((word) => link.dataset.search.includes(word));
        });
        [...groups, ...sections].forEach((block) => {
            block.hidden = !block.querySelector('li:not([hidden])');
        });
        empty.hidden = links.some((link) => !link.hidden);
    }

    search.hidden = false;
    query.addEventListener('input', filter);
    filter();
})();
