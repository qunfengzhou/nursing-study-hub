# Study Hub V3.5.2 — Download library and progress together

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

Update all devices to V3.5.2 before using the corrected flow. Download before studying on a different device; upload when finished. Connect and Check cloud status remain read-only. No transfer happens automatically.

The transfer includes Mastery, quiz history, Wrong Answers events, daily completion logs, browsing dates, continuation, favorites and practice targets. Progress for absent or retired content IDs is preserved as history. A download does not automatically replace a local matching card with an older cloud definition.

## Recovery and concurrency

Full local recovery copies can be exported under **Recovery copies on this device**, then restored through Backup & restore. Clearing website storage removes local copies, so keep independent exported backups.

Publications use immutable Drive files, parent revision IDs and checksums. Concurrent uploads remain separate versions until explicitly selected. Download previews are invalidated when local progress, local content, or cloud revisions change. Failed recovery storage or a failed local write blocks replacement. Baselines are account-specific; access tokens stay in memory.

Automated tests use isolated browser storage and simulated Google authorization/Drive HTTP. Actual user-cloud availability and real-device restoration still require acceptance after deployment. No production learning records are changed by the tests.
