const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const prefix = '/gallery/images/';
const fields = 'id, title, photographer, alt, preview, full, submittedAt, approvedAt, createdAt, dateAdded';
const defaultDir = path.join(os.homedir(), '.local', 'share', 'latech-photo-gallery');

function transaction(db, fn) {
    db.exec('BEGIN IMMEDIATE');
    try {
        const value = fn();
        db.exec('COMMIT');
        return value;
    } catch (error) {
        db.exec('ROLLBACK');
        throw error;
    }
}

// Only ever install complete files. An interrupted import may leave an unlisted
// file: reuse it only if identical, never overwrite an existing photograph.
function installFile(from, to) {
    if (!fs.lstatSync(from).isFile() || fs.statSync(from).size === 0) throw new Error(`Missing or empty image: ${from}`);
    const temp = path.join(path.dirname(to), `.${randomUUID()}.tmp`);
    try {
        fs.copyFileSync(from, temp, fs.constants.COPYFILE_EXCL);
        try {
            fs.linkSync(temp, to);
        } catch (error) {
            if (error.code !== 'EEXIST' || !fs.lstatSync(to).isFile() || !fs.readFileSync(from).equals(fs.readFileSync(to))) throw error;
        }
    } finally {
        fs.rmSync(temp, { force: true });
    }
}

function openGallery({ dataDir = process.env.GALLERY_DATA_DIR || defaultDir,
    legacyDir = path.join(__dirname, 'public', 'gallery') } = {}) {
    if (!path.isAbsolute(dataDir)) throw new Error('GALLERY_DATA_DIR must be an absolute path');
    fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
    dataDir = fs.realpathSync(dataDir);
    if (dataDir === __dirname || dataDir.startsWith(__dirname + path.sep)) throw new Error('Gallery data must live outside the website checkout');
    const imagesDir = path.join(dataDir, 'images');
    fs.mkdirSync(imagesDir, { recursive: true });
    const db = new DatabaseSync(path.join(dataDir, 'gallery.sqlite'), { timeout: 30000 });
    try {
        db.exec(`PRAGMA journal_mode=WAL;
            CREATE TABLE IF NOT EXISTS photos (
                id TEXT PRIMARY KEY, title TEXT NOT NULL, photographer TEXT NOT NULL, alt TEXT NOT NULL,
                preview TEXT NOT NULL, full TEXT NOT NULL, submittedAt TEXT, approvedAt TEXT, createdAt TEXT, dateAdded TEXT,
                status TEXT NOT NULL CHECK(status IN ('pending', 'approved'))
            ) STRICT;`);
        const insert = db.prepare(`INSERT INTO photos (${fields}, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`);
        function add(photo, sourceDir) {
            const { id, title, photographer, preview } = photo;
            const full = photo.full || photo.image;
            if (!/^[A-Za-z0-9_-]+$/.test(id) || typeof id !== 'string' || id.endsWith('_preview') || !title || !photographer) throw new Error(`Invalid photo metadata: ${id}`);
            // The old bot sometimes used one original file for both variants.
            const extensions = ['jpg', 'jpeg', 'webp', 'png'];
            if (!extensions.some(ext => full === `${prefix}${id}.${ext}`) ||
                !(preview === full || preview === `${prefix}${id}_preview.webp`)) throw new Error(`Invalid asset paths for ${id}`);
            insert.run(id, title, photographer, photo.alt || `${title} by ${photographer}`, preview, full,
                photo.submittedAt ?? null, photo.approvedAt ?? null, photo.createdAt ?? null, photo.dateAdded ?? null);
            for (const url of new Set([full, preview])) {
                const name = path.basename(url);
                installFile(path.join(sourceDir, name), path.join(imagesDir, name));
            }
        }
        transaction(db, () => {
            const version = db.prepare('PRAGMA user_version').get().user_version;
            if (version === 1) return;
            if (version !== 0) throw new Error(`Unsupported gallery schema ${version}`);
            const manifest = JSON.parse(fs.readFileSync(path.join(legacyDir, 'photos.json'), 'utf8'));
            if (!Array.isArray(manifest)) throw new Error('Expected an array in photos.json');
            for (const photo of manifest) add(photo, path.join(legacyDir, 'images'));
            db.exec('PRAGMA user_version=1');
        });
        const listed = db.prepare(`SELECT ${fields} FROM photos WHERE status='approved' ORDER BY rowid`);
        const asset = db.prepare("SELECT 1 FROM photos WHERE status='approved' AND (full=? OR preview=?) LIMIT 1");
        return {
            dataDir, imagesDir,
            list: () => listed.all().map(row => Object.fromEntries(Object.entries(row).filter(([, v]) => v !== null))),
            hasAsset: url => Boolean(asset.get(url, url)),
            publish: (photo, sourceDir) => transaction(db, () => add(photo, sourceDir)),
            close: () => db.close()
        };
    } catch (error) {
        db.close();
        throw error;
    }
}

module.exports = { openGallery };

if (require.main === module) {
    const store = openGallery();
    try { console.log(`Gallery ready: ${store.list().length} approved photos in ${store.dataDir}`); }
    finally { store.close(); }
}
