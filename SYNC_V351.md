# Study Hub — Manual Drive synchronization and recovery (V3.6.2)

## Recover an empty installation

Open Library, connect the same Google account, and choose **Download progress**. This action now restores missing flashcards and questions as well as learning records.

- New uploads include a checksummed library recovery copy alongside the progress snapshot.
- If the current cloud version was created by V3.5.1 and contains only progress, an empty or incomplete device can select a historical Drive library backup. The preview shows its timestamp and card/question counts and requires acknowledgement that older backups may contain older text or IPA. It does not certify the contents as APPROVED.
- When current cloud progress exists, keep that newer progress while restoring content from the selected old library backup. If only a historical full backup exists, the preview explicitly offers that backup's own progress and library.
- If no usable cloud content copy exists, upload once from a device that still contains the library, then download on the empty device. The app does not invent missing cards or quiz questions.

A full local recovery copy is saved before applying any download. Review the preview and acknowledge replacement if this device has unuploaded learning records. Existing cloud files are not overwritten or deleted.

## How existing libraries are protected

Downloads add missing card/question IDs and keep matching local definitions, translations, IPA, question text and source metadata. Known retired IDs stay inactive; retirement registers grow by union. The recovery flow does not import generated questions, change approval labels, or bypass the normal HOLD/import approval checks.

Upload progress publishes the current learning records plus a content recovery copy. A completely empty library cannot be uploaded over the cloud version. Content-only changes can create a new revision even when learning progress has not changed. Other devices must download a newer revision before uploading.

## Everyday use

Update all devices to V3.6.2 before transferring progress with this release. Download before studying on a different device; upload when finished. Connect and Check cloud status remain read-only. No transfer happens automatically.

The transfer includes Mastery, quiz history, Wrong Answers events, daily completion logs, browsing dates, continuation, favorites and practice targets. Progress for absent or retired content IDs is preserved as history. A download does not automatically replace a local matching card with an older cloud definition.

## Recovery and concurrency

Full local recovery copies can be exported under **Recovery copies on this device**, then restored through Backup & restore. Clearing website storage removes local copies, so keep independent exported backups.

Publications use immutable Drive files, parent revision IDs and checksums. Concurrent uploads remain separate versions until explicitly selected. Download previews are invalidated when local progress, local content, or cloud revisions change. Failed recovery storage or a failed local write blocks replacement. Baselines are account-specific; access tokens stay in memory.

Automated tests use isolated browser storage and simulated Google authorization/Drive HTTP. Actual user-cloud availability and real-device restoration still require acceptance after deployment. No production learning records are changed by the tests.

## Move synchronization to another Google account

This changes the account used for new cloud snapshots; it does not move the old account's cloud files or delete them.

1. Pause studying on other devices. Confirm the source device contains the progress you want to keep. Export a full JSON backup from every device, especially the most complete device, under Library → Export & Backup → Backup & restore → Export backup.
2. On the source device, disconnect the old account. Local data remains on the device. Connect Google Drive again, explicitly choose the new account, and verify the displayed account before uploading.
3. Keep the existing OAuth Client ID when using the same Google Cloud application. It identifies the application, not the account storing learning data. If the app is in Testing, its administrator may need to add the new account under Google Auth Platform → Audience → Test users. Internal-only apps and Workspace administrator restrictions require different access changes. If retiring the old Cloud project, preserve/transfer its management or configure a replacement application first.
4. Choose Upload progress and wait for explicit success. This reads the current device state and uploads learning records plus a checksummed library recovery copy. The exported JSON backup is an independent recovery file, not a file you must upload through this button. Use Restore backup first only if you need to recover the file's contents to a device.
5. If the new account already has different current cloud progress, stale-upload protection may require downloading. Do not blindly replace the most complete local progress; keep its backup and resolve which version should be authoritative first.
6. On other devices, disconnect the old account, connect the new account, then choose Download progress. Review the source and preview. Retain each device's backup before confirming replacement of unuploaded progress. Do not upload a stale device first.
7. Compare library totals, representative Mastery values, wrong-answer membership and mock-exam history/resume positions. Matching local card text is preserved on download, so switching accounts does not force definitions or IPA to become identical across devices.

Full backups include library, learning records and settings. Drive progress includes mock-exam history since V3.6.1. Downloads retain independent local-only mock exams and use cloud progress for matching exam IDs. This process does not migrate every old cloud snapshot or original course PDF/Markdown file.

## Old-account retention and storage

Study Hub stores immutable cloud revisions and library recovery data in its hidden Drive appDataFolder. Disconnecting or changing accounts does not delete old snapshots. Hidden app data counts toward the old account's storage; no exact size is reported without inspecting it.

After verifying the new account and retaining backups, manage old data under the old account's Google Drive settings → Manage apps → the application's Options → Delete hidden app data. The listed app name is the OAuth application's configured name and may differ from Study Hub; check Google Auth Platform → Branding → App name in the existing Cloud project. Deleting hidden data removes that application's old cloud recovery history and is optional for switching accounts.

V3.6.2 documents existing behavior. It does not add automatic account migration or cloud deletion, and does not certify live account migration as tested.
