# Nursing Study Hub V3.2 — Offline PWA + Google Drive Sync

A public-safe static site for GitHub Pages. It **does not contain the user's course materials, answer keys, or study progress**. Import an existing V3 backup into the app's Library to get started.

## Deploy

Upload these files to the ROOT of the existing public GitHub Pages repository (`main` branch):

- `index.html`
- `sync.js` (new)
- `sw.js` (updated, now caches sync.js)
- `manifest.webmanifest`
- `icon-192.png`, `icon-512.png`
- `README.md`

Site: `https://qunfengzhou.github.io/nursing-study-hub/` (if GitHub Pages remains enabled).

## Set up Google OAuth — owner action required

1. Open https://console.cloud.google.com/ and create/select a project. Set an appropriate project name, e.g. `Nursing Study Hub Sync`.
2. Under **APIs & Services → Library**, enable **Google Drive API**.
3. Configure **Google Auth Platform / OAuth consent screen**. For personal use, choose the appropriate external audience; if in testing mode, add each Google account to **Test users**. Complete any mandatory app details. Do not publish/verify publicly unless needed for your use case.
4. Create an **OAuth Client ID** of type **Web application**. Under **Authorized JavaScript origins**, add EXACTLY:
   `https://qunfengzhou.github.io`
   (no repository path, no trailing slash). This flow is a popup/token flow and does not need a redirect URI.
5. Copy ONLY the public **Client ID** (ends with `.apps.googleusercontent.com`). **Do not enter a Client Secret**. In the website, go to **Library → Google Drive Sync**, paste the Client ID and click **Connect Google Drive**. Repeat on the other device using the **same Client ID and same Google account**.
6. On the original device, export and retain a JSON backup before connecting. On a device with no content, sign in first to pull the existing data. If both devices have independently changed the same card, the app pauses to request explicit conflict choices.

Google Drive data are stored in the account's hidden **appDataFolder** under `drive.appdata` OAuth scope. This is not the regular Drive folder; its contents are not public and do not enter your GitHub repository. Basic `openid email` scopes are also requested to detect account switching. The public OAuth Client ID is not a password; the client secret is not needed and must never go into website source code.

**Important:** The app's Google Drive OAuth token remains **in memory**, not persisted in localStorage. When authorization expires or the app is restarted, the user may have to click Connect again. **Automatic sync is active while authorized and online** (periodic check + delayed upload after edits). Offline edits remain in the browser and can be synced after reconnection and authorization. iOS background execution may suspend sync.

## Conflict protection and limitations

- Each cloud upload creates a **new immutable snapshot**; there are no remote overwrite/update/delete calls.
- An identical card/question/progress record is deduplicated by ID. Unrelated updates merge automatically.
- Conflicting changes to the **same record** require an explicit per-record choice. The app does **not** automatically add review counts when two devices independently review the same card; it asks which record to retain, so there is no silent data overwrite. Alternative versions remain recoverable in Drive snapshots.
- The entire cloud history is **not garbage-collected** in V3.2 and consumes Google Drive storage/quota. Review storage usage over time. It is not guaranteed to cost $0 if free quotas are exceeded.
- An existing V3/V3.1 backup can be restored first; do not restore an old backup on top of newer progress without separately exporting a backup from that device.
- This version does not merge historical review events with true event sourcing; that is a future enhancement if you need both devices to review the same cards while offline and automatically retain **both** rating histories without manual conflict selection.
- Keep separate JSON backups even when cloud sync succeeds. Do not consider local browser storage or the appDataFolder an infallible backup.

## Offline use

On first visit, load the site while online to install the service worker. Flashcards, quiz, daily review, local imports and backup continue to work offline. Google login and Drive sync require internet. Test airplane mode on each device after loading. Refreshing the GitHub Pages deployment does not delete local browser storage, but clearing browser site data does.

## Status

- JavaScript syntax checked and deterministic merge tests passed.
- Google authorization, live Drive API upload/list operations, and multi-device iOS/Android end-to-end sync are **not yet verified**: they require the owner's OAuth Client ID and consent, and live browser tests.
