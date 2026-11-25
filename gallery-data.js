const express = require('express');

module.exports = function galleryRoutes(store) {
    const router = express.Router();
    router.get('/gallery-data', (req, res) => res.json(store.list()));
    router.get('/gallery/images/:name', (req, res) => {
        if (!store.hasAsset(`/gallery/images/${req.params.name}`)) return res.sendStatus(404);
        return res.sendFile(req.params.name, { root: store.imagesDir });
    });
    return router;
};
