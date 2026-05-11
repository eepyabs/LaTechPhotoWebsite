const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const manifestPath = path.join(__dirname, 'public', 'gallery', 'photos.json');

function loadGalleryManifest() {
    if (!fs.existsSync(manifestPath)) {
        return [];
    }

    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

router.get('/', (req, res) => {
    const photos = loadGalleryManifest().map(photo => ({
        id: photo.id,
        title: photo.title,
        photographer: photo.photographer,
        alt: photo.alt || `${photo.title} by ${photo.photographer}`,
        preview: photo.preview,
        full: photo.full || photo.image,
        submittedAt: photo.submittedAt,
        approvedAt: photo.approvedAt,
        createdAt: photo.createdAt,
        dateAdded: photo.dateAdded
    }));

    res.json(photos);
});

module.exports = router;
