document.addEventListener("DOMContentLoaded", function() {
    const totalImages = 32;
    const slideshowContainer = document.querySelector(".slideshow-container");
    let images = [];

    for (let i = 1; i <= totalImages; i++) {
        let img = document.createElement("img");
        img.src = `pictures/image${i}.jpg`;
        img.style.opacity = "0";
        img.style.transition = "opacity 1.5s ease-in-out";
        slideshowContainer.appendChild(img);
        images.push(img);
    }

    let currentIndex = 0;
    function showNextImage() {
        images.forEach(img => img.style.opacity = "0");
        images[currentIndex].style.opacity = "1";
        currentIndex = (currentIndex + 1) % totalImages;
        setTimeout(showNextImage, 5000);
    }
    showNextImage();
});

document.getElementById("contact-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const reason = document.getElementById("reason").value;
    const message = document.getElementById("message").value;

    const mailtoLink = `mailto:general.latechphotoclub@gmail.com?subject=Contact Form Submission: ${reason}&body=Name: ${name}%0D%0AEmail: ${email}%0D%0AReason: ${reason}%0D%0AMessage: ${message}`;

    window.location.href = mailtoLink;

    setTimeout(() => {
        window.location.href = "index.html";
    }, 2000);
});