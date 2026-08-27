export const meta = {
  name: 'hsc-mcq-pipeline',
  description: 'Draft and verify Year 12 quiz questions from real HSC Biology multiple-choice sections, using the official NESA answer key + mapping grid as ground truth',
  phases: [
    { title: 'Draft', detail: 'read each year\'s Section I text (+ images) and draft platform questions' },
    { title: 'Verify', detail: 'adversarially check each draft against the official answer key and mapping grid' },
  ],
}

const MODULE_DEFS = [
  { id: 'module-5', title: 'Heredity', inquiries: [
    { id: '5.1', title: 'Reproduction' }, { id: '5.2', title: 'Cell Replication' },
    { id: '5.3', title: 'DNA and Polypeptide Synthesis' }, { id: '5.4', title: 'Genetic Variation' },
    { id: '5.5', title: 'Inheritance Patterns in a Population' },
  ]},
  { id: 'module-6', title: 'Genetic Change', inquiries: [
    { id: '6.1', title: 'Mutation' }, { id: '6.2', title: 'Biotechnology' }, { id: '6.3', title: 'Genetic Technologies' },
  ]},
  { id: 'module-7', title: 'Infectious Disease', inquiries: [
    { id: '7.1', title: 'Causes of Infectious Disease' }, { id: '7.2', title: 'Responses to Pathogens' },
    { id: '7.3', title: 'Immunity' }, { id: '7.4', title: 'Prevention, Treatment and Control' },
  ]},
  { id: 'module-8', title: 'Non-infectious Disease and Disorders', inquiries: [
    { id: '8.1', title: 'Homeostasis' }, { id: '8.2', title: 'Causes and Effects' }, { id: '8.3', title: 'Epidemiology' },
    { id: '8.4', title: 'Prevention' }, { id: '8.5', title: 'Technologies and Disorders' },
  ]},
]

const FAIRNESS_RULES = `
FAIRNESS & FORMAT RULES (apply strictly):
- fill-blank (typed free-text answer) is BANNED -- it is not a supported type on this platform. Never produce it. Every question must be multiple-choice, true-false, word-bank, drag-drop, or ordering.
- Never use word-bank for a numeric/calculated answer, or any answer whose exact wording, units, or format could reasonably vary. Convert these to multiple-choice instead, spelling the value AND unit out in full inside each option, with plausible wrong numeric options as distractors.
- Never write a question that references image labels or positions (e.g. "label A", "which arrow shows X") unless you have actually viewed the image and confirmed those exact labels are visibly printed on it.
- If a question can't be made fair and unambiguous within the 5 supported types even after simplifying, don't force it through on a guess -- put it in "skipped" with a short reason instead.
`

const COPYRIGHT_RULE = `
- Some source diagrams are replaced in this public export with the placeholder text "Due to copyright restrictions, this material cannot be displayed until permission has been obtained." If a question's stem depends on a diagram that has been replaced this way (no real [[IMG:...]] marker near it), you CANNOT faithfully reproduce that question -- put it in "skipped" with reason "source image redacted for copyright". Do not guess what the redacted diagram shows.
`

const FORMAT_NOTES = `
Platform question types and their JSON shape (fill-blank does NOT exist -- never produce it):
- multiple-choice: { type, prompt, image, options: [4 strings], answer: <one of options, exact string match> }
- true-false: { type, prompt, image, options: ["True","False"], answer: "True"|"False" }
- word-bank: { type, prompt, image, bank: [3-8 strings: the correct word(s) + distractors], answer }. Mark each blank in the prompt with "___", in order -- 1 to 3 blanks per question. For 1 blank, answer is a single string matching one bank entry exactly. For 2-3 blanks, answer is an array of strings in the SAME order as the blanks appear in the prompt, each matching one bank entry exactly; the bank holds all correct words for every blank plus distractors, up to 8 entries total.
- drag-drop: { type, prompt, image, pairs: [{item,match}, ...], answer: {"<item>":"<match>", ...} }
- ordering: { type, prompt, image, items: [strings in correct order], answer: [same strings, in the correct order] }
image is either null or a bare filename (e.g. "Image_023.png") -- never a path.
`

const CONVERSION_GUIDANCE = `
FORMAT CONVERSION GUIDANCE -- convert away from plain multiple-choice ONLY when it's a natural, intuitive fit for that specific question's content, not by quota. Good signals to watch for in these real exam questions:
- "Which row of the table correctly identifies/shows..." questions where each of the 4 options is itself a full row pairing two things (e.g. Method of reproduction <-> Type of organism; Pathogen <-> Vector <-> Method of transmission) -- these often convert beautifully to drag-drop, one pair per row-component, IF the pairing is genuinely 1:1 and unambiguous.
- "Which of the following correctly shows the order of steps..." or similar sequencing questions (e.g. Koch's postulates, a cloning/biotechnology process) -- convert to ordering, using the step descriptions as items.
- A question whose correct option is a single unambiguous term or short phrase (not a full sentence, not numeric, no reasonable alternative wording) -- word-bank fits well. If the stem naturally names two or three distinct terms in sequence (e.g. "the process of X produces Y, which Z then converts into W"), a multi-blank word-bank (up to 3 blanks, one shared bank of up to 8 words) can be a stronger, more natural fit than a single-blank version or a forced multiple-choice -- use it when it reads naturally, not by force.
- A question that's fundamentally a single true/false claim (or where the correct option and one strong distractor are naturally opposite claims) -- true-false fits well.
- If none of the above fit naturally, keep it as standard multiple-choice, near-verbatim from the source (this will be the right call for most questions -- don't force variety).
`

const SOURCE_FORMAT_NOTES = `
The raw text below comes from a PDF-to-HTML export of the real 20-question multiple-choice section (Section I) of an official NSW HSC Biology exam. Notes on reading it:
- [[IMG:relative/path/Image_NNN.ext]] marks where an image sits in the original layout -- use the Read tool on "<image_folder>\\Image_NNN.ext" (the JSON's "image_folder" field, joined to the bare filename) to view it.
- There are exactly 20 questions in this text, in the same order as the provided answer_key (question 1 first, question 20 last). Options within each question are printed in order and correspond to A, B, C, D (1st option = A, 2nd = B, 3rd = C, 4th = D) -- there are no visible "A."/"B." labels for most questions since those were rendered as list-counter styling that doesn't survive HTML->text extraction, but a few questions do retain literal "A." "B." "C." "D." labels in the text; either way, reading order = A,B,C,D.
- Ignore obvious page furniture that may remain: "BLANK PAGE", page numbers, copyright footers, "Extra page" notices.
- The text may open or close mid-question relative to your reading, but the START and END of the whole Section I block are exact -- all 20 questions are fully contained within it.
${COPYRIGHT_RULE}
`

const DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source_ref: { type: 'string', description: 'the original question number as a string, e.g. "1" or "17"' },
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
          conversion_note: { type: 'string', description: '1-2 sentences: kept as multiple-choice near-verbatim, or why converted to this type' },
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

function mappingNote(mapping) {
  const lines = []
  for (const [qnum, m] of Object.entries(mapping)) {
    if (m.inquiry_id) {
      lines.push(`Q${qnum}: inquiry_id "${m.inquiry_id}" (NESA content: "${m.content}")`)
    } else {
      const opts = (m.candidates || []).map((c) => c.inquiry_id).join(' or ')
      lines.push(`Q${qnum}: AMBIGUOUS -- NESA's own grid lists this under BOTH "${m.content}" -- pick whichever of [${opts}] best fits what this specific question actually asks. If genuinely unclear, just pick one.`)
    }
  }
  return lines.join('\n')
}

function draftPrompt(ref) {
  return `You are converting the multiple-choice section of a real NSW HSC (Year 12) Biology exam into a revision-quiz question bank.

First, use the Read tool to open this JSON file:
${ref.source_file}

It has these fields:
- "section1_text": the raw Section I (20 MCQ) text -- your source material
- "images": list of image filenames referenced within it
- "image_folder": use with the Read tool as "${ref.exam_root}\\<image_folder>\\Image_NNN.ext" to view any image
- "answer_key": {"1":"C","2":"A",...} -- the OFFICIAL correct answer letter for each question, straight from NESA's marking guidelines. Trust this completely; do not second-guess it.
- "mapping": per-question syllabus placement (see below)

${SOURCE_FORMAT_NOTES}

SYLLABUS MODULES (Year 12, Modules 5-8):
${JSON.stringify(MODULE_DEFS, null, 2)}

PER-QUESTION SYLLABUS MAPPING (from NESA's own Mapping Grid for this exam):
${mappingNote(ref.mapping)}

${FORMAT_NOTES}
${CONVERSION_GUIDANCE}
${FAIRNESS_RULES}
TASK:
- Find all 20 multiple-choice questions in "section1_text", in order (source_ref "1" through "20").
- For each: view any image it references, determine the correct option using answer_key (option position A=1st,B=2nd,C=3rd,D=4th as printed), and convert it into ONE platform question -- either standard multiple-choice (near-verbatim, all 4 original options) or one of the alternative types per the conversion guidance above, whichever is the more natural, intuitive fit for THIS question.
- Assign inquiry_id per the mapping above (resolve the ambiguous ones yourself using the question's actual content).
- Skip (with reason) any question whose diagram is redacted for copyright, or that can't be made fair/unambiguous in any of the 6 types.
- Write a short conversion_note per question.

Return your result via the required schema.`
}

function verifyPrompt(ref, draft) {
  return `You are QA-checking real-exam-derived HSC Biology quiz questions before they go live to students.

First, use the Read tool to open this JSON file:
${ref.source_file}
Its "section1_text" is your ground-truth raw source, "answer_key" is the official correct-answer letter per question, and "mapping" is the official syllabus placement (see notes below for ambiguous ones).
${SOURCE_FORMAT_NOTES}

PER-QUESTION SYLLABUS MAPPING:
${mappingNote(ref.mapping)}

DRAFTED QUESTIONS TO CHECK:
${JSON.stringify(draft.questions, null, 2)}

Image folder for viewing: "${ref.exam_root}\\<image_folder from the JSON>\\<filename>"
${FORMAT_NOTES}
${CONVERSION_GUIDANCE}
${FAIRNESS_RULES}
For EACH drafted question, check:
1. Factual accuracy -- does "answer" match answer_key's letter for that source_ref, mapped to the correct option by reading order (A=1st,B=2nd,...)? This is the single most important check -- a wrong answer on a real exam question is a serious problem.
2. Faithful conversion -- if converted to an alternative type, does it still test the exact same underlying content, with no loss of fairness (e.g. a drag-drop built from a "which row" question must use the EXACT pairings from the correct row only, not mix in a distractor row's pairing).
3. Structural correctness for its type (multiple-choice answer exactly matches one option; word-bank answer exactly matches one bank entry; drag-drop answer keys exactly match pairs' item fields; ordering answer array is a permutation of items in the correct order; image_filename, if set, is genuinely relevant and necessary and NOT a redacted/copyright-placeholder image).
4. Fairness -- per the rules above.
5. Syllabus mapping -- reasonable inquiry_id given the mapping notes and the question's actual content.

Verdicts: "confirmed" (correct as-is). "fixed" (you corrected a small problem -- return the full corrected question). "needs_review" (a genuine concern you can't confidently resolve yourself -- return your best-effort question plus a clear "issue"). "rejected" (wrong answer, copyright-redacted image, or fundamentally unfair/distorted) -- only when unsalvageable.

Return your result via the required schema, one entry per drafted question (match by source_ref).`
}

const examRefs = args // [{ source_file, exam_root, exam_slug, mapping }, ...]

phase('Draft')
const results = await pipeline(
  examRefs,
  (ref) => agent(draftPrompt(ref), { label: `draft:${ref.exam_slug}`, phase: 'Draft', schema: DRAFT_SCHEMA }),
  (draft, ref) => {
    if (!draft || !draft.questions || draft.questions.length === 0) {
      return { exam_slug: ref.exam_slug, confirmed: [], needsReview: [], skipped: draft ? draft.skipped : [{ source_ref: '?', reason: 'draft agent returned nothing' }] }
    }
    return agent(verifyPrompt(ref, draft), { label: `verify:${ref.exam_slug}`, phase: 'Verify', schema: VERIFY_SCHEMA })
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
          const tagged = { ...q, exam_slug: ref.exam_slug, exam_folder: `${ref.exam_root}\\${ref.image_folder}` }
          if (r.verdict === 'needs_review') needsReview.push({ ...tagged, review_reason: r.issue || 'flagged for review by verifier' })
          else confirmed.push(tagged)
        }
        return { exam_slug: ref.exam_slug, confirmed, needsReview, skipped: [...(draft.skipped || []), ...rejected] }
      })
  }
)

const allConfirmed = results.filter(Boolean).flatMap((r) => r.confirmed)
const allNeedsReview = results.filter(Boolean).flatMap((r) => r.needsReview || [])
const allSkipped = results.filter(Boolean).flatMap((r) => (r.skipped || []).map((s) => ({ ...s, exam_slug: r.exam_slug })))

log(`HSC pipeline complete: ${allConfirmed.length} confirmed, ${allNeedsReview.length} need human review, ${allSkipped.length} skipped/rejected`)

return { confirmed: allConfirmed, needsReview: allNeedsReview, skipped: allSkipped }
