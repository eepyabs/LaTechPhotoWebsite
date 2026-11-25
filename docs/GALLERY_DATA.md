# Gallery: single-server setup

The website and Discord bot share `gallery.sqlite` and an `images/` directory on **local persistent disk**, outside the checkout. SQLite stores metadata, not image bytes. `/gallery-data` and `/gallery/images/<filename>` continue to serve the existing gallery. The original `public/gallery` is a one-time seed, not the live catalog.

## Cut over an existing server

1. Stop the old bot (freeze approvals). Back up the **server's actual** `public/gallery/` including ignored images and the current `photos.json`, plus `picaudit/` for pending submissions. Do this before pulling either repo, especially if the manifest was marked skip-worktree. Do not replace the server manifest with the sample from a fresh checkout.
2. Install the updated website and `photoclub` bot together. Use Node 24 or newer for both, and ImageMagick for the bot. Run both as the same unprivileged service user or arrange shared write permissions. Set the same absolute `GALLERY_DATA_DIR` in both service configurations, e.g. `/var/lib/latech-photo-gallery`. Provision that directory on the persistent disk. Set `WEBSITE_DIR` on the bot to this website checkout. Without `GALLERY_DATA_DIR`, the default is `~/.local/share/latech-photo-gallery` **of the process user**.
3. Ensure the backed-up server gallery is present under `public/gallery/`. From the website checkout, as the service user with that environment, run `npm run gallery:init`. Check the reported count against the live manifest. Missing files or conflicting IDs abort the import; fix the source and retry. Existing files are never removed. After a successful import, restarting or rerunning does not reread the JSON. Website startup uses the same initializer.
4. Start the updated website, check `/gallery-data` and open a preview and full-size photo. Start the updated bot. Approve one test submission and check the gallery and random-photo command. Never run the JSON-writing bot against the migrated site. If using a reverse proxy, forward `/gallery-data` and `/gallery/` to Express; do not serve those paths directly from the old checkout.

Pending moderation still uses the bot’s private `picaudit/` queue. To place it on persistent storage too, copy the whole existing queue while the bot is stopped, then set the absolute `GALLERY_AUDIT_DIR` on the bot to the copied folder, e.g. `/var/lib/latech-photo-gallery/audit`. Do not start with an empty queue if there are pending submissions.

## Publishing

The bot converts the original and preview in a private staging directory. Only after both files are available does the shared store commit the approved row. Failed conversions leave the submission pending. The website serves only filenames referenced by approved rows; the database and moderation queue have no public URLs. There is no public write endpoint.

## Back up, restore, roll back

For a simple consistent backup, stop **both** services and copy the **entire** `GALLERY_DATA_DIR` (including all SQLite sidecar files and `images/`) and the audit directory to a dated backup on another disk. Restart the services. Do not copy just the SQLite file while the services are writing. Schedule backups in your server’s backup system; the application does not schedule them.

To test a restore, unpack to a new private directory, point `GALLERY_DATA_DIR` there and run `npm run gallery:init`. Verify the count, previews and originals on a separate port before switching both services. Keep the pre-migration backup. To roll back **before new approvals**, stop both services and restore both old code versions, the old manifest, images and queue together. After new approvals, preserve the SQLite store and reconcile those additions first: the old manifest has no record of them.
