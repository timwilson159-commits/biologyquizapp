export const meta = {
  name: 'year12-syllabus-bank',
  description: 'Generate an original, text-only Year 12 (Modules 5-8) question bank, 3-5 questions per individual syllabus outcome, no typed-answer questions',
  phases: [
    { title: 'Draft', detail: 'write 3-5 questions per syllabus outcome' },
    { title: 'Verify', detail: 'check each batch for accuracy, fairness, syllabus fit and type variety' },
  ],
}

// Each entry is ONE individual NESA syllabus outcome (the "*" bullet level, not
// the inquiry question level) -- much finer-grained than the Year 11 generator.
// `inquiry_id`/`module_id` are what actually get stored on each question row;
// `id` here is only used to label/track agents within this run.
// `context` carries named examples the teacher confirmed are safe to use, or
// an explicit instruction to stay generic / avoid a specific angle.
const OUTCOMES = [
  // ─── MODULE 5: HEREDITY ─────────────────────────────────────────────────
  {
    id: '5.1.o1', inquiry_id: '5.1', module_id: 'module-5', inquiry_title: 'Reproduction',
    question: 'How does reproduction ensure the continuity of a species?',
    outcome: `Explain the mechanisms of reproduction that ensure the continuity of a species, by analysing sexual and asexual methods of reproduction in a variety of organisms: animals (advantages of external vs internal fertilisation), plants (asexual and sexual reproduction), fungi (budding, spores), bacteria (binary fission), protists (binary fission, budding).`,
    context: `Cover all five groups named in the outcome (animals, plants, fungi, bacteria, protists) across the batch -- don't only test animals.`,
  },
  {
    id: '5.1.o2', inquiry_id: '5.1', module_id: 'module-5', inquiry_title: 'Reproduction',
    question: 'How does reproduction ensure the continuity of a species?',
    outcome: `Analyse the features of fertilisation, implantation and hormonal control of pregnancy and birth in mammals.`,
    context: `General mammalian reproductive biology: fertilisation, implantation in the uterine wall, and the roles of hormones (e.g. oestrogen, progesterone, oxytocin) in pregnancy and birth.`,
  },
  {
    id: '5.1.o3', inquiry_id: '5.1', module_id: 'module-5', inquiry_title: 'Reproduction',
    question: 'How does reproduction ensure the continuity of a species?',
    outcome: `Evaluate the impact of scientific knowledge on the manipulation of plant and animal reproduction in agriculture.`,
    context: `Keep generic -- selective breeding, artificial insemination, artificial pollination/grafting, embryo transfer as general agricultural techniques. No single mandatory case study.`,
  },
  {
    id: '5.2.o1', inquiry_id: '5.2', module_id: 'module-5', inquiry_title: 'Cell Replication',
    question: 'How important is it for genetic material to be replicated exactly?',
    outcome: `Model the processes involved in cell replication, including mitosis and meiosis, and DNA replication using the Watson and Crick DNA model, including nucleotide composition, pairing and bonding.`,
    context: `Covers: stages/order of mitosis and meiosis, purpose of each, complementary base pairing (A-T, G-C; hydrogen bonds), antiparallel strands, semi-conservative replication.`,
  },
  {
    id: '5.2.o2', inquiry_id: '5.2', module_id: 'module-5', inquiry_title: 'Cell Replication',
    question: 'How important is it for genetic material to be replicated exactly?',
    outcome: `Assess the effect of the cell replication processes on the continuity of species.`,
    context: `Why exact replication matters -- errors/mutations during replication and their consequences for offspring and species continuity.`,
  },
  {
    id: '5.3.o1', inquiry_id: '5.3', module_id: 'module-5', inquiry_title: 'DNA and Polypeptide Synthesis',
    question: 'Why is polypeptide synthesis important?',
    outcome: `Construct appropriate representations to model and compare the forms in which DNA exists in eukaryotes and prokaryotes.`,
    context: `E.g. linear chromosomal DNA packaged with histones in a nucleus (eukaryotes) vs a single circular chromosome free in the cytoplasm, sometimes with separate small circular plasmids (prokaryotes).`,
  },
  {
    id: '5.3.o2', inquiry_id: '5.3', module_id: 'module-5', inquiry_title: 'DNA and Polypeptide Synthesis',
    question: 'Why is polypeptide synthesis important?',
    outcome: `Model the process of polypeptide synthesis, including transcription and translation; assess the importance of mRNA and tRNA; analyse the function and importance of polypeptide synthesis; assess how genes and environment affect phenotypic expression.`,
    context: `Transcription (nucleus, mRNA), translation (ribosome, tRNA/anticodons, codons), why proteins matter functionally. For gene-environment interaction, you may use the classic temperature-sensitive coat-colour example (e.g. Siamese cat / Himalayan rabbit enzyme that only produces dark pigment in cooler extremities) -- briefly explain the example within the question itself rather than assuming students recall it.`,
  },
  {
    id: '5.3.o3', inquiry_id: '5.3', module_id: 'module-5', inquiry_title: 'DNA and Polypeptide Synthesis',
    question: 'Why is polypeptide synthesis important?',
    outcome: `Investigate the structure and function of proteins in living things.`,
    context: `Primary/secondary/tertiary/quaternary protein structure, and how structure relates to function (e.g. enzymes, structural proteins, transport proteins).`,
  },
  {
    id: '5.4.o1', inquiry_id: '5.4', module_id: 'module-5', inquiry_title: 'Genetic Variation',
    question: 'How can the genetic similarities and differences within and between species be compared?',
    outcome: `Conduct practical investigations to predict variations in the genotype of offspring by modelling meiosis, including the crossing over of homologous chromosomes, fertilisation and mutations.`,
    context: `This describes a practical/modelling activity -- write conceptual/applied questions (e.g. what crossing over does, when in meiosis it happens, why it increases variation) rather than questions about lab procedure.`,
  },
  {
    id: '5.4.o2', inquiry_id: '5.4', module_id: 'module-5', inquiry_title: 'Genetic Variation',
    question: 'How can the genetic similarities and differences within and between species be compared?',
    outcome: `Model the formation of new combinations of genotypes produced during meiosis, including interpreting examples of autosomal, sex-linkage, co-dominance, incomplete dominance and multiple alleles; constructing and interpreting pedigrees and Punnett squares.`,
    context: `You may use ABO human blood groups as the standard multiple-alleles/co-dominance example. Include at least one Punnett-square-style reasoning question and one pedigree-interpretation-style question.`,
  },
  {
    id: '5.4.o3', inquiry_id: '5.4', module_id: 'module-5', inquiry_title: 'Genetic Variation',
    question: 'How can the genetic similarities and differences within and between species be compared?',
    outcome: `Collect, record and present data to represent frequencies of characteristics in a population, e.g. examining frequency data, analysing single nucleotide polymorphism (SNP).`,
    context: `Keep generic: what a SNP is, why frequency data on a characteristic is collected/compared. Do not invent a specific named disease/SNP study.`,
  },
  {
    id: '5.5.o1', inquiry_id: '5.5', module_id: 'module-5', inquiry_title: 'Inheritance Patterns in a Population',
    question: 'Can population genetic patterns be predicted with any accuracy?',
    outcome: `Investigate the use of technologies to determine inheritance patterns in a population, e.g. DNA sequencing and profiling.`,
    context: `General concept level: what DNA sequencing/profiling reveal, why they're useful for tracking inheritance patterns. No need for lab-technique detail like gel electrophoresis steps.`,
  },
  {
    id: '5.5.o2', inquiry_id: '5.5', module_id: 'module-5', inquiry_title: 'Inheritance Patterns in a Population',
    question: 'Can population genetic patterns be predicted with any accuracy?',
    outcome: `Investigate the use of data analysis from a large-scale collaborative project to identify trends, patterns and relationships, e.g. population genetics in conservation management; inheritance of a disease/disorder; human evolution.`,
    context: `Keep generic/conceptual -- why large-scale collaborative genetic data sets are valuable for these three purposes. Do not invent a specific named project/study.`,
  },

  // ─── MODULE 6: GENETIC CHANGE ───────────────────────────────────────────
  {
    id: '6.1.o1', inquiry_id: '6.1', module_id: 'module-6', inquiry_title: 'Mutation',
    question: 'How does mutation introduce new alleles into a population?',
    outcome: `Explain how a range of mutagens operate, including electromagnetic radiation sources, chemicals, and naturally occurring mutagens.`,
  },
  {
    id: '6.1.o2', inquiry_id: '6.1', module_id: 'module-6', inquiry_title: 'Mutation',
    question: 'How does mutation introduce new alleles into a population?',
    outcome: `Compare the causes, processes and effects of different types of mutation: point mutation and chromosomal mutation.`,
    context: `Point mutation subtypes (substitution, insertion, deletion, and effects like frameshift) vs chromosomal mutation subtypes (deletion, duplication, inversion, translocation).`,
  },
  {
    id: '6.1.o3', inquiry_id: '6.1', module_id: 'module-6', inquiry_title: 'Mutation',
    question: 'How does mutation introduce new alleles into a population?',
    outcome: `Distinguish between somatic mutations and germ-line mutations and their effect on an organism.`,
  },
  {
    id: '6.1.o4', inquiry_id: '6.1', module_id: 'module-6', inquiry_title: 'Mutation',
    question: 'How does mutation introduce new alleles into a population?',
    outcome: `Assess the significance of 'coding' and 'non-coding' DNA segments in the process of mutation.`,
  },
  {
    id: '6.1.o5', inquiry_id: '6.1', module_id: 'module-6', inquiry_title: 'Mutation',
    question: 'How does mutation introduce new alleles into a population?',
    outcome: `Investigate the causes of genetic variation relating to the processes of fertilisation, meiosis and mutation.`,
  },
  {
    id: '6.1.o6', inquiry_id: '6.1', module_id: 'module-6', inquiry_title: 'Mutation',
    question: 'How does mutation introduce new alleles into a population?',
    outcome: `Evaluate the effect of mutation, gene flow and genetic drift on the gene pool of populations.`,
    context: `Genetic drift may be illustrated with the bottleneck effect and/or founder effect as the standard defining examples.`,
  },
  {
    id: '6.2.o1', inquiry_id: '6.2', module_id: 'module-6', inquiry_title: 'Biotechnology',
    question: "How do genetic techniques affect Earth's biodiversity?",
    outcome: `Investigate the uses and applications of biotechnology: analyse the social implications and ethical uses of biotechnology, including plant and animal examples; evaluate the potential benefits for society of research using genetic technologies; evaluate the changes to the Earth's biodiversity due to genetic techniques.`,
    context: `Confirmed worked examples: Golden Rice (plant -- genetically modified to produce beta-carotene/vitamin A to address deficiency) and AquAdvantage salmon, aka "super salmon" (animal -- genetically modified to grow faster). Briefly explain each within any question that relies on it. Do NOT write questions asking students to predict/research "future directions" of biotechnology -- that angle has been deliberately excluded as too speculative.`,
  },
  {
    id: '6.3.o1', inquiry_id: '6.3', module_id: 'module-6', inquiry_title: 'Genetic Technologies',
    question: 'Does artificial manipulation of DNA have the potential to change populations forever?',
    outcome: `Investigate the uses and advantages of current genetic technologies that induce genetic change.`,
    context: `General gene-editing concept level (e.g. CRISPR as a modern gene-editing tool) -- no need for molecular mechanism detail beyond what's typically taught at this level.`,
  },
  {
    id: '6.3.o2', inquiry_id: '6.3', module_id: 'module-6', inquiry_title: 'Genetic Technologies',
    question: 'Does artificial manipulation of DNA have the potential to change populations forever?',
    outcome: `Compare the processes and outcomes of reproductive technologies, including artificial insemination and artificial pollination.`,
  },
  {
    id: '6.3.o3', inquiry_id: '6.3', module_id: 'module-6', inquiry_title: 'Genetic Technologies',
    question: 'Does artificial manipulation of DNA have the potential to change populations forever?',
    outcome: `Investigate and assess the effectiveness of cloning, including whole organism cloning and gene cloning.`,
    context: `Confirmed worked example for whole-organism cloning: Dolly the sheep (created via somatic cell nuclear transfer, SCNT). Briefly explain the SCNT process within the question rather than assuming it's known.`,
  },
  {
    id: '6.3.o4', inquiry_id: '6.3', module_id: 'module-6', inquiry_title: 'Genetic Technologies',
    question: 'Does artificial manipulation of DNA have the potential to change populations forever?',
    outcome: `Describe techniques and applications used in recombinant DNA technology, e.g. the development of transgenic organisms in agricultural and medical applications.`,
    context: `Confirmed worked example: insulin-producing bacteria used to manufacture human insulin for treating diabetes. The teacher has specifically noted students may not already know the bacterium is E. coli -- every question using this example MUST explicitly state "E. coli" in the question text itself rather than just saying "bacteria".`,
  },
  {
    id: '6.3.o5', inquiry_id: '6.3', module_id: 'module-6', inquiry_title: 'Genetic Technologies',
    question: 'Does artificial manipulation of DNA have the potential to change populations forever?',
    outcome: `Evaluate the benefits of using genetic technologies in agricultural, medical and industrial applications.`,
  },
  {
    id: '6.3.o6', inquiry_id: '6.3', module_id: 'module-6', inquiry_title: 'Genetic Technologies',
    question: 'Does artificial manipulation of DNA have the potential to change populations forever?',
    outcome: `Evaluate the effect on biodiversity of using biotechnology in agriculture.`,
  },
  {
    id: '6.3.o7', inquiry_id: '6.3', module_id: 'module-6', inquiry_title: 'Genetic Technologies',
    question: 'Does artificial manipulation of DNA have the potential to change populations forever?',
    outcome: `Interpret a range of secondary sources to assess the influence of social, economic and cultural contexts on a range of biotechnologies.`,
    context: `This is a general source-evaluation/reasoning skill -- test it via short scenario-style questions (e.g. "which factor would most likely make a community reluctant to adopt X biotechnology") rather than requiring a specific named source.`,
  },

  // ─── MODULE 7: INFECTIOUS DISEASE ───────────────────────────────────────
  {
    id: '7.1.o1', inquiry_id: '7.1', module_id: 'module-7', inquiry_title: 'Causes of Infectious Disease',
    question: 'How are diseases transmitted?',
    outcome: `Describe a variety of infectious diseases caused by pathogens (microorganisms, macroorganisms, non-cellular pathogens); classify different pathogens that cause disease in plants and animals; investigate the transmission of a disease during an epidemic; investigate modes of transmission of infectious diseases: direct contact, indirect contact, vector transmission.`,
    context: `Pathogen categories: bacteria, viruses, fungi, protozoa (microorganisms), parasitic worms (macroorganisms), prions (non-cellular). You may use widely-known illustrative disease names (e.g. influenza, athlete's foot, malaria) purely as generic labels for a pathogen category or transmission mode -- not as an in-depth case study.`,
  },
  {
    id: '7.1.o2', inquiry_id: '7.1', module_id: 'module-7', inquiry_title: 'Causes of Infectious Disease',
    question: 'How are diseases transmitted?',
    outcome: `Investigate the work of Robert Koch and Louis Pasteur to explain the causes and transmission of infectious diseases: Koch's postulates, Pasteur's experiments on microbial contamination.`,
    context: `These two named scientists are the syllabus content itself, not an optional example -- include them directly (Koch's four postulates; Pasteur's swan-neck flask experiment disproving spontaneous generation).`,
  },
  {
    id: '7.1.o3', inquiry_id: '7.1', module_id: 'module-7', inquiry_title: 'Causes of Infectious Disease',
    question: 'How are diseases transmitted?',
    outcome: `Assess the causes and effects of diseases on agricultural production: plant diseases, animal diseases.`,
    context: `Keep generic (a fungal/bacterial/viral plant or animal disease reducing yield/production) -- no specific named case required.`,
  },
  {
    id: '7.1.o4', inquiry_id: '7.1', module_id: 'module-7', inquiry_title: 'Causes of Infectious Disease',
    question: 'How are diseases transmitted?',
    outcome: `Compare the adaptations of different pathogens that facilitate their entry into and transmission between hosts.`,
  },
  {
    id: '7.2.o1', inquiry_id: '7.2', module_id: 'module-7', inquiry_title: 'Responses to Pathogens',
    question: 'How does a plant or animal respond to infection?',
    outcome: `Analyse responses to the presence of pathogens by assessing the physical and chemical changes that occur in host animals' cells and tissues.`,
    context: `General animal innate response: inflammation, fever, clotting/scab formation, phagocytosis -- not the adaptive immune system (that's covered separately in 7.3).`,
  },
  {
    id: '7.3.o1', inquiry_id: '7.3', module_id: 'module-7', inquiry_title: 'Immunity',
    question: 'How does the human immune system respond to exposure to a pathogen?',
    outcome: `Investigate and model the innate and adaptive immune systems in the human body.`,
    context: `Innate: physical/chemical barriers, phagocytes, inflammation, fever, natural killer cells. Adaptive: B-cells/antibodies, T-cells, memory cells.`,
  },
  {
    id: '7.3.o2', inquiry_id: '7.3', module_id: 'module-7', inquiry_title: 'Immunity',
    question: 'How does the human immune system respond to exposure to a pathogen?',
    outcome: `Explain how the immune system responds after primary exposure to a pathogen, including innate and acquired immunity.`,
    context: `Primary vs secondary immune response, the role of memory cells in a faster/stronger secondary response.`,
  },
  {
    id: '7.4.o1', inquiry_id: '7.4', module_id: 'module-7', inquiry_title: 'Prevention, Treatment and Control',
    question: 'How can the spread of infectious diseases be controlled?',
    outcome: `Investigate and analyse the wide range of interrelated factors involved in limiting the local, regional and global spread of a named infectious disease.`,
    context: `Confirmed named diseases to use across this batch (spread across different questions, not all on one): COVID-19, influenza, and measles. For each, briefly state the relevant transmission/context detail within the question rather than assuming it.`,
  },
  {
    id: '7.4.o2', inquiry_id: '7.4', module_id: 'module-7', inquiry_title: 'Prevention, Treatment and Control',
    question: 'How can the spread of infectious diseases be controlled?',
    outcome: `Investigate procedures that can be employed to prevent the spread of disease: hygiene practices, quarantine, vaccination (including passive and active immunity), public health campaigns, use of pesticides, genetic engineering.`,
    context: `General procedures -- no named disease required. Make sure passive vs active immunity is clearly distinguished in at least one question.`,
  },
  {
    id: '7.4.o3', inquiry_id: '7.4', module_id: 'module-7', inquiry_title: 'Prevention, Treatment and Control',
    question: 'How can the spread of infectious diseases be controlled?',
    outcome: `Investigate and assess the effectiveness of pharmaceuticals as treatment strategies for the control of infectious disease: antivirals, antibiotics.`,
    context: `Include the concept of antibiotic resistance and why antibiotics don't work on viruses.`,
  },
  {
    id: '7.4.o4', inquiry_id: '7.4', module_id: 'module-7', inquiry_title: 'Prevention, Treatment and Control',
    question: 'How can the spread of infectious diseases be controlled?',
    outcome: `Investigate and evaluate environmental management and quarantine methods used to control an epidemic or pandemic.`,
    context: `Confirmed named example: COVID-19 (e.g. border closures, lockdowns, mask mandates, contact tracing). Briefly state relevant context within the question.`,
  },
  {
    id: '7.4.o5', inquiry_id: '7.4', module_id: 'module-7', inquiry_title: 'Prevention, Treatment and Control',
    question: 'How can the spread of infectious diseases be controlled?',
    outcome: `Interpret data relating to the incidence and prevalence of infectious disease in populations, e.g. mobility of individuals and the proportion that are immune/immunised; malaria.`,
    context: `Confirmed named example: malaria (mosquito-borne, prevalent in parts of South East Asia and other tropical regions). Frame as data-interpretation questions (e.g. reading/comparing incidence vs prevalence figures) rather than requiring memorised statistics.`,
  },
  {
    id: '7.4.o6', inquiry_id: '7.4', module_id: 'module-7', inquiry_title: 'Prevention, Treatment and Control',
    question: 'How can the spread of infectious diseases be controlled?',
    outcome: `Evaluate historical, culturally diverse and current strategies to predict and control the spread of disease.`,
    context: `General/historical (e.g. the historical origin of the word "quarantine" from 40-day ship isolation periods) -- keep broad, no need for one specific modern case.`,
  },
  {
    id: '7.4.o7', inquiry_id: '7.4', module_id: 'module-7', inquiry_title: 'Prevention, Treatment and Control',
    question: 'How can the spread of infectious diseases be controlled?',
    outcome: `Investigate the contemporary application of Aboriginal protocols in the development of particular medicines and biological materials in Australia, and how recognition and protection of Indigenous cultural and intellectual property is important.`,
    context: `IMPORTANT -- do NOT reference any specific named plant/compound/community case study (e.g. do not invent or assume details about "smoke bush" or any particular bush medicine). Write only general, respectful questions about: what bush medicine/traditional Indigenous medicinal knowledge broadly is; why this knowledge may hold value for future medical research; and the ethical protocols researchers should follow when engaging with Indigenous knowledge holders (e.g. informed consent, benefit-sharing agreements, recognition of Indigenous Cultural and Intellectual Property (ICIP), collaboration rather than extraction). Keep it factual and respectful -- if you are not confident a statement is accurate, do not include it; flag the question for review instead.`,
  },

  // ─── MODULE 8: NON-INFECTIOUS DISEASE AND DISORDERS ─────────────────────
  {
    id: '8.1.o1', inquiry_id: '8.1', module_id: 'module-8', inquiry_title: 'Homeostasis',
    question: "How is an organism's internal environment maintained in response to a changing external environment?",
    outcome: `Construct and interpret negative feedback loops that show homeostasis: temperature, glucose.`,
    context: `Thermoregulation (e.g. sweating, shivering, vasodilation/vasoconstriction) and blood glucose regulation (insulin/glucagon). Include at least one question ordering the steps of a feedback loop.`,
  },
  {
    id: '8.1.o2', inquiry_id: '8.1', module_id: 'module-8', inquiry_title: 'Homeostasis',
    question: "How is an organism's internal environment maintained in response to a changing external environment?",
    outcome: `Investigate the various mechanisms used by organisms to maintain their internal environment within tolerance limits: behavioural/structural/physiological adaptations in endotherms; internal coordination via hormones and neural pathways; mechanisms in plants that allow water balance to be maintained.`,
    context: `General adaptation types (e.g. insulating fur/fat, panting, countercurrent heat exchange in extremities; stomatal closure and other water-conservation mechanisms in plants) -- no need for one specific named species case study.`,
  },
  {
    id: '8.2.o1', inquiry_id: '8.2', module_id: 'module-8', inquiry_title: 'Causes and Effects',
    question: 'Do non-infectious diseases cause more deaths than infectious diseases?',
    outcome: `Investigate the causes and effects of non-infectious diseases in humans: genetic diseases, diseases caused by environmental exposure, nutritional diseases, cancer.`,
    context: `Test the four broad categories named in the outcome and what distinguishes them -- no single named disease is required for this outcome.`,
  },
  {
    id: '8.2.o2', inquiry_id: '8.2', module_id: 'module-8', inquiry_title: 'Causes and Effects',
    question: 'Do non-infectious diseases cause more deaths than infectious diseases?',
    outcome: `Collect and represent data to show the incidence, prevalence and mortality rates of non-infectious diseases, e.g. nutritional diseases, diseases caused by environmental exposure.`,
    context: `Define/distinguish incidence, prevalence and mortality rate, and test reading/interpreting this kind of data in general terms.`,
  },
  {
    id: '8.3.o1', inquiry_id: '8.3', module_id: 'module-8', inquiry_title: 'Epidemiology',
    question: 'Why are epidemiological studies used?',
    outcome: `Analyse patterns of non-infectious diseases in populations, including their incidence and prevalence: nutritional diseases, diseases caused by environmental exposure.`,
  },
  {
    id: '8.3.o2', inquiry_id: '8.3', module_id: 'module-8', inquiry_title: 'Epidemiology',
    question: 'Why are epidemiological studies used?',
    outcome: `Investigate the treatment/management, and possible future directions for further research, of a non-infectious disease using an example.`,
    context: `Confirmed example: skin cancer (melanoma) -- treatment/management approaches (e.g. surgical removal, immunotherapy, early detection via skin checks) and general future research directions (e.g. improved early-detection technology).`,
  },
  {
    id: '8.3.o3', inquiry_id: '8.3', module_id: 'module-8', inquiry_title: 'Epidemiology',
    question: 'Why are epidemiological studies used?',
    outcome: `Evaluate the method used in an example of an epidemiological study.`,
    context: `Write GENERIC epidemiological-method questions (e.g. cohort vs case-control study design, sample size, confounding variables, correlation vs causation) framed around skin cancer/melanoma research as the applied context -- do not invent or name one specific real historical study.`,
  },
  {
    id: '8.3.o4', inquiry_id: '8.3', module_id: 'module-8', inquiry_title: 'Epidemiology',
    question: 'Why are epidemiological studies used?',
    outcome: `Evaluate, using examples, the benefits of engaging in an epidemiological study.`,
    context: `Frame around skin cancer/melanoma (e.g. identifying UV exposure as a risk factor informs public prevention campaigns) -- keep the underlying benefit-of-epidemiology reasoning generic and transferable.`,
  },
  {
    id: '8.4.o1', inquiry_id: '8.4', module_id: 'module-8', inquiry_title: 'Prevention',
    question: 'How can non-infectious diseases be prevented?',
    outcome: `Use secondary sources to evaluate the effectiveness of current disease-prevention methods and develop strategies for the prevention of a non-infectious disease: educational programs and campaigns, genetic engineering.`,
    context: `Confirmed example: skin cancer prevention via sun-safety education campaigns (e.g. Australia's "SunSmart"/"Slip, Slop, Slap") -- explain the campaign briefly within the question. You may also touch on genetic engineering as a prevention angle in general terms.`,
  },
  {
    id: '8.5.o1', inquiry_id: '8.5', module_id: 'module-8', inquiry_title: 'Technologies and Disorders',
    question: 'How can technologies be used to assist people who experience disorders?',
    outcome: `Explain a range of causes of disorders by investigating the structures and functions of the relevant organs: hearing loss, visual disorders, loss of kidney function.`,
    context: `These three named disorder categories are the syllabus content itself -- cover all three across the batch (ear structure/hearing loss, eye structure/visual disorders, kidney/nephron structure and function).`,
  },
  {
    id: '8.5.o2', inquiry_id: '8.5', module_id: 'module-8', inquiry_title: 'Technologies and Disorders',
    question: 'How can technologies be used to assist people who experience disorders?',
    outcome: `Investigate technologies that are used to assist with the effects of a disorder: hearing loss (cochlear implants, bone conduction implants, hearing aids); visual disorders (spectacles, laser surgery); loss of kidney function (dialysis).`,
    context: `These specific technologies are named directly by the syllabus -- use them directly. Cover more than one category across the batch.`,
  },
  {
    id: '8.5.o3', inquiry_id: '8.5', module_id: 'module-8', inquiry_title: 'Technologies and Disorders',
    question: 'How can technologies be used to assist people who experience disorders?',
    outcome: `Evaluate the effectiveness of a technology that is used to manage and assist with the effects of a disorder.`,
    context: `Reuse the same technologies as 8.5.o2 (cochlear implants, spectacles/laser surgery, dialysis) -- frame as evaluate-effectiveness/limitations questions rather than pure recall.`,
  },
]

const FORMAT_NOTES = `
Platform question types and their JSON shape (NO fill-blank / typed-answer type exists in this batch -- every question must be one of these five):
- multiple-choice: { type, prompt, image: null, options: [4 strings], answer: <one of options, exact string match> }
- true-false: { type, prompt, image: null, options: ["True","False"], answer: "True"|"False" }
- word-bank: { type, prompt, image: null, bank: [3-8 strings: the correct word(s) + distractors], answer }. Mark each blank with "___", in order -- 1 to 3 blanks per question. 1 blank: answer is a single string matching one bank entry exactly. 2-3 blanks: answer is an array of strings in the same order as the blanks, each matching one bank entry exactly; the bank holds every blank's correct word plus distractors, up to 8 entries total.
- drag-drop: { type, prompt, image: null, pairs: [{item,match}, ...] (3-6 pairs), answer: {"<item>":"<match>", ...} }
- ordering: { type, prompt, image: null, items: [4-6 strings in correct order], answer: [same strings, in the correct order] }
Every question's "image" field must be null -- this batch is text-only by design (no image generation).
`

const FAIRNESS_RULES = `
FAIRNESS & FORMAT RULES (apply strictly):
- NEVER produce a fill-blank or any question requiring a typed free-text answer. Every question must be multiple-choice, true-false, word-bank, drag-drop, or ordering.
- Never use word-bank for a numeric/calculated answer, or any answer whose exact wording could reasonably vary. Every blank must be a single, unambiguous term or short phrase with no reasonable alternative phrasing. If in doubt, use multiple-choice instead, spelling the value/wording out in full inside each option. A multi-blank (2-3) word-bank is a good fit when the outcome naturally names two or three distinct terms in one sentence -- don't force it onto content that only has one natural blank.
- Across this outcome's 3-5 questions, vary the type where the content naturally suits it -- don't make every single one multiple-choice, but also don't force an unnatural fit (e.g. don't invent a strained "ordering" question for content that has no real sequence) just for variety in such a small batch.
- If a named example is specified in this outcome's context, use ONLY that example -- do not substitute a different real-world case, and do not invent details about it you're not confident are accurate. If a question depends on a background fact about the example (e.g. which organism/bacterium is involved), state that fact within the question text itself rather than assuming the student already knows it.
- If a question can't be made fair and unambiguous within the 5 supported types, don't force it through on a guess -- flag it for human review instead (see verdict options below) rather than shipping something a student could get wrong purely from unclear wording rather than not knowing the biology.
- This is Year 12 (HSC) content -- appropriately more sophisticated than Year 11, but still fair and confidence-building: no trick wording, double negatives, or "except" questions unless genuinely the clearest way to test the idea.
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

function draftPrompt(o) {
  return `You are writing an original revision question bank for NSW Year 12 Biology, for ONE SPECIFIC syllabus outcome (a single NESA dot point) -- not a whole inquiry question. This is NOT derived from any exam -- write fresh, syllabus-aligned questions from scratch.

INQUIRY QUESTION ${o.inquiry_id}: ${o.inquiry_title} -- "${o.question}"

THE SPECIFIC SYLLABUS OUTCOME TO WRITE QUESTIONS FOR:
${o.outcome}
${o.context ? `\nCONTEXT / CONSTRAINTS FOR THIS OUTCOME (follow exactly):\n${o.context}\n` : ''}
${FORMAT_NOTES}
${FAIRNESS_RULES}
TASK: Write between 3 and 5 questions testing understanding of this ONE outcome. Follow these rules:

1. FOCUS ON THIS OUTCOME ONLY, not the whole inquiry question. Every question should test the concept/skill named in the outcome text above.
2. FOCUS ON CONCEPTS, not obscure trivia. Include at least one question that requires applying the concept (e.g. a short scenario or "which process explains X"), not just pure definition recall -- but keep it text-only since there are no images in this batch.
3. NO TRICKERY. A well-prepared student who understands the concept should be able to answer confidently.
4. Every answer must be factually correct, unambiguous, and something you are confident about at NSW Year 12 (HSC) standard.
5. Do not include any image -- every question's image field is null.
6. Avoid duplicating each other within this batch (no two questions testing the exact same fact in slightly different words).
7. Do not invent or assume a real-world example/case study beyond what's given in the context above (if any). If no example is given and the outcome doesn't need one, stay conceptual.

Return your result via the required schema (an array of 3-5 question objects, no image field needed since it's always null).`
}

function verifyPrompt(o, draft) {
  return `You are QA-checking a freshly-written revision question bank for NSW Year 12 Biology before it goes live to students.

INQUIRY QUESTION ${o.inquiry_id}: ${o.inquiry_title} -- "${o.question}"
THE SPECIFIC SYLLABUS OUTCOME IT SHOULD COVER:
${o.outcome}
${o.context ? `\nCONTEXT / CONSTRAINTS THIS BATCH WAS WRITTEN UNDER:\n${o.context}\n` : ''}
DRAFTED QUESTIONS (0-indexed):
${JSON.stringify(draft.questions, null, 2)}
${FAIRNESS_RULES}
For EACH question, check:
1. Biological accuracy at Year 12 (HSC) standard -- is the marked answer actually correct? Are any distractors arguably also correct (making the question unfair)?
2. Syllabus fit -- does it genuinely test the specific outcome above, not a different outcome or an unrelated fact?
3. NOT a typed-answer question -- reject anything that isn't multiple-choice/true-false/word-bank/drag-drop/ordering.
4. Fairness -- no trick wording, double negatives, or answers that hinge on parsing rather than biology understanding.
5. Example compliance -- if the context above specifies a named example (or explicitly forbids one, e.g. the Aboriginal-protocols outcome), confirm the question sticks to exactly what was specified. Flag anything that invents an unauthorised specific example or an unverifiable factual claim.
6. Format ambiguity -- does it violate the fairness rule about word-bank answers whose wording could reasonably vary? If so, fix (usually by converting to multiple-choice) or flag.
7. Structural correctness for its type (multiple-choice/word-bank answer exactly matches one option/bank entry; drag-drop answer keys exactly match pairs' item fields; ordering answer is a permutation of items in the correct order; true-false answer is "True" or "False").
8. image field is null.
9. Not a near-duplicate of another question in this same batch.

Verdicts: "confirmed" (correct as-is). "fixed" (you corrected a small problem -- return the full corrected question object with the same "index"). "needs_review" (a genuine fairness/format/accuracy/sensitivity concern you can't confidently resolve yourself -- return your best-effort question plus a clear "issue"). "rejected" (wrong answer you're not confident correcting, fundamentally unfair, a typed-answer question, or a duplicate) -- only for questions not worth surfacing at all.

Return one result per drafted question, matched by its 0-based "index" in the array above.`
}

phase('Draft')
const results = await pipeline(
  OUTCOMES,
  (o) => agent(draftPrompt(o), { label: `draft:${o.id}`, phase: 'Draft', schema: DRAFT_SCHEMA }),
  (draft, o) => {
    if (!draft || !draft.questions || draft.questions.length === 0) {
      return { outcome_id: o.id, inquiry_id: o.inquiry_id, module_id: o.module_id, confirmed: [], needsReview: [] }
    }
    return agent(verifyPrompt(o, draft), { label: `verify:${o.id}`, phase: 'Verify', schema: VERIFY_SCHEMA })
      .then((verify) => {
        const confirmed = []
        const needsReview = []
        for (const r of (verify ? verify.results : [])) {
          if (r.verdict === 'rejected') continue
          const q = (r.verdict === 'fixed' || r.verdict === 'needs_review') && r.question ? r.question : draft.questions[r.index]
          if (!q) continue
          const tagged = { ...q, inquiry_id: o.inquiry_id, module_id: o.module_id, image: null }
          if (r.verdict === 'needs_review') needsReview.push({ ...tagged, review_reason: r.issue || 'flagged for review by verifier', outcome_id: o.id })
          else confirmed.push(tagged)
        }
        return { outcome_id: o.id, inquiry_id: o.inquiry_id, module_id: o.module_id, confirmed, needsReview }
      })
  }
)

const allConfirmed = results.filter(Boolean).flatMap((r) => r.confirmed)
const allNeedsReview = results.filter(Boolean).flatMap((r) => r.needsReview || [])
const countsByOutcome = {}
for (const r of results.filter(Boolean)) countsByOutcome[r.outcome_id] = r.confirmed.length

log(`Year 12 bank generation complete: ${allConfirmed.length} confirmed, ${allNeedsReview.length} need human review, across ${OUTCOMES.length} syllabus outcomes`)

return { confirmed: allConfirmed, needsReview: allNeedsReview, countsByOutcome }
