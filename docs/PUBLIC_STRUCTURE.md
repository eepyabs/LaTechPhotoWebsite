# Public Folder Structure

The `public` folder is organized by purpose:

```text
public/
  assets/
    fav/      favicon and web app manifest assets
    logos/    club logo variants
    qr/       Discord join QR code
    team/     officer and member profile images
  archive/   old source image folders kept for reference
  css/       shared stylesheets
  data/      JSON data used by pages
  gallery/   live gallery manifest and uniquely named gallery images
  js/        browser scripts
```

The live gallery should use `public/gallery/photos.json` and `public/gallery/images`.

The `archive` folder is not used by the active gallery UI. It exists so old files are preserved while the new manifest-driven upload flow is being developed.
