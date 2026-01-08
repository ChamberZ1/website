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

// This method is only called when an element with the onclick="openImage(this.src)" attribute is clicked. So no need for conditional checks
function openImage(imageUrl) {
   const modal = document.getElementById("photoModal");
   const modalImg = document.getElementById("fullImage");

   modal.style.display = "flex"; // Show the modal
   modalImg.src = imageUrl; // Put the clicked image in the modal
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
    const img = e.target;

    // Get the dimensions of the image and mouse position
    const rect = img.getBoundingClientRect();

    // Calculate mouse position as a percentage of the image (0 to 100)
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Move the "origin" of the scale to the mouse position
    img.style.transformOrigin = `${x}% ${y}%`;
}
