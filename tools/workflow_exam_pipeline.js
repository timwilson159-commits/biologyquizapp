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

const FORMAT_NOTES = `
Platform question types and their JSON shape:
- multiple-choice: { type, prompt, image, options: [4 strings], answer: <one of options, exact string match> }
- true-false: { type, prompt, image, options: ["True","False"], answer: "True"|"False" }
- fill-blank: { type, prompt (use ___ to mark the blank), image, answer: "<short string>", hint: "<optional>" }
- word-bank: { type, prompt (use ___ to mark the blank), image, bank: [5 strings: 1 correct + 4 distractors], answer: "<the correct string, must match one bank entry exactly>" }
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
          type: { type: 'string', enum: ['multiple-choice', 'true-false', 'fill-blank', 'word-bank', 'drag-drop', 'ordering'] },
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
          verdict: { type: 'string', enum: ['confirmed', 'fixed', 'rejected'] },
          question: {},
          issue: {},
        },
        required: ['source_ref', 'verdict'],
      },
    },
  },
  required: ['results'],
}

function draftPrompt(chunk, examFolder) {
  return `You are converting a real NSW Year 11 Biology exam question into a revision-quiz question bank.

RAW SOURCE CHUNK (${chunk.chunk_id}, kind: ${chunk.kind}):
"""
${chunk.text}
"""

Exam images live at: ${examFolder}\\<filename> (filenames referenced above, e.g. ${(chunk.images || [])[0] || 'Image_001.jpg'})
${SOURCE_FORMAT_NOTES}

SYLLABUS MODULES/INQUIRY QUESTIONS (map each output question to the best-fit inquiry_id):
${JSON.stringify(MODULE_DEFS, null, 2)}

${FORMAT_NOTES}

TASK:
- If this chunk is a "multiple_choice_section" piece: find every complete multiple-choice question in it (stem + options + highlighted correct answer) and convert each near-verbatim into a multiple-choice question. View any referenced image before writing a question that depends on it -- keep the image attached if the question can't be answered without seeing it.
- If this chunk is an "extended_response_question" (one original exam question, possibly with lettered sub-parts a/b/c): convert EACH sub-part into one platform question, force-fitting into the closest-fitting type (multiple-choice, true-false, fill-blank, word-bank, drag-drop matching, or ordering). Simplify/rewrite the stem as needed so it works as a single-answer, self-checkable item -- preserve the underlying biology skill/content, not the original open-ended wording. It's fine (and encouraged, per the site's design) to produce MORE than one platform question from a single sub-part or a single image where there's a natural way to split it (e.g. a comparison table becomes a drag-drop matching question; a multi-criterion identification becomes two MCQs).
  - If a sub-part genuinely cannot become a fair, faithful question in any of the 6 types (e.g. "draw a graph", "annotate a diagram", "draw a tree"), put it in "skipped" with a short reason -- don't force something misleading. Where you can, prefer converting the underlying skill into a different format instead of skipping outright (e.g. a "draw a graph to show X" often converts well into a fill-blank about the trend the graph would show).
- Every answer must be factually correct according to the chunk's marking criteria/sample answer if present, or your own sound biology reasoning if not (mark confidence "low" in that case).
- Write a short conversion_note per question: 1-2 sentences on how/why it was converted or simplified.

Return your result via the required schema.`
}

function verifyPrompt(chunk, draft, examFolder) {
  return `You are QA-checking exam-derived quiz questions before they go live to students.

RAW SOURCE CHUNK (ground truth, ${chunk.chunk_id}):
"""
${chunk.text}
"""
${SOURCE_FORMAT_NOTES}

DRAFTED QUESTIONS TO CHECK:
${JSON.stringify(draft.questions, null, 2)}

Exam images live at: ${examFolder}\\<filename> -- use Read to view any image_filename referenced by a drafted question, and cross-check it actually supports that question/answer.

For EACH drafted question, check:
1. Factual accuracy -- does "answer" match the source's marking key / highlighted correct option, or sound biology reasoning if the source gave no answer key?
2. Faithful conversion -- does it still test the same underlying content/skill as the source, without being misleading or trivially easy?
3. Structural correctness for its type (multiple-choice answer exactly matches one option; word-bank answer exactly matches one bank entry; drag-drop answer keys exactly match pairs' item fields; ordering answer array is a permutation of items in the correct order; image_filename, if set, is genuinely relevant and necessary).
4. Reasonable inquiry_id mapping against the syllabus list below.

SYLLABUS MODULES/INQUIRY QUESTIONS:
${JSON.stringify(MODULE_DEFS, null, 2)}

If a question has a small fixable problem, FIX it yourself and return the corrected full question object with verdict "fixed". If correct as-is, verdict "confirmed". If fundamentally wrong or too distorted to be a fair test, verdict "rejected" with a clear issue.

Return your result via the required schema, one entry per drafted question (match by source_ref).`
}

const examFolder = args.examFolder
const chunks = args.chunks

phase('Draft')
const results = await pipeline(
  chunks,
  (chunk) => agent(draftPrompt(chunk, examFolder), { label: `draft:${chunk.chunk_id}`, phase: 'Draft', schema: DRAFT_SCHEMA }),
  (draft, chunk) => {
    if (!draft || !draft.questions || draft.questions.length === 0) {
      return { chunk_id: chunk.chunk_id, confirmed: [], skipped: draft ? draft.skipped : [{ source_ref: chunk.chunk_id, reason: 'draft agent returned nothing' }] }
    }
    return agent(verifyPrompt(chunk, draft, examFolder), { label: `verify:${chunk.chunk_id}`, phase: 'Verify', schema: VERIFY_SCHEMA })
      .then((verify) => {
        const byRef = {}
        for (const q of draft.questions) byRef[q.source_ref] = q
        const confirmed = []
        const rejected = []
        for (const r of (verify ? verify.results : [])) {
          if (r.verdict === 'rejected') { rejected.push({ source_ref: r.source_ref, reason: r.issue || 'rejected by verifier' }); continue }
          const q = r.verdict === 'fixed' && r.question ? r.question : byRef[r.source_ref]
          if (q) confirmed.push(q)
        }
        return { chunk_id: chunk.chunk_id, confirmed, skipped: [...(draft.skipped || []), ...rejected] }
      })
  }
)

const allConfirmed = results.filter(Boolean).flatMap((r) => r.confirmed)
const allSkipped = results.filter(Boolean).flatMap((r) => (r.skipped || []).map((s) => ({ ...s, chunk_id: r.chunk_id })))

log(`Draft+verify complete: ${allConfirmed.length} confirmed questions, ${allSkipped.length} skipped/rejected`)

return { confirmed: allConfirmed, skipped: allSkipped }
