# Exam -> question bank pipeline

Turns one "HTML Exams" export (PDF-to-HTML, with an `& Solutions` folder of
extracted images alongside it) into confirmed, reviewable questions in
Supabase. Validated against Girraween 2020 (reproduced the same 15 MCQ answers
and 12 extended-response marking criteria as the original hand-built pass).

## Steps

1. **Extract chunks** (mechanical, no reading required):
   ```
   python tools/exam_extractor.py "<path to exam .html>" "<out chunks.json>"
   ```
   Produces a JSON list of raw text chunks (MCQ section split into a few
   even pieces, one chunk per extended-response question paired with its
   marking-criteria/solutions text), each tagged with the image filenames it
   references. Skim the printed chunk sizes -- a chunk many times larger
   than its neighbours usually means a boundary-detection edge case (see
   comments in the script) and is worth a quick look before spending tokens
   on it.

2. **Draft + verify** via Workflow, passing the chunks as `args`:
   ```js
   Workflow({
     scriptPath: 'tools/workflow_exam_pipeline.js',
     args: { examFolder: '<same path as step 1, minus .html>', chunks: <the chunks array from step 1> },
   })
   ```
   Each chunk gets its own drafting agent (reads the raw text + views images
   itself, converts straight to platform questions -- no manual dossier
   step) and its own verify agent (adversarially rechecks against the same
   raw chunk). Returns `{ confirmed: [...], skipped: [...] }`.

3. **Insert into Supabase** (goes live immediately -- there's no draft/active
   state, so review the preview from step 4 before running this):
   ```
   node tools/insert_questions.cjs <confirmed.json> "<examFolder>" <exam-slug>
   ```
   Uploads each unique referenced image to the `question-images` storage
   bucket once, then bulk-inserts all confirmed questions.

4. **Build a preview** to sanity-check before inserting:
   ```
   python tools/build_preview.py "<examFolder>" <confirmed.json> <out.html> "<Display Title>"
   ```
   Self-contained HTML (images embedded as base64), grouped by module/inquiry
   question, correct answers highlighted, conversion notes shown.

## HSC past-paper pipeline (Year 12, MC-only)

Separate pipeline for the official NESA "HSC Examinations" past papers (different
format from trial exams above: exam and marking-guidelines are two separate
files, no repeated colour-highlighted solutions copy, and only the 20
multiple-choice questions are converted -- extended response is skipped).

1. **Extract** each year's Section I text + official answer key + syllabus
   mapping grid:
   ```
   python tools/hsc_extractor.py "<exam.html>" "<answers.html>" <year-folder-name> "tools/hsc_extracted/hsc_<year>.json"
   ```
   Prints any mapping-grid content it couldn't auto-resolve to a syllabus
   inquiry (genuinely dual-module questions per NESA's own grid, or wording
   variants not yet in `ALIASES`) -- these get passed through as `candidates`
   for the drafting agent to judge from the actual question content.

2. **Draft + verify** via Workflow, one exam per pipeline item:
   ```js
   Workflow({
     scriptPath: 'tools/workflow_hsc_pipeline.js',
     args: [{ source_file, exam_root, exam_slug, image_folder, mapping }, ...],
   })
   ```
   Returns `{ confirmed, needsReview, skipped }`. Trusts the official
   answer_key/mapping as ground truth rather than inferring from colour
   (HSC exports have no highlighted answers at all). Explicitly told to skip
   copyright-redacted diagrams and multi-image-option questions the platform
   can't represent, rather than guess.

3. **Upload images + build final rows** (uploads to the same `question-images`
   bucket, but does NOT touch the `questions` table yet):
   ```
   node --env-file=.env tools/upload_hsc_images.cjs tools/hsc_confirmed.json tools/hsc_ready_to_insert.json
   ```

4. **Preview**:
   ```
   python tools/build_hsc_preview.py tools/hsc_confirmed.json tools/hsc_ready_to_insert.json tools/hsc_preview.html
   ```

5. **Insert** (goes live immediately -- review the preview first):
   ```
   node --env-file=.env tools/insert_hsc_rows.cjs tools/hsc_ready_to_insert.json
   ```

All `tools/hsc_*` data files and `tools/hsc_extracted/` are gitignored
(copyrighted exam text) -- only the five scripts above are tracked.

## Notes for the next exam

- Different schools highlight correct answers differently (colour, bold,
  underline) -- `exam_extractor.py` auto-detects any CSS class/tag with a
  non-black `color` and preserves it as `**{color:#RRGGBB}text**` in the
  transcript, so the drafting agent infers the convention from context
  rather than us hardcoding one school's scheme.
- Exams without a "& Solutions" copy have no marking criteria to check
  against -- the drafter will still produce questions (marked
  `confidence: "low"`) but per the standing decision, these exams are
  deprioritised for now.
- If `exam_extractor.py`'s chunk sizes look off for a new exam's layout,
  the boundary-detection logic (search for "End of Section I", "Extra page",
  "Question N (") is the place to adjust -- it's brittle by nature since it's
  keying off literal phrases that vary between schools.
