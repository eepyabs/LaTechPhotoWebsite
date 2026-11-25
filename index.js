const express = require('express');
const path = require('node:path');
const { openGallery } = require('./gallery-store');
const galleryRoutes = require('./gallery-data');

function createApp(store) {
    const app = express();
    const publicDir = path.join(__dirname, 'public');
    app.use(galleryRoutes(store));
    // The legacy gallery is an import source, never a public fallback.
    for (const dir of ['archive', 'assets', 'css', 'data', 'js', 'previews']) {
        app.use(`/${dir}`, express.static(path.join(publicDir, dir)));
    }
    app.get('/', (req, res) => res.sendFile('index.html', { root: publicDir }));
    app.get(/^\/([A-Za-z0-9_-]+\.html)$/, (req, res) => res.sendFile(req.params[0], { root: publicDir }));
    return app;
}

if (require.main === module) {
    const store = openGallery();
    const server = createApp(store).listen(process.env.PORT || 80, () => {
        console.log(`Gallery serving on port ${server.address().port} from ${store.dataDir}`);
    });
    server.on('close', () => store.close());
}

module.exports = { createApp };
