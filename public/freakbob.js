document.addEventListener("DOMContentLoaded", function() {
    const totalImages = 32;
    const imagesPerLoad = 9;
    let loadedImages = 0;
    let imageIndices = Array.from({ length: totalImages }, (_, i) => i + 1);
    imageIndices = imageIndices.sort(() => Math.random() - 0.5);
    const previews = imageIndices.map(num => `previews/image${num}.webp`);
    const images = imageIndices.map(num => `pictures/image${num}.jpg`);

    function loadImages() {
        const gallery = document.getElementById("gallery");
        for (let i = 0; i < imagesPerLoad && loadedImages < totalImages; i++, loadedImages++) {
            const img = document.createElement("img");
            img.src = previews[loadedImages];
            img.alt = `Photo ${loadedImages + 1}`;
            img.setAttribute("data-index", loadedImages);
            img.onclick = function() {
                openLightbox(parseInt(this.getAttribute("data-index")));
            };
            gallery.appendChild(img);
        }
    }

    function handleScroll() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
            loadImages();
        }
    }

    window.addEventListener("scroll", handleScroll);
    window.onload = loadImages;

    let currentIndex = 0;
    function openLightbox(index) {
        currentIndex = index;
        document.getElementById("lightbox-img").src = images[currentIndex];
        document.getElementById("lightbox").style.display = "flex";
    }
    function changeImage(direction) {
        currentIndex = (currentIndex + direction + images.length) % images.length;
        document.getElementById("lightbox-img").src = images[currentIndex];
    }
    function closeLightbox() {
        if (event.target === document.getElementById("lightbox")) {
            document.getElementById("lightbox").style.display = "none";
        }
    }
    document.addEventListener("keydown", function(event) {
        if (event.key === "ArrowLeft") {
            changeImage(-1);
        } else if (event.key === "ArrowRight") {
            changeImage(1);
        } else if (event.key === "Escape") {
            document.getElementById("lightbox").style.display = "none";
        }
    });
});