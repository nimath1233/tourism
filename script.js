let slideIndex = 0;
let slideTimeout;

function showSlides() {
    const slides = document.getElementsByClassName("mySlides");
    if (slides.length === 0) return;

    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    // Move to next slide
    slideIndex++;
    if (slideIndex > slides.length) { slideIndex = 1; }

    // Show the current slide
    slides[slideIndex - 1].style.display = "block";

    // Set next slide
    slideTimeout = setTimeout(showSlides, 3000);
}

// Start slideshow initially
showSlides();

// Pause/resume when tab visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearTimeout(slideTimeout);
    } else {
        // Avoid multiple timers stacking
        clearTimeout(slideTimeout);
        showSlides();
    }
});
