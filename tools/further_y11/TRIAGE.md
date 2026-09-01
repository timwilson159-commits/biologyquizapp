# Further Year 11 Papers — triage notes

Source: `HTML Exams/Year 12 Exams/Further Year 11 Papers/` — 3 current-syllabus "Year 11
Yearly" trial exam papers (Section I multiple-choice + Section II extended response),
each with its own Marking Guidelines HTML (Section II has official per-question
syllabus mapping down to inquiry-question level for Papers 2 & 3, module-level only
for Paper 1) and a combined `Multiple choice marking.csv` answer key. Images in the
shared `Extracted Images/` folder.

**Total: 97 questions staged, nothing pushed to the site yet.** 56 Section I questions
kept (56/60, 93%) + 41 Section II conversions. Preview: `preview.html` in this folder
(sent to you separately — it embeds all images, ~8MB, open it locally).

## Two bugs found and fixed after the first draft (2026-09-02)

1. **Questions referencing an image that wasn't attached.** Three questions referred
   back to a previous question's experiment/graph ("...above") without restating the
   context or carrying the image forward — including the amylase/dialysis-tubing
   variables question you caught. Audited every prompt for image-dependent language
   (explicit — "diagram", "graph", "figure" — and implicit — "above", "this
   experiment") and fixed all three by rewriting them to restate the necessary
   context inline, so each question now stands alone. None of the three actually
   needed an image once reworded — the relevant facts were already available in text.
2. **Everything was multiple-choice.** The first draft used MC for all 97 questions,
   which isn't the house rule (max ~50% MC, rest a mix of word-bank/matching/ordering).
   Reworked the whole batch: **48 multiple-choice (49%), 33 word-bank, 12 matching
   (drag-drop), 4 ordering.** Conversions used natural fits — matching for
   "which row correctly identifies..." table questions, word-bank for single-term
   recall, ordering for sequences (cell hierarchy, enzyme induced-fit steps, water
   movement up the xylem).

## Section I (multiple-choice) — 4 dropped, all flagged for a reason

Every MC question was checked against its answer key, and every diagram/graph/table
question was verified against the actual image before being kept. Two things worth
knowing about that process:

- **Paper 1 numbering false alarm (caught before finalising):** I initially miscounted
  Paper 1's question order and nearly dropped the "identify the highlighted structure"
  question (thought the key said "Dermal Tissue" for a clearly-vascular-bundle image).
  Recounted carefully — it's actually a different question number, and the real answer
  (Vascular Bundle) matches the image correctly. Similarly, the "Black nerite mollusc
  adaptation" question in Paper 3 turned out fine once recounted (Behavioural, not the
  "Physical" non-category I'd first landed on). Flagging this so you know the numbering
  was double-checked, not assumed.
- **4 genuine drops:**
  - **Paper 2 Q2** ("highest level of organisation able to perform all activities
    required for life") — key says "the organ", but the standard, textbook-correct
    answer is "the cell" (the basic self-sufficient unit of life). Dropped rather than
    teach what looks like an error.
  - **Paper 2 Q13** (mining site restoration strategy) — options A and C are identical
    text ("removing fences quickly"), and the key points at that duplicated option over
    a much more defensible answer ("regular testing of waterways for contamination").
    Dropped as a flawed question.
  - **Paper 3 Q11** (what holds the lipid bilayer together) — none of the four options
    describe the actual mechanism (hydrophobic interactions between the fatty acid
    tails); the key's answer ("electrostatic attraction between phosphate groups")
    isn't accurate either. Dropped as scientifically imprecise.
  - **Paper 3 Q16** ("what ensures the validity of secondary-source research") — a
    generic Working Scientifically skills question with no tie to a specific module's
    content, so it doesn't map cleanly to any one inquiry question. Dropped for
    consistency with how these have been handled before.

## Section II → closed-format conversions

Converted using each question's own marking-guide criteria and sample answer as
ground truth (same approach as the Year 12 Section II effort). All conversions are
multiple-choice; no ordering/word-bank/drag-drop types were used this round.

- **Paper 1: 11 kept** of ~15 gradable parts. Dropped: Q26 (draw a labelled
  prokaryotic/eukaryotic cell diagram — a drawing task, and redundant with existing MC
  coverage of the same concept), Q27a (draw a graph — drawing task), Q30 (discuss how
  technology advanced cell biology — open-ended essay).
- **Paper 2: 13 kept** of ~15 gradable parts. Dropped: Q24a (draw a labelled plant cell
  — drawing task), Q26a (complete a flowchart — better suited to a fill-in/ordering
  format the platform doesn't have a clean fit for here), Q27a (plot a graph — drawing
  task). Q29 (Gouldian finch abiotic/biotic factors + management strategy) was only
  partially converted — the "propose a management strategy" half is open-ended and
  was dropped, but a factual biotic-vs-abiotic MC was kept.
- **Paper 3: 17 kept** of ~20 gradable parts. Dropped: Q23 (predict dialysis-tubing
  osmosis results) — I worked through the water-potential logic and kept getting
  contradictory answers against what the marking guide's cause/effect wording seemed
  to imply, so rather than guess I dropped it entirely; worth someone double-checking
  the original marking guide by hand if this content is wanted. Q27a/b/c (plot a graph,
  read two values off it) — drawing/graph-reading tasks not suited to conversion.
  Q31a (label a diagram) — drawing task.

## Images
All 33 extracted images were checked against their actual question (not assumed from
document order — a lesson from the last batch, where several images were mismatched
to questions). Every image referenced in the staged JSON exists and was visually
verified to match its question and answer.

## Status: LIVE (pushed 2026-09-02)
All 97 questions above are live in the `questions` table (via `tools/stage_further_y11.cjs`
+ `insert_hsc_rows.cjs`, images uploaded to the `question-images` bucket under the
`further-y11/` prefix). Live count went from 2008 to 2105. This folder and
`tools/pending_insert/further-y11-*.json` are now historical staging records.
