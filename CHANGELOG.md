# Study Hub Version History

## V1.0 — Initial Release

- Launched the Study Hub dashboard on GitHub Pages.
- Added basic flashcards and quiz practice.
- Supported Microbiology and Pathophysiology.

## V2.0 — Library Management

- Added JSON flashcard and quiz imports.
- Introduced file validation and import previews.
- Organized learning materials by course, unit, and chapter.

## V3.0 — Daily Review

- Introduced Daily Review and the 0–5 Mastery system.
- Added Great, Good, and Hard ratings.
- Added review history and Undo.

## V3.1 — Offline Learning

- Added Progressive Web App (PWA) support.
- Enabled offline studying and home-screen installation.
- Improved mobile compatibility.

## V3.2 — Cloud Synchronization

- Added Google Drive synchronization.
- Enabled cross-device learning progress.
- Introduced conflict detection and data protection.

## V3.3 — Flashcard Improvements

- Added American IPA display and pronunciation playback.
- Introduced Safe Unit Replacement.
- Preserved learning progress when replacing flashcards.

## V3.3.1 — Import & Sync Fixes

- Blocked unapproved flashcard imports.
- Prevented retired cards from reappearing after synchronization.
- Improved conflict handling across devices.

*V3.3.1 is a descriptive label for intermediate development work, not a separately confirmed release.*

## V3.4 — Learning Experience Update

- Added Subjects and a four-level organization system.
- Introduced Vocabulary Library, Learn New, and Free Review.
- Added bidirectional Daily Review, Favorites, and Progress.
- Improved Library organization and responsive layouts.

## V3.4.1 — Production Fixes

- Removed unwanted default subject categories.
- Added cleanup for historical QA Sandbox data.
- Improved synchronization safeguards and refreshed PWA caching.

*V3.4.1 labels the post-release fixes; it was not separately published under that version number.*

## V3.4 — Additional Deployed Updates

- Displayed `IPA Currently Unavailable` when a card has no IPA.
- Added validation support for the user-accepted Microbiology Unit 1 pronunciation policy, while continuing to block unapproved or HOLD imports.
- Added Free Review continuation with saved filters, search text, and card position.
- Added `Last time viewed: MM/DD/YYYY`, recorded when the answer face is revealed.
- Added an explicit Next button, a Not viewed this round filter, and a new-round action that preserves historical viewed dates.
- Included browsing metadata in backups and cross-device synchronization without changing Mastery through browsing alone.

*The application remained labeled V3.4 during these updates. Pronunciation-policy support did not itself replace production word-bank data.*

**Implementation:** [PR #1](https://github.com/qunfengzhou/nursing-study-hub/pull/1), [PR #2](https://github.com/qunfengzhou/nursing-study-hub/pull/2).

## V3.5 — Navigation & Daily Practice

- Added a full-page home with Browse, Practice, and Library entry points, continuation shortcuts, study totals, and vector illustrations.
- Hid navigation on the home page; added grouped navigation and a Home button on subpages.
- Kept a desktop sidebar and introduced grouped top menus on mobile. Library opens directly without a dropdown.
- Standardized Library panel spacing and moved Google Drive Sync directly above Backup & restore.
- Renamed Free Review to Flashcards, retaining ratings, viewed dates, and continuation.
- Removed Learn New and Review Queue pages while preserving learning records.
- Introduced Daily Practice with separate Flashcards and Quiz options and batch targets.
- Limited Daily Practice flashcards to words with `0 < Mastery < 5`; did not fill batches with unlearned or full-score words.
- Added Quiz continuation, last-practiced dates, a searchable unified Quiz Bank, and a separately highlighted Wrong Answers entry.
- Restricted Daily Practice Quiz to wrong-answer entries. Two consecutive correct Daily Practice attempts on different days remove an entry; a wrong answer resets the count. Ordinary Quiz correct answers do not clear it.
- Automatically loaded the next eligible batch after completion, excluding items already completed in Daily Practice that day.
- Preserved existing progress, quiz sources, retirement protection, and import approval rules.

**Implementation:** [PR #3](https://github.com/qunfengzhou/nursing-study-hub/pull/3).

## V3.5.1 — Manual Progress Transfer & Mobile Navigation

- Replaced default automatic synchronization with explicit Upload progress and Download progress actions.
- Made Connect and Check cloud status read-only; studying or returning online no longer automatically transfers records.
- Added source-device names, cloud update times, progress counts, and local unpublished-progress status.
- Blocked stale-device uploads and required confirmation before replacing unuploaded local progress.
- Added full local recovery copies before uploads or downloads, with recovery-backup export.
- Preserved immutable cloud revisions and introduced explicit version selection for concurrent uploads.
- Transferred Mastery, quiz history, wrong-answer events, daily completions, continuation, viewed dates, favorites, and practice targets.
- Moved mobile subpage navigation to a fixed bottom bar with upward-opening menus and safe-area spacing. Desktop and wide tablet layouts retained the sidebar.
- Replaced the application icon with stacked flashcards and flip arrows; updated the favicon, home-screen assets, and offline cache.

*This version transferred progress without library content. An empty installation could still show zero flashcards after downloading progress; V3.5.2 addresses this limitation. Old full-dataset cloud snapshots were retained.*

**Implementation:** [PR #4](https://github.com/qunfengzhou/nursing-study-hub/pull/4).

## V3.5.2 — Combined Library & Progress Recovery

- Combined missing-library restoration with Download progress so an empty installation can recover cards, questions, and learning records together.
- Added a checksummed library recovery copy to new uploads.
- Added explicit historical-library backup selection for existing progress-only cloud revisions, showing backup dates, card/question counts, and IPA coverage.
- Kept current cloud progress authoritative when recovering content from an older backup. If no current revision exists, the selected historical backup can restore its own content and progress.
- Added missing card/question IDs while retaining matching local explanations, translations, IPA, question text, and sources.
- Preserved historical learning records and unioned retirement registers to prevent known retired cards from returning.
- Blocked empty-library uploads and reported missing cloud content explicitly instead of presenting an empty restoration as successful.
- Rechecked local content and progress before applying downloads, retained pre-change recovery backups, and preserved normal HOLD/APPROVED import guards.

*Historical backup restoration does not certify a word bank as APPROVED. Recovery depends on an available cloud library copy; otherwise, a device that still has the library must upload one first.*

**Implementation:** [PR #5](https://github.com/qunfengzhou/nursing-study-hub/pull/5).

## V3.5.3 — Dependent Filters & Desktop Home Button

- Moved the desktop Home button below the app title as a labeled capsule, without changing touch-tablet or phone navigation.
- Disabled Course, Unit and Chapter options until their parent categories are selected.
- Automatically selected the first valid Course, Unit and Chapter when choosing a Subject, and refreshed descendants when switching courses or units.
- Scoped choices to the selected hierarchy, sorted numbered units/chapters naturally, and normalized inconsistent saved filters while retaining valid continuation positions.
- Preserved global views through All subjects and parent-level All options; unselected descendant levels remain disabled.

## V3.5.4 — Reviewed Vocabulary Imports

- Added reusable approval validation for source-reviewed IPA banks across units while retaining the existing Unit 1 approval path.
- Added explicit per-card exceptions for user-authorized IPA from uploaded vocabulary lists, preserving original IPA, source filenames, line numbers and source-file hashes without labeling those entries dictionary-verified.
- Continued blocking HOLD datasets, missing IPA, inconsistent manifests and untraceable pronunciation records.
- Showed pronunciation-review summaries and disclosed uploaded-source IPA exceptions in import and replacement previews.
- Refreshed the offline cache and release labels. Preserved normal ID-based import merging, historical learning records, retirement protection and Google Drive behavior.

*This release changes program validation only; course materials and production learning data are not included or automatically imported.*

## V3.6.1 — Wrong Answer Statistics & Mock Exams

- Added Unit-level horizontal wrong-answer percentage bars using active wrong-notebook membership, with explicit empty-unit states.
- Moved Wrong Answers into Browse and added Mock Exams under Practice; arranged home entry cards in even grids and highlighted Cards to Review in pale orange and Wrong Answers in pale red.
- Added Library → Export & Backup with a separate Markdown export of all current wrong answers, full answer keys, explanations, hierarchy and provenance. Filenames use the device's local date and daily export counter: `Wrong_Answers_YYYYMMDD_N.md`.
- Allowed explicitly labeled `(new)` practice questions linked to a Wrong Answers export, using new unique IDs without overwriting original questions. Existing HOLD and approved flashcard-bank checks remain in force.
- Added single-file drag-and-drop to Unit Replacement, retaining approval validation, preview, retirement safeguards and two explicit confirmations. Invalidated stale asynchronous previews when changing files.
- Added 25/50/75/100-question Easy and Hard mock exams, course/unit selection, balanced allocation, quota redistribution and explicit confirmation when the available bank is smaller than requested.
- Made Hard prioritize current wrong answers, then fill from other questions without duplicates. Easy samples the eligible bank randomly with balanced Course/Unit or Unit/Chapter quotas.
- Saved question snapshots, fixed order, first answers and resume position immediately. Added course-filtered newest-first history, completed accuracy and a clickable historical wrong-answer dialog with original options, selected/correct answers and Course/Unit/Chapter.
- Sent mock mistakes to the existing wrong notebook; correct mock answers do not remove entries. Flashcard Hard ratings and the two-distinct-Daily-Practice-days removal rule remain unchanged.
- Included mock exams in full backups and manual Drive progress transfer. Downloads use cloud versions for matching exam IDs and retain independent local-only exams, including when downloading an older cloud revision with no mock history.
- Added validation and atomic storage writes so invalid mock histories or storage failures do not replace current study data. Refused stale mock writes after another tab changes local storage.
- Refreshed offline shell caching to include quiz tools, retaining the existing update activation policy.

**Validation:** 23 synthetic regression checks, browser import/export, full 25-question completion and reload/resume, desktop and 390px responsive layouts. Live Google account transfer and physical iOS behavior were not exercised.

## V3.6.2 — Version Alignment & Account Transfer Guide

- Updated application version labels, asset query versions and the offline shell cache identifier to V3.6.2.
- Documented switching Google accounts: back up the most complete device, reconnect to the new account, upload there, then download on other devices.
- Clarified that Export backup creates a local recovery file, while Upload progress publishes current device progress plus a library recovery copy.
- Clarified OAuth Client ID reuse with the same Cloud application, access prerequisites, and the distinction between changing Drive accounts and retiring the Cloud project.
- Documented old-account hidden app data, storage usage, identifying the configured app name, and optional cleanup after verifying migration and retaining backups.
- Preserved synchronization logic, storage keys, data schemas, learning rules, import approval checks and all V3.6.1 functionality. No automatic migration or cloud deletion feature was added.

**Validation:** Connector-based comparison confirmed executable inline application code is unchanged; synchronization and quiz tool files were not modified. Asset query versions match the shell cache list. Runtime/browser tests and live Google-account migration were not repeated for this version-and-documentation maintenance release.

---

**Current Version:** V3.6.2

**Validation note:** Recent deployments were verified against their committed files and tested in isolated browser scenarios. Simulated Drive tests do not establish successful restoration of the user's actual account or acceptance on every physical device.

**Current synchronization and recovery guide:** [SYNC_V351.md](SYNC_V351.md).



