const galleryState = {
    images: [],
    filteredImages: [],
    currentIndex: 0
};

function shuffle(items) {
    return [...items].sort(() => Math.random() - 0.5);
}

async function fetchGalleryImages() {
    const response = await fetch('/gallery-data');
    if (!response.ok) {
        throw new Error(`Gallery request failed with ${response.status}`);
    }

    return response.json();
}

function photoCaption(image) {
    return `
        <span class="photo-caption">
            <strong>${image.title}</strong>
            ${image.photographer}
        </span>
    `;
}

function renderHomePhotos(images) {
    const grid = document.querySelector('[data-featured-photos]');
    if (!grid) return;

    const selected = shuffle(images).slice(0, 5);
    grid.innerHTML = selected.map(image => `
        <a class="feature-photo" href="Gallery.html#${image.id}" aria-label="Open ${image.alt} in the gallery">
            <img src="${image.preview}" alt="${image.alt}" loading="lazy">
            ${photoCaption(image)}
        </a>
    `).join('');
}

function renderGallery(images) {
    const gallery = document.querySelector('[data-gallery-grid]');
    if (!gallery) return;

    gallery.innerHTML = images.map((image, index) => `
        <button class="gallery-card" type="button" data-gallery-index="${index}" id="${image.id}">
            <img src="${image.preview}" alt="${image.alt}" loading="lazy">
            ${photoCaption(image)}
        </button>
    `).join('');

    gallery.querySelectorAll('[data-gallery-index]').forEach(card => {
        card.addEventListener('click', () => openLightbox(Number(card.dataset.galleryIndex)));
    });
}

function setFilteredImages(images) {
    galleryState.filteredImages = images;
    renderGallery(images);
    const count = document.querySelector('[data-gallery-count]');
    if (count) count.textContent = `${images.length} photos`;
}

function setupGallerySearch() {
    const input = document.querySelector('[data-gallery-search]');
    if (!input) return;

    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        const filtered = galleryState.images.filter(image => {
            return `${image.title} ${image.photographer}`.toLowerCase().includes(query);
        });
        setFilteredImages(filtered);
    });
}

function openLightbox(index) {
    const lightbox = document.querySelector('[data-lightbox]');
    if (!lightbox || !galleryState.filteredImages[index]) return;

    galleryState.currentIndex = index;
    document.body.classList.add('lightbox-open');
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    updateLightbox();
}

function closeLightbox() {
    const lightbox = document.querySelector('[data-lightbox]');
    if (!lightbox) return;

    document.body.classList.remove('lightbox-open');
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
}

function moveLightbox(direction) {
    const total = galleryState.filteredImages.length;
    if (!total) return;

    galleryState.currentIndex = (galleryState.currentIndex + direction + total) % total;
    updateLightbox();
}

function updateLightbox() {
    const image = galleryState.filteredImages[galleryState.currentIndex];
    if (!image) return;

    const lightboxImage = document.querySelector('[data-lightbox-image]');
    const title = document.querySelector('[data-lightbox-title]');
    const meta = document.querySelector('[data-lightbox-meta]');
    const counter = document.querySelector('[data-lightbox-counter]');

    lightboxImage.src = image.full;
    lightboxImage.alt = image.alt;
    title.textContent = image.title;
    meta.textContent = image.photographer;
    counter.textContent = `${galleryState.currentIndex + 1} / ${galleryState.filteredImages.length}`;
}

function setupLightbox() {
    const lightbox = document.querySelector('[data-lightbox]');
    if (!lightbox) return;

    document.querySelector('[data-lightbox-close]').addEventListener('click', closeLightbox);
    document.querySelector('[data-lightbox-prev]').addEventListener('click', () => moveLightbox(-1));
    document.querySelector('[data-lightbox-next]').addEventListener('click', () => moveLightbox(1));
    lightbox.addEventListener('click', event => {
        if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', event => {
        if (!lightbox.classList.contains('is-open')) return;
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowLeft') moveLightbox(-1);
        if (event.key === 'ArrowRight') moveLightbox(1);
    });
}

function openHashPhoto() {
    if (!window.location.hash) return;

    const id = decodeURIComponent(window.location.hash.slice(1));
    const index = galleryState.filteredImages.findIndex(image => image.id === id);
    if (index >= 0) openLightbox(index);
}

document.addEventListener('DOMContentLoaded', async () => {
    const needsGallery = document.querySelector('[data-gallery-grid], [data-featured-photos]');
    if (!needsGallery) return;

    try {
        const images = await fetchGalleryImages();
        galleryState.images = images;
        galleryState.filteredImages = images;

        renderHomePhotos(images);
        renderGallery(images);
        setupGallerySearch();
        setupLightbox();
        openHashPhoto();

        const count = document.querySelector('[data-gallery-count]');
        if (count) count.textContent = `${images.length} photos`;
    } catch (error) {
        const target = document.querySelector('[data-gallery-grid], [data-featured-photos]');
        if (target) {
            target.innerHTML = '<p class="empty-state">Gallery photos could not be loaded.</p>';
        }
        console.error(error);
    }
});
