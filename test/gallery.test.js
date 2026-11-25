const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-test-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const dataDir = path.join(root, 'data');
    const legacyDir = path.join(root, 'seed');
    const source = path.join(legacyDir, 'images');
    fs.mkdirSync(source, { recursive: true });
    const photo = { id: 'img_0001_A', title: 'Sky', photographer: 'Lee',
        preview: '/gallery/images/img_0001_A_preview.webp', image: '/gallery/images/img_0001_A.jpg' };
    const manifest = path.join(legacyDir, 'photos.json');
    fs.writeFileSync(manifest, JSON.stringify([photo]));
    for (const url of [photo.image, photo.preview]) fs.writeFileSync(path.join(source, path.basename(url)), url);
    const open = () => require('../gallery-store').openGallery({ dataDir, legacyDir });
    return { open, source, manifest, photo, dataDir };
}

test('imports the legacy gallery once; metadata and both files survive without the checkout', t => {
    const { open, source, manifest, photo } = fixture(t);
    const store = open();
    store.close();
    fs.rmSync(manifest);
    fs.rmSync(source, { recursive: true });
    const again = open();
    t.after(() => again.close());
    assert.deepEqual(again.list(), [{ id: photo.id, title: 'Sky', photographer: 'Lee', alt: 'Sky by Lee', preview: photo.preview, full: photo.image }]);
    for (const url of [photo.image, photo.preview]) assert.equal(fs.readFileSync(path.join(again.imagesDir, path.basename(url)), 'utf8'), url);
});

test('website sees bot approvals immediately but never exposes a partial or duplicate publish', async t => {
    const { open, source, photo } = fixture(t);
    const reader = open(), bot = open();
    t.after(() => { reader.close(); bot.close(); });
    const server = require('../index').createApp(reader).listen(0, '127.0.0.1');
    await require('node:events').once(server, 'listening');
    t.after(() => new Promise(resolve => server.close(resolve)));
    const get = url => fetch(`http://127.0.0.1:${server.address().port}${url}`);
    const entry = { ...photo, id: 'new', full: '/gallery/images/new.jpg', preview: '/gallery/images/new_preview.webp' };
    fs.writeFileSync(path.join(source, 'new.jpg'), 'original');
    assert.throws(() => bot.publish(entry, source));
    assert.equal((await get(entry.full)).status, 404);
    assert.equal((await (await get('/gallery-data')).json()).length, 1);
    fs.writeFileSync(path.join(source, 'new_preview.webp'), 'preview');
    bot.publish(entry, source);
    assert.equal((await (await get('/gallery-data')).json())[1].id, 'new');
    assert.equal(await (await get(entry.full)).text(), 'original');
    assert.equal(await (await get(entry.preview)).text(), 'preview');
    assert.throws(() => bot.publish({ ...entry, title: 'replacement' }, source));
    assert.equal(reader.list()[1].title, 'Sky');
    for (const url of ['/gallery/photos.json', '/gallery.sqlite', '/gallery/images/img_0001_330D.jpg']) assert.equal((await get(url)).status, 404);
});

test('failed import can be repaired and retried without skipping or duplicating records', t => {
    const { open, source, photo } = fixture(t);
    fs.unlinkSync(path.join(source, path.basename(photo.preview)));
    assert.throws(open, /ENOENT/);
    fs.writeFileSync(path.join(source, path.basename(photo.preview)), 'repaired');
    const store = open();
    t.after(() => store.close());
    assert.equal(store.list().length, 1);
});
