# Pending insert — staged questions not yet live

Everything in this folder is a DB-ready rows array (`module_id`, `inquiry_id`,
`type`, `prompt`, `image` [already a hosted Supabase Storage URL, or `""`],
`options`/`bank`/`pairs`/`items`, `answer`, `hint`) — the exact shape
`insert_hsc_rows.cjs` inserts straight into the `questions` table.

**Images are already uploaded** to the `question-images` Supabase Storage
bucket for every file here (that step is safe/invisible — nothing shows to
students until a `questions` row actually references it). Nothing in this
folder has been inserted into `questions` yet, so none of it is live.

## Current contents (as of 2026-08-27)

| File | Count | Source |
|---|---|---|
| `2019-2021-2022-2024-2025-hsc-mcq.json` | 83 | Generated on the main computer via `tools/hsc_extractor.py` + `workflow_hsc_pipeline.js` (natural-fit format conversion, no fixed quota) |
| `2019-hsc.json` .. `2025-hsc.json` (7 files) | 140 (20 each) | Generated on a laptop (offline), house rules in `source_notes/RULES.md` (fixed 10-MCQ/10-converted quota per paper). User has personally proofed all 140. |

**Total staged: 223 questions**, covering all of Modules 5–8 across HSC papers
2019, 2020, 2021, 2022, 2023, 2024, 2025. Overlap between the two sources on
the same exam years is intentional, not a bug — this app treats repeated
practice on the same content from different angles as a feature (see
`source_notes/` and project memory for why).

`source_notes/` holds the laptop batch's per-question rationale
(`_triage/<year>-hsc.md`), its house rules (`RULES.md`), and its own README,
preserved here since the original working folder was named "to be
transferred" and may not persist.

## Adding more (the ~800 questions still coming)

Any new batch — from either machine, either pipeline — should land here as one
more `<name>.json` file in this exact rows shape before being considered
"staged." Two ways to get there:

- **From a `tools/insert_questions.cjs`-shaped file** (fields: `source`,
  `inquiry_id`, `type`, `prompt`, `options`/`bank`/`pairs`/`items`, `answer`,
  `image_filename?`, images in a local folder): run
  ```
  node --env-file=.env tools/stage_batch.cjs <questions.json> <imageFolder> <examSlug> <name>
  ```
  This uploads the images and writes `tools/pending_insert/<name>.json` —
  nothing goes live.
- **From the HSC exam pipeline** (`hsc_extractor.py` + `workflow_hsc_pipeline.js`
  + `upload_hsc_images.cjs`): point `upload_hsc_images.cjs`'s output path at a
  new file directly inside this folder.

## Pushing everything live (when ready)

One command per file, in any order:
```bash
for f in tools/pending_insert/*.json; do
  node --env-file=.env tools/insert_hsc_rows.cjs "$f"
done
```
This is the only step that actually writes to the `questions` table — goes
live to students immediately (no draft/active gate in this app). Confirm with
the user before running it; per project memory, the plan is to hold everything
here until the full ~800-question batch is complete and reviewed together.
