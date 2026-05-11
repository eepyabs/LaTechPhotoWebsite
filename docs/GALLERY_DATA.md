# Gallery Data

The live gallery is driven by `public/gallery/photos.json`.

All gallery image files are stored in one asset directory:

```text
public/gallery/images/
```

Each photo has two files:

```text
img_0001_330D.jpg
img_0001_330D_preview.webp
```

The JSON manifest stores the human-facing information:

```json
{
  "id": "img_0001_330D",
  "title": "Image 30",
  "photographer": "Benjamin Eunice",
  "alt": "Image 30 by Benjamin Eunice",
  "image": "/gallery/images/img_0001_330D.jpg",
  "preview": "/gallery/images/img_0001_330D_preview.webp",
  "full": "/gallery/images/img_0001_330D.jpg",
  "submittedAt": "2026-05-11T15:30:00.000Z",
  "approvedAt": "2026-05-11T15:35:00.000Z"
}
```

For a Discord bot upload flow, the bot should:

1. Generate a unique `id`, such as `img_0033_A9F2`.
2. Save the full image as `public/gallery/images/{id}.jpg`.
3. Save a smaller preview as `public/gallery/images/{id}_preview.webp`.
4. Append a metadata object to `public/gallery/photos.json`.
5. Include `submittedAt` and `approvedAt` as ISO timestamp strings when available.

The website reads `/gallery-data`, which normalizes this manifest for the frontend.

The gallery page sorts by `submittedAt`, `approvedAt`, `createdAt`, or `dateAdded`. If none of those fields exist, it falls back to the numeric part of the ID, such as `img_0033_A9F2`.

## Avoiding Git Conflicts

Once the bot is approving photos on the server, `public/gallery/photos.json` becomes runtime data. Since this file is already tracked by Git, `.gitignore` will not stop conflicts by itself.

On the server that runs the bot, run this once:

```bash
git update-index --skip-worktree public/gallery/photos.json
```

That tells Git to leave the server's local gallery manifest alone during normal code pulls.

To undo that later:

```bash
git update-index --no-skip-worktree public/gallery/photos.json
```

New bot-generated gallery image files are ignored by `.gitignore`, so they can stay local to the server unless you intentionally add them to Git.
