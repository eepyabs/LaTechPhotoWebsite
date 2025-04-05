const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const baseDir = path.join(__dirname, 'public', 'previews');

router.get('/', (req, res) => {
    const data = [];

    fs.readdirSync(baseDir).forEach(photographer => {
        const photographerDir = path.join(baseDir, photographer);

        if (!fs.statSync(photographerDir).isDirectory()) return;

        const imageFiles = fs.readdirSync(photographerDir).filter(file =>
            /\.(jpg|jpeg|png|webp)$/i.test(file)
        );

        imageFiles.forEach(image => {
            data.push({
                photographer,
                image: path.join('previews', photographer, image)
            });
        });
    });

    res.json(data);
});

module.exports = router;