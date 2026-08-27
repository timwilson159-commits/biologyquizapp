export const meta = {
  name: 'exam-conversion-pipeline',
  description: 'Draft and verify biology quiz questions directly from raw exam chunks (no manual dossier step)',
  phases: [
    { title: 'Draft', detail: 'read each raw chunk (+ images) and draft platform questions' },
    { title: 'Verify', detail: 'adversarially check each draft against its raw source chunk' },
  ],
}

const MODULE_DEFS = [
  { id: 'module-1', title: 'Cells as the Basis of Life', inquiries: [
    { id: '1.1', title: 'Cell Structure', question: "What distinguishes one cell from another?" },
    { id: '1.2', title: 'Cell Function', question: 'How do cells coordinate activities within their internal environment and the external environment?' },
  ]},
  { id: 'module-2', title: 'Organisation of Living Things', inquiries: [
    { id: '2.1', title: 'Organisation of Cells', question: 'How are cells arranged in a multicellular organism?' },
    { id: '2.2', title: 'Nutrient and Gas Requirements', question: 'What is the difference in nutrient and gas requirements between autotrophs and heterotrophs?' },
    { id: '2.3', title: 'Transport', question: 'How does the composition of the transport medium change as it moves around an organism?' },
  ]},
  { id: 'module-3', title: 'Biological Diversity', inquiries: [
    { id: '3.1', title: 'Effects of the Environment on Organisms', question: 'How do environmental pressures promote a change in species diversity and abundance?' },
    { id: '3.2', title: 'Adaptations', question: "How do adaptations increase the organism's ability to survive?" },
    { id: '3.3', title: 'Theory of Evolution by Natural Selection', question: 'What is the relationship between evolution and biodiversity?' },
    { id: '3.4', title: 'Evolution - the Evidence', question: 'What is the evidence that supports the Theory of Evolution by Natural Selection?' },
  ]},
  { id: 'module-4', title: 'Ecosystem Dynamics', inquiries: [
    { id: '4.1', title: 'Population Dynamics', question: 'What effect can one species have on the other species in a community?' },
    { id: '4.2', title: 'Past Ecosystems', question: 'How do selection pressures within an ecosystem influence evolutionary change?' },
    { id: '4.3', title: 'Future Ecosystems', question: 'How can human activity impact on an ecosystem?' },
  ]},
]

const FAIRNESS_RULES = `
FAIRNESS & FORMAT RULES (apply strictly -- these caused real problems in an earlier batch):
- fill-blank (typed free-text answer) is BANNED -- it is not a supported type on this platform. Never produce it. Every question must be multiple-choice, true-false, word-bank, drag-drop, or ordering.
- Never use word-bank for a numeric/calculated answer, or any answer whose exact wording, units, or format could reasonably vary (e.g. a student typing "200 micrometres" when the stored answer is just "200" would be marked wrong even though they're right). Convert these to multiple-choice instead, spelling the value AND unit out in full inside each option (e.g. "200 micrometres", "400 micrometres"), with plausible wrong numeric options as distractors.
- Never write a question that references image labels or positions (e.g. "label A", "Image 2", "the labelled arrow", "which label shows X") unless you have actually viewed the image and confirmed those exact labels are visibly printed on it. Many diagrams in these documents use unlabelled pointer lines only. If that's what you see: either (a) make the position fully explicit and self-contained in the prompt text itself (e.g. "the topmost of four pointer lines, reading top to bottom, is A; the next is B..."), so a student can resolve it purely from what's visible without needing a caption, or (b) don't rely on positional labelling at all.
- If a question can't be made fair and unambiguous within the 5 supported types even after simplifying, don't force it through on a guess. Flag it for human review instead (see below) rather than shipping something a student could reasonably get wrong purely from unclear wording rather than not knowing the biology.
`

const FORMAT_NOTES = `
Platform question types and their JSON shape (fill-blank does NOT exist -- never produce it):
- multiple-choice: { type, prompt, image, options: [4 strings], answer: <one of options, exact string match> }
- true-false: { type, prompt, image, options: ["True","False"], answer: "True"|"False" }
- word-bank: { type, prompt, image, bank: [3-8 strings: the correct word(s) + distractors], answer }. Mark each blank in the prompt with "___", in order -- 1 to 3 blanks per question. For 1 blank, answer is a single string matching one bank entry exactly. For 2-3 blanks, answer is an array of strings in the SAME order as the blanks appear in the prompt, each matching one bank entry exactly; the bank holds all correct words for every blank plus distractors, up to 8 entries total.
- drag-drop: { type, prompt, image, pairs: [{item,match}, ...], answer: {"<item>":"<match>", ...} }
- ordering: { type, prompt, image, items: [strings in correct order], answer: [same strings, in the correct order] }
image is either null or a bare filename (e.g. "Image_023.jpg") -- never a path.
`

const SOURCE_FORMAT_NOTES = `
The raw chunk text below comes from a PDF-to-HTML export of a real exam paper. Notes on reading it:
- [[IMG:relative/path/Image_NNN.ext]] marks where an image sits in the original layout -- use the Read tool on ${'`'}<examFolder>\\\\Image_NNN.ext${'`'} (just the filename, joined to the exam folder given below) to view it.
- Text wrapped as **{color:#RRGGBB}...text...** was printed in a non-default colour in the original document -- this is almost always how the correct answer or marking criteria are highlighted. Common conventions seen so far: red (#C00000-ish) = the correct MCQ option or a rubric/marking-criteria point; blue (#006FC0-ish) = a full sample/model answer. Colours can vary by school -- infer the convention from context (which option's text is uniquely highlighted, compared to the plain unhighlighted distractors) rather than assuming a fixed hex value.
- For extended-response chunks, the question is printed once as originally asked, then (after a "--- MARKING CRITERIA / SOLUTIONS FOR THIS QUESTION ---" divider if present) printed again with marking criteria and/or a sample answer. If that divider is NOT present, no answer key exists for this question -- do your best with sound biology knowledge, and lower your confidence accordingly, but still produce a question.
- Ignore obvious page furniture: cover pages, "Student Number", blank answer-bubble lists ("1. A B C D 2. A B C D ..."), mark totals tables, "Please turn over", extra writing paper notices.
- The multiple-choice chunks may start or end mid-question (they were split by rough line count, not question boundaries) -- if a chunk opens or closes on a fragment that clearly continues into the previous/next chunk, just skip that fragment; don't guess at a chopped-off question.
`

const DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source_ref: { type: 'string', description: 'e.g. "Q3" or "Q16b" -- reuse the original question number/letter, append -1/-2 if you split one part into multiple questions' },
          inquiry_id: { type: 'string' },
          type: { type: 'string', enum: ['multiple-choice', 'true-false', 'word-bank', 'drag-drop', 'ordering'] },
          prompt: { type: 'string' },
          image_filename: {},
          options: {},
          bank: {},
          pairs: {},
          items: {},
          answer: {},
          hint: {},
          confidence: { type: 'string', enum: ['high', 'medium', 'low'], description: 'low if this chunk had no marking-criteria/solutions section and you had to rely on your own biology knowledge' },
          conversion_note: { type: 'string' },
        },
        required: ['source_ref', 'inquiry_id', 'type', 'prompt', 'answer'],
      },
    },
    skipped: {
      type: 'array',
      items: { type: 'object', properties: { source_ref: { type: 'string' }, reason: { type: 'string' } } },
    },
  },
  required: ['questions', 'skipped'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source_ref: { type: 'string' },
          verdict: { type: 'string', enum: ['confirmed', 'fixed', 'rejected', 'needs_review'] },
          question: {},
          issue: {},
        },
        required: ['source_ref', 'verdict'],
      },
    },
  },
  required: ['results'],
}

function draftPrompt(ref) {
  return `You are converting a real NSW Year 11 Biology exam question into a revision-quiz question bank.

First, use the Read tool to open this JSON file:
${ref.source_file}

It contains a "chunks" array. Find the chunk object whose "chunk_id" is exactly "${ref.chunk_id}" and use its "text" field as your raw source chunk, and its "images" field for the list of image filenames it references (kind: ${ref.kind}).

Exam images live at: ${ref.exam_folder}\\<filename> (a bare filename like Image_001.jpg -- the chunk's "text" and "images" fields reference them as "<exam folder name>/Image_NNN.ext", so just take the filename part after the last slash).
${SOURCE_FORMAT_NOTES}

SYLLABUS MODULES/INQUIRY QUESTIONS (map each output question to the best-fit inquiry_id):
${JSON.stringify(MODULE_DEFS, null, 2)}

${FORMAT_NOTES}
${FAIRNESS_RULES}
TASK:
- If this chunk is a "multiple_choice_section" piece: find every complete multiple-choice question in it (stem + options + highlighted correct answer) and convert each near-verbatim into a multiple-choice question. View any referenced image before writing a question that depends on it -- keep the image attached if the question can't be answered without seeing it.
- If this chunk is an "extended_response_question" (one original exam question, possibly with lettered sub-parts a/b/c): convert EACH sub-part into one platform question, force-fitting into the closest-fitting type (multiple-choice, true-false, word-bank, drag-drop matching, or ordering -- fill-blank does not exist, never use it). Simplify/rewrite the stem as needed so it works as a single-answer, self-checkable item -- preserve the underlying biology skill/content, not the original open-ended wording. It's fine (and encouraged, per the site's design) to produce MORE than one platform question from a single sub-part or a single image where there's a natural way to split it (e.g. a comparison table becomes a drag-drop matching question; a multi-criterion identification becomes two MCQs).
  - If a sub-part genuinely cannot become a fair, faithful question in any of the 5 types (e.g. "draw a graph", "annotate a diagram", "draw a tree"), put it in "skipped" with a short reason -- don't force something misleading. Where you can, prefer converting the underlying skill into a different format instead of skipping outright (e.g. a "draw a graph to show X" often converts well into a word-bank about the trend the graph would show).
- Every answer must be factually correct according to the chunk's marking criteria/sample answer if present, or your own sound biology reasoning if not (mark confidence "low" in that case).
- Write a short conversion_note per question: 1-2 sentences on how/why it was converted or simplified.

Return your result via the required schema.`
}

function verifyPrompt(ref, draft) {
  return `You are QA-checking exam-derived quiz questions before they go live to students.

First, use the Read tool to open this JSON file:
${ref.source_file}

It contains a "chunks" array. Find the chunk object whose "chunk_id" is exactly "${ref.chunk_id}" -- its "text" field is your ground-truth raw source chunk (kind: ${ref.kind}).
${SOURCE_FORMAT_NOTES}

DRAFTED QUESTIONS TO CHECK:
${JSON.stringify(draft.questions, null, 2)}

Exam images live at: ${ref.exam_folder}\\<filename> -- use Read to view any image_filename referenced by a drafted question, and cross-check it actually supports that question/answer.
${FAIRNESS_RULES}
For EACH drafted question, check:
1. Factual accuracy -- does "answer" match the source's marking key / highlighted correct option, or sound biology reasoning if the source gave no answer key?
2. Faithful conversion -- does it still test the same underlying content/skill as the source, without being misleading or trivially easy?
3. Structural correctness for its type (multiple-choice answer exactly matches one option; word-bank answer exactly matches one bank entry; drag-drop answer keys exactly match pairs' item fields; ordering answer array is a permutation of items in the correct order; image_filename, if set, is genuinely relevant and necessary).
4. Fairness -- does it violate either fairness rule above (fill-blank used at all, a numeric word-bank answer, or an image label that isn't actually visible)? If you can fix it cleanly yourself (e.g. rewrite fill-blank or numeric word-bank as multiple-choice, or make label positions explicit), do so and use verdict "fixed". If you can't fix it with confidence, use "needs_review".
5. Reasonable inquiry_id mapping against the syllabus list below.

SYLLABUS MODULES/INQUIRY QUESTIONS:
${JSON.stringify(MODULE_DEFS, null, 2)}

Verdicts: "confirmed" (correct as-is). "fixed" (you corrected a small problem -- return the full corrected question). "needs_review" (a genuine fairness/clarity concern you can't confidently resolve yourself -- return your best-effort question plus a clear "issue" explaining the concern, so a human can decide). "rejected" (fundamentally wrong or too distorted to be a fair test, with a clear issue) -- only use this when the question is unsalvageable, not just imperfect.

Return your result via the required schema, one entry per drafted question (match by source_ref).`
}

// Each ref: { chunk_id, kind, source_file, exam_folder, exam_slug }. The agent
// reads source_file itself and locates its own chunk -- keeps this orchestration
// script (and the caller building `args`) tiny even across many exams at once,
// since chunk text/images never need to pass through args or this script.
const chunkRefs = args.chunkRefs

phase('Draft')
const results = await pipeline(
  chunkRefs,
  (ref) => agent(draftPrompt(ref), { label: `draft:${ref.exam_slug}:${ref.chunk_id}`, phase: 'Draft', schema: DRAFT_SCHEMA }),
  (draft, ref) => {
    if (!draft || !draft.questions || draft.questions.length === 0) {
      return { chunk_id: ref.chunk_id, exam_slug: ref.exam_slug, confirmed: [], needsReview: [], skipped: draft ? draft.skipped : [{ source_ref: ref.chunk_id, reason: 'draft agent returned nothing' }] }
    }
    return agent(verifyPrompt(ref, draft), { label: `verify:${ref.exam_slug}:${ref.chunk_id}`, phase: 'Verify', schema: VERIFY_SCHEMA })
      .then((verify) => {
        const byRef = {}
        for (const q of draft.questions) byRef[q.source_ref] = q
        const confirmed = []
        const needsReview = []
        const rejected = []
        for (const r of (verify ? verify.results : [])) {
          if (r.verdict === 'rejected') { rejected.push({ source_ref: r.source_ref, reason: r.issue || 'rejected by verifier' }); continue }
          const q = (r.verdict === 'fixed' || r.verdict === 'needs_review') && r.question ? r.question : byRef[r.source_ref]
          if (!q) continue
          const tagged = { ...q, exam_slug: ref.exam_slug, exam_folder: ref.exam_folder }
          if (r.verdict === 'needs_review') needsReview.push({ ...tagged, review_reason: r.issue || 'flagged for review by verifier' })
          else confirmed.push(tagged)
        }
        return { chunk_id: ref.chunk_id, exam_slug: ref.exam_slug, confirmed, needsReview, skipped: [...(draft.skipped || []), ...rejected] }
      })
  }
)

const allConfirmed = results.filter(Boolean).flatMap((r) => r.confirmed)
const allNeedsReview = results.filter(Boolean).flatMap((r) => r.needsReview || [])
const allSkipped = results.filter(Boolean).flatMap((r) => (r.skipped || []).map((s) => ({ ...s, chunk_id: r.chunk_id, exam_slug: r.exam_slug })))

log(`Draft+verify complete: ${allConfirmed.length} confirmed, ${allNeedsReview.length} need human review, ${allSkipped.length} skipped/rejected`)

return { confirmed: allConfirmed, needsReview: allNeedsReview, skipped: allSkipped }
