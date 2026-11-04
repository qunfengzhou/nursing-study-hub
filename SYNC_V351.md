# Study Hub V3.5.1 — manual progress transfer

## Moving from V3.5

1. Export a full backup on each device before starting the new flow.
2. Close old Study Hub tabs and update every device to V3.5.1. Confirm the Upload progress and Download progress buttons are visible.
3. On the phone with the most complete learning records, connect the intended Google account and choose **Upload progress**. Confirm that this phone starts the new cloud progress flow.
4. On the computer and tablet, connect the same Google account and choose **Download progress**. Review the source device, timestamp and record counts. If the device has local progress, acknowledge replacement before confirming. A full local recovery backup is saved first.
5. Check Mastery, Quiz history, Wrong Answers and continuation positions on each device.

The old V3.2/V3.5 cloud snapshots remain intact. They do not participate in this new flow, so old differences between card definitions or IPA do not become hundreds of progress conflicts. No existing device is automatically selected as authoritative: the first upload must come from the device the owner chooses.

## Everyday use

Download before studying on a different device. Upload when finished. Connecting, returning to the app, going online, or studying never automatically publishes or applies progress. **Check cloud status** only reads the current revision.

Progress includes Mastery records, quiz histories, wrong-answer events, daily completion logs, Flashcards/Quiz continuation and viewed dates, favorites and practice targets. Uploads do not carry card definitions, translations, IPA, question text, source metadata, taxonomy or the retired-card registry. Downloads preserve those local content fields. Progress for IDs absent from local content is retained; install the correct approved content bank separately when necessary.

## Protection and recovery

- A stale or unbound device cannot replace a newer cloud revision. It must download first. If its local progress must be kept, export the full backup before choosing a replacement.
- Download previews are invalidated if local or cloud progress changes. A failed recovery backup or local storage write blocks the replacement.
- Each publication creates an immutable Drive app-data file with parent revision IDs and a SHA-256 checksum. The current version is the sole unreferenced revision, not whichever device clock is latest.
- Simultaneous uploads may both be retained as branches. Downloads pause until the owner explicitly selects which version becomes current. Selection publishes a child referencing both versions; no prior cloud files are overwritten or deleted.
- Full local recovery copies are available under **Recovery copies on this device**. Export one and use **Backup & restore** to recover it. Browser storage removal also removes local recovery copies; exported backups remain independent.
- Progress baselines are separate for each verified Google account. OAuth access tokens remain in memory.

## Validation limits

Automated tests use isolated browser storage and simulated Google authorization/Drive responses, including overlapping uploads and failed storage/network operations. No real Google account records are modified during testing. Installed iOS home-screen icons, device safe-area behavior and actual multi-device Google Drive transfer require device acceptance after deployment. Existing iOS shortcuts may retain a cached icon until re-added.
