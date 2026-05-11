const galleryState = {
    images: [],
    filteredImages: [],
    currentIndex: 0,
    searchQuery: '',
    sortMode: 'newest',
    zoom: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    panStartX: 0,
    panStartY: 0,
    panOriginX: 0,
    panOriginY: 0
};

const minZoom = 1;
const maxZoom = 4;
const zoomStep = 0.25;

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

function photoTime(image) {
    const timestamps = [
        image.approvedAt,
        image.submittedAt,
        image.createdAt,
        image.dateAdded
    ]
        .map(value => value ? Date.parse(value) : NaN)
        .filter(value => !Number.isNaN(value));

    if (timestamps.length) return Math.max(...timestamps);

    return photoSequence(image);
}

function photoSequence(image) {
    const match = /^img_(\d+)_/i.exec(image.id || '');
    return match ? Number(match[1]) : 0;
}

function compareText(left, right) {
    return String(left || '').localeCompare(String(right || ''), undefined, {
        numeric: true,
        sensitivity: 'base'
    });
}

function sortImages(images) {
    return [...images].sort((left, right) => {
        const leftTime = photoTime(left);
        const rightTime = photoTime(right);
        const leftSequence = photoSequence(left);
        const rightSequence = photoSequence(right);

        if (galleryState.sortMode === 'oldest') {
            return (leftTime - rightTime) || (leftSequence - rightSequence);
        }

        if (galleryState.sortMode === 'title') {
            return compareText(left.title, right.title);
        }

        if (galleryState.sortMode === 'photographer') {
            return compareText(left.photographer, right.photographer) || compareText(left.title, right.title);
        }

        return (rightTime - leftTime) || (rightSequence - leftSequence);
    });
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

function applyGalleryFilters() {
    const filtered = galleryState.images.filter(image => {
        if (!galleryState.searchQuery) return true;
        return `${image.title} ${image.photographer}`.toLowerCase().includes(galleryState.searchQuery);
    });

    const sorted = sortImages(filtered);
    galleryState.filteredImages = sorted;
    renderGallery(sorted);

    const count = document.querySelector('[data-gallery-count]');
    if (count) count.textContent = `${sorted.length} photos`;
}

function setupGallerySearch() {
    const input = document.querySelector('[data-gallery-search]');
    if (!input) return;

    input.addEventListener('input', () => {
        galleryState.searchQuery = input.value.trim().toLowerCase();
        applyGalleryFilters();
    });
}

function setupGallerySort() {
    const select = document.querySelector('[data-gallery-sort]');
    if (!select) return;

    select.value = galleryState.sortMode;
    select.addEventListener('change', () => {
        galleryState.sortMode = select.value;
        applyGalleryFilters();
    });
}

function openLightbox(index) {
    const lightbox = document.querySelector('[data-lightbox]');
    if (!lightbox || !galleryState.filteredImages[index]) return;

    galleryState.currentIndex = index;
    document.body.classList.add('lightbox-open');
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    resetZoom();
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
    resetZoom();
    updateLightbox();
}

function clampZoom(value) {
    return Math.min(maxZoom, Math.max(minZoom, value));
}

function setZoom(value) {
    galleryState.zoom = clampZoom(value);
    if (galleryState.zoom === 1) {
        galleryState.panX = 0;
        galleryState.panY = 0;
    }
    updateZoom();
}

function resetZoom() {
    galleryState.zoom = 1;
    galleryState.panX = 0;
    galleryState.panY = 0;
    updateZoom();
}

function updateZoom() {
    const image = document.querySelector('[data-lightbox-image]');
    const resetButton = document.querySelector('[data-lightbox-zoom-reset]');
    if (!image) return;

    image.style.transform = `translate(${galleryState.panX}px, ${galleryState.panY}px) scale(${galleryState.zoom})`;
    image.classList.toggle('is-zoomed', galleryState.zoom > 1);
    if (resetButton) resetButton.textContent = `${galleryState.zoom.toFixed(galleryState.zoom % 1 ? 2 : 0)}x`;
}

function startPan(event) {
    if (galleryState.zoom <= 1) return;
    event.preventDefault();
    galleryState.isPanning = true;
    galleryState.panStartX = event.clientX;
    galleryState.panStartY = event.clientY;
    galleryState.panOriginX = galleryState.panX;
    galleryState.panOriginY = galleryState.panY;
    event.currentTarget.classList.add('is-dragging');
    event.currentTarget.setPointerCapture(event.pointerId);
}

function movePan(event) {
    if (!galleryState.isPanning) return;
    event.preventDefault();
    galleryState.panX = galleryState.panOriginX + event.clientX - galleryState.panStartX;
    galleryState.panY = galleryState.panOriginY + event.clientY - galleryState.panStartY;
    updateZoom();
}

function endPan(event) {
    galleryState.isPanning = false;
    event.currentTarget.classList.remove('is-dragging');
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
    }
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
    updateZoom();
}

function setupLightbox() {
    const lightbox = document.querySelector('[data-lightbox]');
    if (!lightbox) return;

    const lightboxImage = document.querySelector('[data-lightbox-image]');
    const lightboxStage = document.querySelector('.lightbox-stage');

    document.querySelector('[data-lightbox-close]').addEventListener('click', closeLightbox);
    document.querySelector('[data-lightbox-prev]').addEventListener('click', () => moveLightbox(-1));
    document.querySelector('[data-lightbox-next]').addEventListener('click', () => moveLightbox(1));
    document.querySelector('[data-lightbox-zoom-out]').addEventListener('click', () => setZoom(galleryState.zoom - zoomStep));
    document.querySelector('[data-lightbox-zoom-reset]').addEventListener('click', resetZoom);
    document.querySelector('[data-lightbox-zoom-in]').addEventListener('click', () => setZoom(galleryState.zoom + zoomStep));
    lightbox.addEventListener('click', event => {
        if (event.target === lightbox) closeLightbox();
    });

    lightboxStage.addEventListener('wheel', event => {
        event.preventDefault();
        const direction = event.deltaY > 0 ? -zoomStep : zoomStep;
        setZoom(galleryState.zoom + direction);
    }, { passive: false });

    lightboxImage.addEventListener('dblclick', () => {
        if (galleryState.zoom === 1) {
            setZoom(2);
        } else {
            resetZoom();
        }
    });

    lightboxImage.addEventListener('pointerdown', startPan);
    lightboxImage.addEventListener('pointermove', movePan);
    lightboxImage.addEventListener('pointerup', endPan);
    lightboxImage.addEventListener('pointercancel', endPan);

    document.addEventListener('keydown', event => {
        if (!lightbox.classList.contains('is-open')) return;
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowLeft') moveLightbox(-1);
        if (event.key === 'ArrowRight') moveLightbox(1);
        if (event.key === '+' || event.key === '=') setZoom(galleryState.zoom + zoomStep);
        if (event.key === '-' || event.key === '_') setZoom(galleryState.zoom - zoomStep);
        if (event.key === '0') resetZoom();
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

        renderHomePhotos(images);
        setupGallerySearch();
        setupGallerySort();
        applyGalleryFilters();
        setupLightbox();
        openHashPhoto();
    } catch (error) {
        const target = document.querySelector('[data-gallery-grid], [data-featured-photos]');
        if (target) {
            target.innerHTML = '<p class="empty-state">Gallery photos could not be loaded.</p>';
        }
        console.error(error);
    }
});
