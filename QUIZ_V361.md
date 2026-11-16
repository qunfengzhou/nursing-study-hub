# V3.6.1 quiz tools

## Wrong Answers

Browse → Wrong Answers shows current notebook membership by Unit. Each bar uses `wrong questions / all active questions` in that Unit, including ungraded questions in the denominator. Subject and Course scope the overview; Unit and Chapter scope the question list below it. A Unit known only through flashcards displays **No questions**.

Wrong status continues to use the existing quiz event history and legacy fallback. Regular or mock correct answers never remove an entry. A wrong answer resets recovery, and two correct Daily Practice attempts on distinct local dates remove it. Flashcard Mastery and Hard scoring are unchanged.

## Export & Backup

Library retains Google Drive immediately above Export & Backup. The first subsection is Backup & restore; below a divider, Export Wrong Answers downloads all active notebook entries across all courses as Markdown. Each fixed-format JSON record includes full question/options, the key and explanation, Course/Unit/Chapter, source, notebook recovery count and the latest recorded answer where available. Older attempts did not store their selected option and export **Not recorded**.

Names follow `Wrong_Answers_YYYYMMDD_N.md`. Dates and per-day counters are local to this browser. Export does not change question membership or scores and does not contact an AI service.

The file describes how ChatGPT can return an importable quiz JSON. Newly generated questions require `(new)` at the end of their prompt, `isNewPractice: true`, a new ID, hierarchy, a valid zero-based answer key, and source `{kind: "wrong-answer practice", file: "Wrong_Answers_YYYYMMDD_N.md", originalQuestionId: "..."}`. Imported generated practice must not overwrite an original question or reuse an unrelated generated ID. Normal HOLD blocking, import staging and user confirmation remain unchanged; generated practice is not represented as an original textbook question or independently verified content.

## Mock Exams

Practice → Mock Exams offers 25, 50, 75 or 100 questions. Easy is selected by default (orange); Hard is red. An outer outline indicates the current selection.

- Select one or more Courses. Leave all Units unchecked for all Units in those Courses, or select specific Units to limit the bank.
- With Courses only, allocation is balanced across Courses, then their Units. With explicit Units, allocation is balanced across Units, then Chapters. Scarce buckets redistribute their quota; remainders are assigned randomly.
- Easy randomly samples the eligible bank. Hard samples wrong answers first, then fills the remaining quota from nonwrong answers. Wrong priority takes precedence over equal distribution. Question IDs never repeat within an exam.
- Questions without a valid answer key or accepted source are excluded. If the bank is too small, the app reports its actual size and asks before creating the shorter exam.
- Every exam snapshots its question content, source, key, order and hierarchy. Later bank edits do not change a historical exam. The first answer to each question is locked and saved immediately; position is saved on navigation. Save & close exits without losing answers. Reopen a saved Quiz to continue.
- Finish requires every question to be answered; completed accuracy is correct answers divided by the actual exam size. Wrong answers enter the notebook immediately; correct answers do not clear it.
- History is hidden until Courses are selected and then includes exams involving any selected Course, newest first. The wrong-count button shows original snapshot questions with the selected and correct answers, explanation, and Course/Unit/Chapter. Zero-wrong buttons are disabled.

The history layout has no table header. Phone records use two rows, retaining the bottom navigation; the wrong-answer dialog scrolls and keeps its close control visible.

## Persistence and compatibility

`settings.mockExams = {version: 1, exams: {[examId]: exam}}` extends the existing V3 local state, retaining its storage key and all earlier fields. Each exam contains ID, per-course display number, timestamps, selection, requested count, question snapshots, answers, position, and nullable completion time. Quiz events additionally accept `mode: "mock"` and new attempts store `selectedIndex`.

Full backups include the new setting automatically. Restore validates new histories before committing. Drive's fixed progress-settings allowlist includes `mockExams`; it is not library content. Manual downloads retain local-only exams; matching IDs use the selected cloud progress. Older cloud progress that has no `mockExams` field keeps the local exam history. Other learning progress still follows the existing explicit cloud-authoritative download and recovery-copy workflow.

Update all devices before transferring new mock histories: old clients reject unsupported progress fields instead of silently discarding them. Upload/download remain explicit. Connection alone transfers nothing. No account credentials or course materials are embedded in this repository.

Mock writes and backup restores commit local storage before reporting success. On storage failure, current data remains intact. Another tab's storage change blocks further mock writes until reload. The Unit Replacement drop area shares the existing approved-bank preview; file changes invalidate in-flight previews. It never replaces content merely on drop.

## Validation

Run `node tests/quiz-tools.test.cjs` (Node built-ins only). Its 23 checks use synthetic data and cover selection, notebook transitions, snapshot immutability, persistence/validation, actual progress-application logic, old-cloud retention, rollback on quota errors, HOLD imports, generated-practice provenance, replacement-preview races, escaping and unchanged Hard scoring.

Browser checks used an isolated synthetic 32-question bank with 8 legacy wrong answers: created a 25-question Hard exam, answered, saved, reloaded, resumed, finished at 24/25 (96%), checked snapshot wrong-answer dialogs, and downloaded/parsed a Markdown file containing all 9 current wrong answers. Desktop and a 390px iframe viewport exercised the responsive layouts. These checks did not connect the owner's Google account or exercise a physical iPhone/iPad.
