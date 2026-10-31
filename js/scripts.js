let currentImageIndex = 0;
let imageItems = [];

let previousOverflow = '';
let zoomBounds = null;
let zoomOrigin = { x: 50, y: 50 };
let activeWindowName = null;
let activeWindowTrigger = null;

function resetZoom() {
    zoomBounds = null;
    zoomOrigin = { x: 50, y: 50 };
    document.getElementById('modalZoomBtn')?.setAttribute('aria-pressed', 'false');
    const img = document.getElementById('fullImage');
    if (!img) return;
    img.classList.remove('is-zoomed');
    img.style.transformOrigin = 'center center';
    img.removeEventListener('mousemove', updateZoomPos);
}

function openImage(fullImageUrl, altText) {
    const modal = document.getElementById("photoModal");
    const modalImg = document.getElementById("fullImage");

    if (!modal || !modalImg || !fullImageUrl) return;

    if (!modal.open) {
        previousOverflow = document.body.style.overflow;
        modal.showModal();
    }
    resetZoom();
    document.body.style.overflow = "hidden";

    currentImageIndex = imageItems.findIndex(item => item.full === fullImageUrl);

    if (currentImageIndex === -1) {
        modalImg.src = fullImageUrl;
        modalImg.alt = altText || "Expanded photograph";
        return;
    }

    modalImg.src = imageItems[currentImageIndex].full;
    modalImg.alt = imageItems[currentImageIndex].alt;
}

function changeImage(direction) {
    if (imageItems.length === 0) return;

    currentImageIndex += direction;

    if (currentImageIndex >= imageItems.length) currentImageIndex = 0;
    if (currentImageIndex < 0) currentImageIndex = imageItems.length - 1;

    const modalImg = document.getElementById("fullImage");
    if (!modalImg) return;

    resetZoom();
    modalImg.src = imageItems[currentImageIndex].full;
    modalImg.alt = imageItems[currentImageIndex].alt;
}

function closeModal() {
    const modal = document.getElementById("photoModal");
    const modalImg = document.getElementById("fullImage");

    if (!modal || !modalImg || !modal.open) return;

    modal.close();
    document.body.style.overflow = previousOverflow;
    resetZoom();
}

function toggleZoom(event) {
    const img = document.getElementById('fullImage');
    if (!img || !img.complete || !img.naturalWidth || window.innerWidth <= 768) return;
    if (img.classList.contains('is-zoomed')) {
        resetZoom();
        return;
    }

    // Read the untransformed bounds once; transformed bounds change as the
    // origin moves and would feed that movement back into the next calculation.
    zoomBounds = img.getBoundingClientRect();
    img.classList.add('is-zoomed');
    document.getElementById('modalZoomBtn')?.setAttribute('aria-pressed', 'true');
    if (event.currentTarget.id === 'modalZoomBtn' || event.detail === 0) {
        setZoomOrigin(50, 50);
    } else {
        updateZoomPos(event);
    }
    img.addEventListener('mousemove', updateZoomPos);
}

function setZoomOrigin(x, y) {
    zoomOrigin = {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
    };
    document.getElementById('fullImage').style.transformOrigin = `${zoomOrigin.x}% ${zoomOrigin.y}%`;
}

function updateZoomPos(event) {
    const img = document.getElementById('fullImage');
    if (!img || !zoomBounds || !zoomBounds.width || !zoomBounds.height) return;

    setZoomOrigin(((event.clientX - zoomBounds.left) / zoomBounds.width) * 100,
        ((event.clientY - zoomBounds.top) / zoomBounds.height) * 100);
}

function setupPhotography() {
    if (!document.body.classList.contains('photography')) return;

    const imgElements = document.querySelectorAll('.masonry-grid img');
    const modal = document.getElementById("photoModal");
    const modalImg = document.getElementById("fullImage");
    const prevBtn = document.getElementById('modalPrevBtn');
    const nextBtn = document.getElementById('modalNextBtn');

    imageItems = Array.from(imgElements).map(img => ({
        full: img.getAttribute('data-full'),
        alt: img.getAttribute('alt') || 'Expanded photograph',
    }));

    imgElements.forEach(img => {
        img.setAttribute('role', 'button');
        img.setAttribute('tabindex', '0');
        img.setAttribute('aria-label', `Open image: ${img.getAttribute('alt') || 'Photograph'}`);

        img.addEventListener('click', () => {
            openImage(img.getAttribute('data-full'), img.getAttribute('alt'));
        });

        img.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openImage(img.getAttribute('data-full'), img.getAttribute('alt'));
            }
        });
    });

    if (modal) {
        modal.addEventListener('cancel', event => {
            event.preventDefault();
            closeModal();
        });

        modal.addEventListener('click', event => {
            if (event.target === modal) {
                closeModal();
            }
        });

        let gestureStart = null;
        let gestureBlocked = false;

        modal.addEventListener('touchstart', event => {
            if (event.touches.length === 1) {
                const touch = event.changedTouches[0];
                gestureBlocked = Boolean(event.target.closest('button'));
                gestureStart = !gestureBlocked && touch ? {
                    identifier: touch.identifier,
                    x: touch.screenX,
                    y: touch.screenY,
                } : null;
            } else {
                // Keep a multi-touch gesture blocked until every finger lifts.
                gestureBlocked = true;
            }
        }, { passive: true });

        modal.addEventListener('touchend', event => {
            if (event.touches.length > 0) return;

            const start = gestureStart;
            const blocked = gestureBlocked;
            gestureStart = null;
            gestureBlocked = false;
            if (!start || blocked || !modal.open || modalImg?.classList.contains('is-zoomed')) return;

            const touch = Array.from(event.changedTouches).find(item => item.identifier === start.identifier);
            if (!touch) return;
            const deltaX = touch.screenX - start.x;
            const deltaY = touch.screenY - start.y;
            if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                changeImage(deltaX < 0 ? 1 : -1);
            }
        }, { passive: true });

        modal.addEventListener('touchcancel', () => {
            gestureStart = null;
            gestureBlocked = true;
        }, { passive: true });

        modal.addEventListener('touchmove', event => {
            if (event.touches.length > 1) gestureBlocked = true;
        }, { passive: true });
    }

    document.getElementById('modalCloseBtn')?.addEventListener('click', closeModal);
    const zoomBtn = document.getElementById('modalZoomBtn');
    zoomBtn?.addEventListener('click', toggleZoom);
    zoomBtn?.addEventListener('keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !modalImg?.classList.contains('is-zoomed')) return;
        const movement = {
            ArrowLeft: [-10, 0], ArrowRight: [10, 0],
            ArrowUp: [0, -10], ArrowDown: [0, 10],
        }[event.key];
        if (movement) {
            event.preventDefault();
            setZoomOrigin(zoomOrigin.x + movement[0], zoomOrigin.y + movement[1]);
        }
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => changeImage(-1));
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => changeImage(1));
    }

    if (modalImg) {
        modalImg.addEventListener('click', toggleZoom);
        modalImg.addEventListener('load', resetZoom);
    }

    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            if (window.innerWidth > 600) return;

            const currentScrollY = window.scrollY;

            if (currentScrollY <= 0) {
                backBtn.classList.remove('back-btn--hidden');
                lastScrollY = 0;
                return;
            }

            if (currentScrollY > lastScrollY) {
                backBtn.classList.add('back-btn--hidden');
            } else {
                backBtn.classList.remove('back-btn--hidden');
            }

            lastScrollY = currentScrollY;
        }, { passive: true });
    }
}

function setupCyber() {
    if (!document.body.classList.contains('cyber')) return;

    const windowToggles = document.querySelectorAll('.window-toggle[data-window]');
    const windowCloseButtons = document.querySelectorAll('.window-close[data-window]');

    windowToggles.forEach(toggle => {
        const windowName = toggle.getAttribute('data-window');
        if (!windowName) return;

        toggle.addEventListener('click', () => {
            toggleWindow(windowName, toggle);
        });

    });

    windowCloseButtons.forEach(button => {
        const windowName = button.getAttribute('data-window');
        if (!windowName) return;

        button.addEventListener('click', () => {
            closeWindow(windowName);
        });
    });

    function updateClock() {
        const clockElement = document.getElementById('real-time');
        if (!clockElement) return;

        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();

        minutes = minutes < 10 ? '0' + minutes : minutes;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;

        clockElement.textContent = `${hours}:${minutes} ${ampm}`;
        setTimeout(updateClock, 60000 - (Date.now() % 60000));
    }

    updateClock();
}

function closeWindow(windowName, restoreFocus = true) {
    const infoWindow = document.getElementById(windowName);
    if (!infoWindow) return;

    infoWindow.style.display = 'none';
    document.querySelectorAll('.window-toggle[data-window]').forEach(toggle => {
        if (toggle.getAttribute('data-window') === windowName) {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.classList.remove('active');
        }
    });

    if (activeWindowName === windowName) {
        const trigger = activeWindowTrigger;
        activeWindowName = null;
        activeWindowTrigger = null;
        if (restoreFocus) trigger?.focus();
    }
}

function toggleWindow(windowName, trigger = null) {
    const infoWindow = document.getElementById(windowName);
    if (!infoWindow) return;

    if (infoWindow.style.display === 'flex') {
        closeWindow(windowName);
        return;
    }
    if (activeWindowName) closeWindow(activeWindowName, false);

    activeWindowName = windowName;
    activeWindowTrigger = trigger || document.activeElement;
    infoWindow.style.display = 'flex';
    document.querySelectorAll('.window-toggle[data-window]').forEach(toggle => {
        if (toggle.getAttribute('data-window') === windowName) {
            toggle.setAttribute('aria-expanded', 'true');
            if (toggle.classList.contains('app-icon-container') && windowName !== 'start-menu') {
                toggle.classList.add('active');
            }
        }
    });
    infoWindow.querySelector('button, a[href], [tabindex="0"]')?.focus();
}

window.addEventListener('resize', resetZoom);

document.addEventListener('DOMContentLoaded', () => {
    setupPhotography();
    setupCyber();
});

document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const modal = document.getElementById("photoModal");
    if (modal?.open) {
        if (['Escape', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
            if (event.key === 'Escape') closeModal();
            else changeImage(event.key === 'ArrowLeft' ? -1 : 1);
        }
    } else if (event.key === 'Escape' && activeWindowName) {
        event.preventDefault();
        closeWindow(activeWindowName);
    }
});

// Close Start Menu if clicking outside of it
document.addEventListener('click', event => {
    const startMenu = document.getElementById('start-menu');
    const startBtn = document.querySelector('.start-btn');

    if (startMenu && startBtn && startMenu.style.display === 'flex') {
        if (!startMenu.contains(event.target) && !startBtn.contains(event.target)) {
            closeWindow('start-menu', false);
        }
    }
});
