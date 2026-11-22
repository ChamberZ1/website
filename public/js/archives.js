/* Category filter. Without JavaScript the filter stays hidden and every post shows. */
(function () {
    const filter = document.getElementById('post-filter');
    if (!filter) return;

    const buttons = [...filter.querySelectorAll('button')];
    const posts = [...document.querySelectorAll('.post-list > li')];

    filter.hidden = false;
    filter.addEventListener('click', function (event) {
        const chosen = event.target.closest('button');
        if (!chosen) return;
        buttons.forEach((button) => button.setAttribute('aria-pressed', String(button === chosen)));
        posts.forEach((post) => {
            post.hidden = Boolean(chosen.dataset.filter) && post.dataset.category !== chosen.dataset.filter;
        });
    });
})();
