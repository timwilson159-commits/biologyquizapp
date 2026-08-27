export const meta = {
  name: 'syllabus-question-bank',
  description: 'Generate an original, image-free question bank (20-30 questions per inquiry question) directly from the syllabus',
  phases: [
    { title: 'Draft', detail: 'write 20-30 questions per inquiry question from its syllabus content' },
    { title: 'Verify', detail: 'check each batch for accuracy, fairness, syllabus fit and type variety' },
  ],
}

const INQUIRIES = [
  {
    id: '1.1', module_id: 'module-1', module_title: 'Cells as the Basis of Life', title: 'Cell Structure',
    question: 'What distinguishes one cell from another?',
    syllabus: `Students investigate different cellular structures, including: examining a variety of prokaryotic and eukaryotic cells; describing a range of technologies used to determine a cell's structure and function. Students investigate a variety of prokaryotic and eukaryotic cell structures, including: drawing scaled diagrams of a variety of cells; comparing and contrasting different cell organelles and arrangements; modelling the structure and function of the fluid mosaic model of the cell membrane.`,
  },
  {
    id: '1.2', module_id: 'module-1', module_title: 'Cells as the Basis of Life', title: 'Cell Function',
    question: 'How do cells coordinate activities within their internal environment and the external environment?',
    syllabus: `Students investigate the way materials move into and out of cells, including: modelling diffusion and osmosis; the roles of active transport, endocytosis and exocytosis; relating exchange of materials across membranes to surface-area-to-volume ratio, concentration gradients and characteristics of the materials exchanged. Students investigate cell requirements: suitable forms of energy (light energy and chemical energy in complex molecules); matter (gases, simple nutrients, ions); removal of wastes. Students investigate the biochemical processes of photosynthesis, cell respiration and removal of cellular products/wastes in eukaryotic cells. Students conduct a practical investigation to model the action of enzymes in cells, and investigate the effects of the environment on enzyme activity.`,
  },
  {
    id: '2.1', module_id: 'module-2', module_title: 'Organisation of Living Things', title: 'Organisation of Cells',
    question: 'How are cells arranged in a multicellular organism?',
    syllabus: `Students compare the differences between unicellular, colonial and multicellular organisms by investigating structures at the level of the cell and organelle, and relating structure of cells and cell specialisation to function. Students investigate the structure and function of tissues, organs and systems and relate those functions to cell differentiation and specialisation. Students justify the hierarchical structural organisation of organelles, cells, tissues, organs, systems and organisms.`,
  },
  {
    id: '2.2', module_id: 'module-2', module_title: 'Organisation of Living Things', title: 'Nutrient and Gas Requirements',
    question: 'What is the difference in nutrient and gas requirements between autotrophs and heterotrophs?',
    syllabus: `Students investigate the structure of autotrophs (dissected plant materials, microscopic structures, imaging technologies to determine plant structure) and the function of structures in a plant, including tracing the development and movement of products of photosynthesis. Students investigate gas exchange structures in animals and plants -- microscopic (alveoli in mammals, leaf structure in plants) and macroscopic (respiratory systems in a range of animals). Students interpret secondary-sourced information about photosynthesis and the transpiration-cohesion-tension theory. Students trace the digestion of foods in a mammalian digestive system: physical digestion, chemical digestion, absorption of nutrients/minerals/water, elimination of solid waste. Students compare the nutrient and gas requirements of autotrophs and heterotrophs.`,
  },
  {
    id: '2.3', module_id: 'module-2', module_title: 'Organisation of Living Things', title: 'Transport',
    question: 'How does the composition of the transport medium change as it moves around an organism?',
    syllabus: `Students investigate transport systems in animals and plants by comparing structures and components using physical and digital models: macroscopic structures in plants and animals; microscopic samples of blood, the cardiovascular system and plant vascular systems. Students investigate the exchange of gases between the internal and external environments of plants and animals. Students compare the structures and function of transport systems in animals and plants, including vascular systems in plants and animals, and open and closed transport systems in animals. Students compare the changes in the composition of the transport medium as it moves around an organism.`,
  },
  {
    id: '3.1', module_id: 'module-3', module_title: 'Biological Diversity', title: 'Effects of the Environment on Organisms',
    question: 'How do environmental pressures promote a change in species diversity and abundance?',
    syllabus: `Students predict the effects of selection pressures (biotic and abiotic factors) on organisms in ecosystems. Students investigate changes in a population of organisms due to selection pressures over time, for example cane toads in Australia, prickly pear distribution in Australia.`,
  },
  {
    id: '3.2', module_id: 'module-3', module_title: 'Biological Diversity', title: 'Adaptations',
    question: "How do adaptations increase the organism's ability to survive?",
    syllabus: `Students examine the adaptations of organisms that increase their ability to survive in their environment, including structural, physiological and behavioural adaptations. Students investigate, through secondary sources, the observations and data collected by Charles Darwin to support the Theory of Evolution by Natural Selection, e.g. finches of the Galapagos Islands, Australian flora and fauna.`,
  },
  {
    id: '3.3', module_id: 'module-3', module_title: 'Biological Diversity', title: 'Theory of Evolution by Natural Selection',
    question: 'What is the relationship between evolution and biodiversity?',
    syllabus: `Students explain biological diversity in terms of the Theory of Evolution by Natural Selection, examining changes in and diversification of life since it first appeared on Earth. Students analyse how an accumulation of microevolutionary changes can drive evolutionary changes and speciation over time, e.g. evolution of the horse, evolution of the platypus. Students explain, using examples, how Darwin and Wallace's Theory of Evolution by Natural Selection accounts for convergent evolution and divergent evolution. Students explain how punctuated equilibrium is different from the gradual process of natural selection.`,
  },
  {
    id: '3.4', module_id: 'module-3', module_title: 'Biological Diversity', title: 'Evolution - the Evidence',
    question: 'What is the evidence that supports the Theory of Evolution by Natural Selection?',
    syllabus: `Students investigate evidence in support of Darwin and Wallace's Theory of Evolution by Natural Selection, including biochemical evidence, comparative anatomy, comparative embryology and biogeography, and techniques used to date fossils and the evidence produced. Students explain modern-day examples that demonstrate evolutionary change, e.g. the cane toad, antibiotic-resistant strains of bacteria.`,
  },
  {
    id: '4.1', module_id: 'module-4', module_title: 'Ecosystem Dynamics', title: 'Population Dynamics',
    question: 'What effect can one species have on the other species in a community?',
    syllabus: `Students investigate and determine relationships between biotic and abiotic factors in an ecosystem: impact of abiotic factors; impact of biotic factors including predation, competition and symbiotic relationships; ecological niches occupied by species; predicting consequences for populations due to predation, competition, symbiosis and disease; measuring populations of organisms using sampling techniques. Students explain a recent extinction event.`,
  },
  {
    id: '4.2', module_id: 'module-4', module_title: 'Ecosystem Dynamics', title: 'Past Ecosystems',
    question: 'How do selection pressures within an ecosystem influence evolutionary change?',
    syllabus: `Students analyse palaeontological and geological evidence for past changes in ecosystems, including Aboriginal rock paintings, rock structure and formation, ice core drilling. Students investigate past and present technologies used to determine evidence for past changes, e.g. radiometric dating, gas analysis. Students analyse evidence that present-day organisms have evolved from organisms in the past, e.g. small mammals, sclerophyll plants in Australia. Students investigate reasons for changes in past ecosystems, interpreting secondary sources on changes in biotic/abiotic factors over time and evaluating hypotheses that account for identified trends.`,
  },
  {
    id: '4.3', module_id: 'module-4', module_title: 'Ecosystem Dynamics', title: 'Future Ecosystems',
    question: 'How can human activity impact on an ecosystem?',
    syllabus: `Students investigate changes in past ecosystems that may inform approaches to managing future ecosystems: the role of human-induced selection pressures on extinction of species; models used to predict future impacts on biodiversity; the role of changing climate on ecosystems. Students investigate practices used to restore damaged ecosystems, Country or Place, e.g. mining sites, land degradation from agricultural practices.`,
  },
]

const FORMAT_NOTES = `
Platform question types and their JSON shape (fill-blank does NOT exist -- never produce it):
- multiple-choice: { type, prompt, image: null, options: [4 strings], answer: <one of options, exact string match> }
- true-false: { type, prompt, image: null, options: ["True","False"], answer: "True"|"False" }
- word-bank: { type, prompt, image: null, bank: [3-8 strings: the correct word(s) + distractors], answer }. Mark each blank with "___", in order -- 1 to 3 blanks per question. 1 blank: answer is a single string matching one bank entry exactly. 2-3 blanks: answer is an array of strings in the same order as the blanks, each matching one bank entry exactly; the bank holds every blank's correct word plus distractors, up to 8 entries total.
- drag-drop: { type, prompt, image: null, pairs: [{item,match}, ...] (3-6 pairs), answer: {"<item>":"<match>", ...} }
- ordering: { type, prompt, image: null, items: [4-6 strings in correct order], answer: [same strings, in the correct order] }
Every question's "image" field must be null -- this batch is text-only by design.
`

const FAIRNESS_RULES = `
FAIRNESS & FORMAT RULES (apply strictly -- these caused real problems in an earlier batch):
- fill-blank (typed free-text answer) is BANNED -- it is not a supported type on this platform. Never produce it. Every question must be multiple-choice, true-false, word-bank, drag-drop, or ordering.
- Never use word-bank for a numeric/calculated answer, or any answer whose exact wording, units, or format could reasonably vary (e.g. a student typing "high" when the stored answer is "increased" would be marked wrong even though they're right). Convert these to multiple-choice instead, spelling the value/wording out in full inside each option, with plausible wrong options as distractors. Every word-bank blank should be a single, unambiguous term or short phrase with no reasonable alternative phrasing. A multi-blank (2-3) word-bank suits content that naturally names two or three distinct terms in one sentence -- don't force it otherwise.
- If a question can't be made fair and unambiguous within the 5 supported types even after simplifying, don't force it through on a guess -- flag it for human review instead (see verdict options below) rather than shipping something a student could reasonably get wrong purely from unclear wording rather than not knowing the biology.
`

const DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['multiple-choice', 'true-false', 'word-bank', 'drag-drop', 'ordering'] },
          prompt: { type: 'string' },
          options: {},
          bank: {},
          pairs: {},
          items: {},
          answer: {},
          hint: {},
        },
        required: ['type', 'prompt', 'answer'],
      },
    },
  },
  required: ['questions'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          index: { type: 'number', description: 'position of this question in the drafted array, 0-based' },
          verdict: { type: 'string', enum: ['confirmed', 'fixed', 'rejected', 'needs_review'] },
          question: {},
          issue: {},
        },
        required: ['index', 'verdict'],
      },
    },
  },
  required: ['results'],
}

function draftPrompt(inq, existingPrompts) {
  const existingBlock = existingPrompts && existingPrompts.length
    ? `\nQUESTIONS ALREADY IN THIS INQUIRY QUESTION'S BANK (do not repeat these ideas or near-duplicate their wording -- write genuinely different questions):\n${existingPrompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n`
    : ''
  return `You are writing an original revision question bank for NSW Year 11 Biology, for one specific inquiry question. This is NOT derived from any exam -- write fresh, syllabus-aligned questions from scratch.

MODULE: ${inq.module_title}
INQUIRY QUESTION ${inq.id}: ${inq.title}
"${inq.question}"

SYLLABUS CONTENT FOR THIS INQUIRY QUESTION (the actual NESA outcomes/skills to draw from):
${inq.syllabus}
${existingBlock}
${FORMAT_NOTES}
${FAIRNESS_RULES}
TASK: Write between 20 and 30 questions covering this inquiry question's syllabus content. Follow these rules exactly:

1. FOCUS ON CONCEPTS AND SKILLS, not obscure trivia. Every question should test understanding of a concept, process, or skill explicitly named in the syllabus content above -- not a random fact that happens to be true but isn't actually part of what's being taught. Include some questions that require applying a concept (e.g. "which process explains X observation" or a short scenario), not just pure definition recall -- but keep it text-only since there are no images in this batch.
2. NO TRICKERY. Keep the language fair and direct. Avoid: double negatives, deliberately ambiguous wording, "except" questions unless genuinely the clearest way to test the idea, distractors that are arguably also correct, trick phrasing designed to catch students out on a technicality rather than testing real understanding. A well-prepared student who understands the concept should be able to answer confidently -- the difficulty should come from the biology, not from parsing the question.
3. VARY THE QUESTION TYPE. Do not make most of these multiple-choice. Aim for roughly this spread across the batch: about a third multiple-choice, and meaningfully use every other type (true-false, word-bank, drag-drop matching, ordering) at least 2-3 times each. Let the content suggest the type -- a sequence of steps (e.g. stages of a process) suits ordering; a set of terms-to-definitions or structures-to-functions suits drag-drop matching; a key term (or, where the content naturally names 2-3 terms in one sentence, up to 3 terms) in context suits word-bank; a single true claim to evaluate suits true-false.
4. Every answer must be factually correct, unambiguous, and something you are confident about from biology knowledge at NSW Year 11 standard.
5. Do not include any image -- every question's image field is null.
6. Avoid duplicating each other within this batch (no two questions testing the exact same fact in slightly different words).

Return your result via the required schema (an array of 20-30 question objects, no image field needed since it's always null).`
}

function verifyPrompt(inq, draft) {
  return `You are QA-checking a freshly-written revision question bank for NSW Year 11 Biology before it goes live to students.

INQUIRY QUESTION ${inq.id}: ${inq.title} -- "${inq.question}"
SYLLABUS CONTENT IT SHOULD COVER:
${inq.syllabus}

DRAFTED QUESTIONS (0-indexed):
${JSON.stringify(draft.questions, null, 2)}
${FAIRNESS_RULES}
For EACH question, check:
1. Biological accuracy -- is the marked answer actually correct? Are any distractors arguably also correct (making the question unfair)?
2. Syllabus fit -- does it genuinely test something in the syllabus content above, not an unrelated fact?
3. Fairness -- no trick wording, double negatives, or answers that hinge on parsing rather than biology understanding. A well-prepared student should be able to answer confidently.
4. Format ambiguity -- does it use fill-blank (banned, must be rejected/fixed into another type) or a word-bank answer whose wording/format could reasonably vary? If so, either fix it (usually by converting to multiple-choice) or flag it.
5. Structural correctness for its type (multiple-choice answer exactly matches one option; word-bank answer exactly matches one bank entry for a single blank, or is an array of bank entries in blank order for 2-3 blanks; drag-drop answer keys exactly match pairs' item fields; ordering answer is a permutation of items in the correct order; true-false answer is "True" or "False").
6. image field is null (it must be -- this is a text-only batch).
7. Not a near-duplicate of another question in this same batch.

Verdicts: "confirmed" (correct as-is). "fixed" (you corrected a small problem -- return the full corrected question object with the same "index"). "needs_review" (a genuine fairness/format/accuracy concern you can't confidently resolve yourself -- return your best-effort question plus a clear "issue", so a human can decide). "rejected" (wrong answer you're not confident correcting, fundamentally unfair, or a duplicate) -- only for questions not worth surfacing at all.

Return one result per drafted question, matched by its 0-based "index" in the array above.`
}

const inquiries = args.inquiries || INQUIRIES
const existingByInquiry = args.existingByInquiry || {}

phase('Draft')
const results = await pipeline(
  inquiries,
  (inq) => agent(draftPrompt(inq, existingByInquiry[inq.id]), { label: `draft:${inq.id}`, phase: 'Draft', schema: DRAFT_SCHEMA }),
  (draft, inq) => {
    if (!draft || !draft.questions || draft.questions.length === 0) {
      return { inquiry_id: inq.id, module_id: inq.module_id, confirmed: [], needsReview: [] }
    }
    return agent(verifyPrompt(inq, draft), { label: `verify:${inq.id}`, phase: 'Verify', schema: VERIFY_SCHEMA })
      .then((verify) => {
        const confirmed = []
        const needsReview = []
        for (const r of (verify ? verify.results : [])) {
          if (r.verdict === 'rejected') continue
          const q = (r.verdict === 'fixed' || r.verdict === 'needs_review') && r.question ? r.question : draft.questions[r.index]
          if (!q) continue
          const tagged = { ...q, inquiry_id: inq.id, module_id: inq.module_id, image: null }
          if (r.verdict === 'needs_review') needsReview.push({ ...tagged, review_reason: r.issue || 'flagged for review by verifier' })
          else confirmed.push(tagged)
        }
        return { inquiry_id: inq.id, module_id: inq.module_id, confirmed, needsReview }
      })
  }
)

const allConfirmed = results.filter(Boolean).flatMap((r) => r.confirmed)
const allNeedsReview = results.filter(Boolean).flatMap((r) => r.needsReview || [])
const byInquiry = {}
for (const r of results.filter(Boolean)) byInquiry[r.inquiry_id] = r.confirmed.length

log(`Bank generation complete: ${allConfirmed.length} confirmed, ${allNeedsReview.length} need human review, across ${inquiries.length} inquiry questions`)

return { confirmed: allConfirmed, needsReview: allNeedsReview, countsByInquiry: byInquiry }
