/*!
* Start Bootstrap - Grayscale v7.0.6 (https://startbootstrap.com/theme/grayscale)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-grayscale/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});

// BEGIN MY CODE

let currentImageIndex = 0;
let allImages = [];

// Call this function when the page loads to "grab" all photography images
window.onload = function() {
    // Select all images inside your masonry-grid
    const imgElements = document.querySelectorAll('.masonry-grid img');
    allImages = Array.from(imgElements).map(img => img.getAttribute('data-full'));
};

function openImage(fullImageUrl) {
   const modal = document.getElementById("photoModal");
   const modalImg = document.getElementById("fullImage");

   modalImg.src = ""; // Clear old image
   modal.style.display = "flex"; // Show the modal

   // Find where this image sits in our list of 2000px images
   currentImageIndex = allImages.indexOf(fullImageUrl);


   modalImg.src = fullImageUrl; // Put the clicked image in the modal
}

function changeImage(direction, event) {
    // stopPropagation prevents the modal from closing when clicking arrows
    if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
    }
    
    currentImageIndex += direction;

    // Loop back to start/end if we go out of bounds
    if (currentImageIndex >= allImages.length) currentImageIndex = 0;
    if (currentImageIndex < 0) currentImageIndex = allImages.length - 1;

    const modalImg = document.getElementById("fullImage");
    modalImg.classList.remove("is-zoomed"); // Reset zoom when switching images
    modalImg.src = allImages[currentImageIndex];
}

function closeModal() {
    const modal = document.getElementById("photoModal");
    const modalImg = document.getElementById("fullImage");

    modal.style.display = "none"; // Hide the modal

    // Reset zoom state
    modalImg.classList.remove("is-zoomed"); 
    modalImg.style.transformOrigin = "center center"; 
    modalImg.removeEventListener("mousemove", updateZoomPos);

}

function toggleZoom(event) {
    event.stopPropagation(); // Prevent the click from closing the modal

    const img = event.target;
    img.classList.toggle("is-zoomed");

    if (img.classList.contains("is-zoomed")) {
        // Apply initial position so it doesn't jump
        updateZoomPos(event);
        // Add listener to track mouse movement while zoomed
        img.addEventListener("mousemove", updateZoomPos);
    } else {
        // Remove listener and reset position when zooming out
        img.removeEventListener("mousemove", updateZoomPos);
        img.style.transformOrigin = "center center";
    }
}

function updateZoomPos(e) {
    const img = document.getElementById("fullImage");

    // Get the dimensions of the image and mouse position
    const rect = img.getBoundingClientRect();

    // Calculate mouse position as a percentage of the image (0 to 100)
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Move the "origin" of the scale to the mouse position
    img.style.transformOrigin = `${x}% ${y}%`;
}

/* Code for swiping between images on mobile devices */

let touchStartX = 0;
let touchEndX = 0;

const modal = document.getElementById("photoModal");

// Listen for the start of a touch
modal.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
}, {passive: true}); // Doesn't interrupt scrolling

// Listen for the end of a touch
modal.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, {passive: true});

function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance in pixels to count as a swipe
    
    if (touchEndX < touchStartX - swipeThreshold) {
        // Swiped Left -> Show Next Image
        changeImage(1, new Event('swipe'));
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {
        // Swiped Right -> Show Previous Image
        changeImage(-1, new Event('swipe'));
    }
}

document.addEventListener('keydown', (e) => {
    const modal = document.getElementById("photoModal");
    if (modal.style.display === "flex") {
        if (e.key === "Escape") closeModal();
        if (e.key === "ArrowLeft") changeImage(-1, e);
        if (e.key === "ArrowRight") changeImage(1, e);
    }
});