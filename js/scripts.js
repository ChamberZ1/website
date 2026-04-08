let currentImageIndex = 0;
let imageItems = [];

let touchStartX = 0;
let touchEndX = 0;
let isPinching = false;

function openImage(fullImageUrl, altText) {
    const modal = document.getElementById("photoModal");
    const modalImg = document.getElementById("fullImage");

    if (!modal || !modalImg || !fullImageUrl) return;

    modalImg.src = "";
    modal.style.display = "flex";
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

function changeImage(direction, event) {
    if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
    }

    if (imageItems.length === 0) return;

    currentImageIndex += direction;

    if (currentImageIndex >= imageItems.length) currentImageIndex = 0;
    if (currentImageIndex < 0) currentImageIndex = imageItems.length - 1;

    const modalImg = document.getElementById("fullImage");
    if (!modalImg) return;

    modalImg.classList.remove("is-zoomed");
    modalImg.src = imageItems[currentImageIndex].full;
    modalImg.alt = imageItems[currentImageIndex].alt;
}

function closeModal() {
    const modal = document.getElementById("photoModal");
    const modalImg = document.getElementById("fullImage");

    if (!modal || !modalImg) return;

    modal.style.display = "none";
    document.body.style.overflow = "auto";

    modalImg.classList.remove("is-zoomed");
    modalImg.style.transformOrigin = "center center";
    modalImg.removeEventListener("mousemove", updateZoomPos);
}

function toggleZoom(event) {
    if (!event || !event.target) return;

    event.stopPropagation();

    const img = event.target;
    img.classList.toggle("is-zoomed");

    if (img.classList.contains("is-zoomed")) {
        updateZoomPos(event);
        img.removeEventListener("mousemove", updateZoomPos);
        img.addEventListener("mousemove", updateZoomPos);
    } else {
        img.removeEventListener("mousemove", updateZoomPos);
        img.style.transformOrigin = "center center";
    }
}

function updateZoomPos(event) {
    const img = document.getElementById("fullImage");
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    img.style.transformOrigin = `${x}% ${y}%`;
}

function handleSwipe() {
    const img = document.getElementById("fullImage");

    if (isPinching || (img && img.classList.contains("is-zoomed"))) {
        isPinching = false;
        return;
    }

    const swipeThreshold = 50;

    if (touchEndX < touchStartX - swipeThreshold) {
        changeImage(1, new Event('swipe'));
    }

    if (touchEndX > touchStartX + swipeThreshold) {
        changeImage(-1, new Event('swipe'));
    }
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
        modal.addEventListener('click', event => {
            if (event.target === modal) {
                closeModal();
            }
        });

        modal.addEventListener('touchstart', event => {
            if (event.targetTouches.length === 1) {
                touchStartX = event.changedTouches[0].screenX;
            }
        }, { passive: true });

        modal.addEventListener('touchend', event => {
            if (event.targetTouches.length === 0) {
                if (event.changedTouches.length === 1) {
                    touchEndX = event.changedTouches[0].screenX;
                    handleSwipe();
                } else {
                    isPinching = false;
                }
            }
        }, { passive: true });

        modal.addEventListener('touchmove', event => {
            if (event.targetTouches.length > 1) {
                isPinching = true;
            }
        }, { passive: true });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', event => {
            changeImage(-1, event);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', event => {
            changeImage(1, event);
        });
    }

    if (modalImg) {
        modalImg.addEventListener('click', toggleZoom);
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
            toggleWindow(windowName);
        });

        toggle.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleWindow(windowName);
            }
        });
    });

    windowCloseButtons.forEach(button => {
        const windowName = button.getAttribute('data-window');
        if (!windowName) return;

        button.addEventListener('click', () => {
            toggleWindow(windowName);
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
    }

    setInterval(updateClock, 1000);
    updateClock();
}

function runSmokeCheck() {
    const missing = [];
    const body = document.body;
    if (!body) return;

    const isPhotography = body.classList.contains('photography');
    const isCyber = body.classList.contains('cyber');

    if (isPhotography) {
        if (!document.getElementById('photoModal')) missing.push('#photoModal');
        if (!document.querySelector('.masonry-grid')) missing.push('.masonry-grid');
        if (!document.querySelector('.masonry-grid img')) missing.push('.masonry-grid img');
    }

    if (isCyber) {
        if (!document.querySelector('.desktop-env')) missing.push('.desktop-env');
        if (!document.getElementById('real-time')) missing.push('#real-time');
    }

    if (missing.length > 0) {
        console.warn('Smoke check: missing expected elements:', missing);
    }
}

function toggleWindow(windowName) {
    const infoWindow = document.getElementById(windowName);
    if (!infoWindow) return;

    const isAlreadyOpen = infoWindow.style.display === 'flex';

    document.querySelectorAll('.window-popup, .start-menu-popup').forEach(win => {
        win.style.display = 'none';
    });

    document.querySelectorAll('.app-icon-container').forEach(icon => {
        icon.classList.remove('active');
    });

    document.querySelectorAll('.window-toggle[data-window]').forEach(toggle => {
        toggle.setAttribute('aria-expanded', 'false');
    });

    if (!isAlreadyOpen) {
        infoWindow.style.display = 'flex';

        document.querySelectorAll(`.window-toggle[data-window="${windowName}"]`).forEach(toggle => {
            toggle.setAttribute('aria-expanded', 'true');
        });

        const matchingIcon = document.querySelector(`.app-icon-container[data-window="${windowName}"]`);
        if (matchingIcon && windowName !== 'start-menu') {
            matchingIcon.classList.add('active');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupPhotography();
    setupCyber();
    runSmokeCheck();
});

document.addEventListener('keydown', event => {
    const modal = document.getElementById("photoModal");
    if (modal && modal.style.display === "flex") {
        if (event.key === "Escape") closeModal();
        if (event.key === "ArrowLeft") changeImage(-1, event);
        if (event.key === "ArrowRight") changeImage(1, event);
    }
});

// Close Start Menu if clicking outside of it
document.addEventListener('click', event => {
    const startMenu = document.getElementById('start-menu');
    const startBtn = document.querySelector('.start-btn');

    if (startMenu && startBtn && startMenu.style.display === 'flex') {
        if (!startMenu.contains(event.target) && !startBtn.contains(event.target)) {
            startMenu.style.display = 'none';
            startBtn.setAttribute('aria-expanded', 'false');
        }
    }
});
