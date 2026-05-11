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
  "full": "/gallery/images/img_0001_330D.jpg"
}
```

For a Discord bot upload flow, the bot should:

1. Generate a unique `id`, such as `img_0033_A9F2`.
2. Save the full image as `public/gallery/images/{id}.jpg`.
3. Save a smaller preview as `public/gallery/images/{id}_preview.webp`.
4. Append a metadata object to `public/gallery/photos.json`.

The website reads `/gallery-data`, which normalizes this manifest for the frontend.
