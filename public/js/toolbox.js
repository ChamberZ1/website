/* Search. Without JavaScript the box stays hidden and every tool shows. */
(function () {
    const search = document.getElementById('tool-search');
    const query = document.getElementById('tool-query');
    const empty = document.getElementById('tool-empty');
    if (!search || !query || !empty) return;

    const tools = [...document.querySelectorAll('.tool-group li')];
    const groups = [...document.querySelectorAll('.tool-group')];
    const sections = [...document.querySelectorAll('.tool-section')];

    function filter() {
        const words = query.value.toLowerCase().split(/\s+/).filter(Boolean);
        tools.forEach((tool) => {
            tool.hidden = !words.every((word) => tool.dataset.search.includes(word));
        });
        [...groups, ...sections].forEach((block) => {
            block.hidden = !block.querySelector('li:not([hidden])');
        });
        empty.hidden = tools.some((tool) => !tool.hidden);
    }

    search.hidden = false;
    query.addEventListener('input', filter);
    filter();
})();
