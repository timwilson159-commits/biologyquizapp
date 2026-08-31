# Additional Y11 HTML Exams — triage notes

Source: `HTML Exams/Additional Y11 HTML Exams/Paper 1-6.html`, images in the sibling
`Extracted Images/` folder (`Paper_N_imgNN.*`), answer key from user-supplied
`Answer key.csv`. These are old textbook trial exams (Papers 1, 2, 4 are Reed
International Books "Biology Preliminary" 2006/2007/2008 papers, written against the
pre-2018 syllabus) and two apparently current-syllabus school papers (Papers 3 and 5,
plus most of Paper 6) — hence the uneven yield below: the old papers include topics
(origin of life, detailed history-of-life timeline, reproduction/meiosis) that were
moved to Year 12 or dropped entirely in the 2018 syllabus.

**Total: 90 kept / 110 source questions (82%), staged in `paper1.json`-`paper6.json`
in this folder. Nothing inserted into `questions` yet — same staging-only convention
as every other batch in this project.** Image filenames referenced in each row are
the original `Paper_N_imgNN.*` names in `Extracted Images/`; they still need
uploading to the `question-images` bucket and swapping for real URLs (same
`stage_batch.cjs` step used for prior batches) before insert.

## Per-paper drops

**Paper 1** (10/15 kept) — dropped:
- Q6 "chemicals of life from outer space" (panspermia/abiogenesis) — old-syllabus origin-of-life content, no equivalent in the current Y11 modules.
- Q7 "evaluation of the impact of the fossil record" — all four options are near-paraphrases of each other; too ambiguous to defend a single correct answer.
- Q10 "meaning of quantitative analysis" — generic Working Scientifically skills question, not tied to any module's content.
- Q14, Q15 (internal/external fertilisation; conditions favouring asexual reproduction) — reproduction content sits in Year 12 Module 5.1, not Year 11.

**Paper 2** (17/20 kept) — dropped:
- Q17 (plant cell diagram, "which organelles contain DNA") — viewed the diagram (`Paper_2_img08.png`); the labelled parts are genuinely ambiguous (ring-shaped organelles that could plausibly be chloroplasts or mitochondria aren't clearly distinguishable), so I couldn't confidently verify the key's "B, E and G" against the image.
- Q19 ("correct path of water through a plant") — all four options are flawed (none correctly ends at stomata/transpiration); the key's answer ends at "lenticels", which is a minor/non-standard pathway. Excluded for quality rather than risk teaching an awkward answer.
- Q20 (daughter cells produced by meiosis) — meiosis is Year 12 (Module 5) content.

**Paper 3** (18/20 kept) — dropped:
- Q5 (cell diagram, label/function matching) and Q14 (algae bloom, selective-pressure/classification table) — both source tables end in bare "A. B. C. D." with no option text after them. Confirmed via a full page-text render (not just raw HTML) that the actual answer content is missing from the source document, not just lost in extraction — nothing recoverable to build a valid question from.
- This paper (and most of Papers 5/6) reads as a current-syllabus school paper — much higher yield than the old Reed textbook papers.

**Paper 4** (11/15 kept) — dropped:
- Q9 (early Earth conditions for origin of organic molecules — Miller-Urey-style) and Q11 (anoxic→oxic atmosphere significance) — old-syllabus origin-of-life/atmospheric evolution content.
- Q14 (conditions favouring asexual reproduction) — Year 12 Module 5.1 content.
- Q15 ("what does 'reliable' mean" in an investigation) — generic Working Scientifically question, not module content.

**Paper 5** (20/20 kept) — no drops. Strong current-syllabus alignment throughout (adaptations, evolution evidence, transport, enzymes). Verified the trickier diagram-dependent answers directly against the images: rock-strata fossil dating (Q3/4), the enzyme-concentration-during-reaction graph (Q8 — flat line, since enzymes aren't consumed), the double-circulatory-system vessel diagram (Q9 — traced which labelled vessels are the two arteries), the urea/liver diagram (Q10), the mercury/enzyme-inhibition graph (Q19), and the digestive-system diagram (Q20). All matched the supplied answer key.

**Paper 6** (14/20 kept) — dropped:
- Q9 (leaf cross-section, "where is most oxygen produced") — **you flagged `Paper_6_img05` as broken; confirmed by viewing it** (renders as a generic placeholder icon, not an actual leaf diagram). Excluded per your instruction.
- Q10 (mitosis sequence, "which of 4 sequences is correct") — **the supplied answer key says Sequence 4, but I zoomed into both Sequence 2 and Sequence 4 and Sequence 4 draws anaphase (chromatids separating) *before* metaphase (chromosomes aligned at the equator), which is biologically backwards. Sequence 2 has the correct prophase→metaphase→anaphase→telophase order.** Excluded rather than silently overriding the key — flagging this discrepancy for you specifically, since it's the one place my own reading contradicts the supplied answers. Happy to include it as Sequence 2 if you agree, or drop it entirely.
- Q11 (Urey-Miller experiment gases) and Q13 (sequence of life on Earth, earliest to most recent) — old-syllabus origin-of-life/history-of-life content.
- Q18 (why internal fertilisation enabled terrestrial colonisation) — Year 12 Module 5.1 content.
- Q20 (DNA amount per stage during gamete formation) — meiosis/gametogenesis, Year 12 content.

## Recurring drop categories (for future batches of this vintage)
1. **Old-syllabus origin-of-life / history-of-life-on-Earth content** — panspermia, Miller-Urey, anoxic→oxic atmosphere, "sequence of life from earliest to most recent". No home in the current Y11 Modules 1-4.
2. **Reproduction/meiosis content** — internal vs external fertilisation, conditions favouring asexual reproduction, meiosis products, DNA amount during gamete formation. All now sit in Year 12 Module 5 (Heredity), not Year 11.
3. **Generic Working Scientifically questions** with no module-specific content (e.g. "what does reliable/quantitative mean") — left out since they don't belong to any one inquiry question.
4. **Corrupted source tables** — a few questions rely on a table/diagram whose actual answer-option text is missing from the HTML entirely (not an extraction bug — confirmed via full page render). No amount of interpretation can recover these.

## Next step
Once you're happy with the question set (and have a call on the Paper 6 Q10 mitosis-sequence discrepancy above), the remaining pipeline is the same as every prior batch:
upload the referenced images to the `question-images` bucket, resolve them into the JSON rows, then run through `insert_hsc_rows.cjs` (or an equivalent) — nothing goes live until that explicit insert step, and only with your go-ahead.
