# Nursing Study Hub V3.1 — Offline PWA

This package is a static, no-API web app. This PUBLIC-SAFE build intentionally excludes bundled course cards and quiz questions. Export a backup from your personal V3 app and restore it once on the hosted site.

Host these files **together** at the root of a GitHub Pages repository. Rename or keep `index.html` as is.

## Publish via GitHub Pages
1. Create a NEW PUBLIC repository (e.g. `nursing-study-hub`) in GitHub; avoid using unrelated repositories.
2. Upload `index.html`, `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png` from this ZIP to the repo root.
3. Repository Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save.
4. Open the resulting `https://USERNAME.github.io/nursing-study-hub/` on the phone while online, and wait for the app to load before going offline.
5. iPhone: open in Safari → Share → Add to Home Screen. Android: browser menu → Install app / Add to Home screen.

## Important
- The HTML by itself is not a PWA. Service workers require HTTPS (GitHub Pages supplies it) or localhost.
- Offline support requires the first successful load and cache installation. Verify in airplane mode before relying on it.
- Data stays local to each browser/install. Different browsers, origins, devices, or changing from file:// to HTTPS **do not automatically share progress**.
- On your original V3: Export backup. On V3.1 hosted web page: Restore backup. Retain an independent copy of the backup file.
- Do not commit private notes, personal progress, or proprietary course materials to a public repository.
- In-app data are stored using browser storage. OS/browser cache clearing may remove them. Keep regular backups.
- Future updates should bump the cache key in sw.js and preserve the backup import schema. Background updates to the app shell are not the same as backups or data synchronization.
