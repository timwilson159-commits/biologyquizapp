"""
Extractor for official NESA "HSC Examinations" past-paper exports (as opposed
to the trial-exam exports exam_extractor.py was built for). Differences that
make this a separate script rather than a mode of exam_extractor.py:

  - The exam paper and the marking guidelines ("Answers") are two SEPARATE
    HTML files, not one file with a repeated "solutions booklet" section.
  - The exam file has no colour-highlighted correct answers at all -- every
    line uses the same dark-grey body colour, so exam_extractor's "non-black
    = highlighted" heuristic produces 100% false positives here. This script
    ignores colour entirely and instead trusts two ground-truth tables NESA
    publishes in the Answers file: the "Multiple-choice Answer Key" (Question
    -> option letter) and the "Mapping Grid" (Question -> Module/Content ->
    syllabus outcomes).
  - We only care about Section I (the 20 multiple-choice questions) for this
    pipeline -- Section II (extended response) is out of scope.

Usage:
    python hsc_extractor.py <exam.html> <answers.html> <year-folder-name> <out.json>

<year-folder-name> is the bare folder the exam's images live in (e.g. "2024"),
used to build the [[IMG:...]] filenames back into plain filenames.
"""
import re
import sys
import json
import os

sys.path.insert(0, os.path.dirname(__file__))
from exam_extractor import build_transcript, images_in

START_MARKER = "Use the multiple-choice answer sheet"
END_MARKER = "Section II Answer Booklet"

PAGE_FURNITURE_RES = [
    re.compile(r"^BLANK PAGE$"),
    re.compile(r"^[–-]\s*\d+\s*[–-]$"),
    re.compile(r"^©?\s*\d{4} NSW Education Standards Authority$"),
]

# Canonical Year 12 (Modules 5-8) inquiry list, matching MODULE_DEFS in the
# live app and the inquiry_id/module_id values already used by
# tools/workflow_year12_bank.js. Mapping Grid "Content" cells match these
# titles closely but not always exactly (e.g. "Cause of Infectious Disease"
# vs "Causes of Infectious Disease") -- ALIASES covers observed variants.
INQUIRY_TITLES = {
    "module-5": {"5.1": "Reproduction", "5.2": "Cell Replication", "5.3": "DNA and Polypeptide Synthesis",
                 "5.4": "Genetic Variation", "5.5": "Inheritance Patterns in a Population"},
    "module-6": {"6.1": "Mutation", "6.2": "Biotechnology", "6.3": "Genetic Technologies"},
    "module-7": {"7.1": "Causes of Infectious Disease", "7.2": "Responses to Pathogens", "7.3": "Immunity",
                 "7.4": "Prevention, Treatment and Control"},
    "module-8": {"8.1": "Homeostasis", "8.2": "Causes and Effects", "8.3": "Epidemiology", "8.4": "Prevention",
                 "8.5": "Technologies and Disorders"},
}
ALIASES = {
    "cause of infectious disease": "causes of infectious disease",
    "cause and responses": "causes and effects",
    "technology and disorders": "technologies and disorders",
}


def build_title_lookup():
    lookup = {}
    for module_id, inquiries in INQUIRY_TITLES.items():
        for inquiry_id, title in inquiries.items():
            lookup[title.strip().lower()] = (inquiry_id, module_id)
    return lookup


def resolve_inquiry(content_cell):
    """'Mod 7 Prevention, Treatment and Control' -> ('7.4', 'module-7') or None
    for ONE 'Mod N <title>' fragment."""
    m = re.match(r"Mod\s*(\d)\s+(.*)", content_cell.strip())
    if not m:
        return None
    title = m.group(2).strip().lower()
    title = ALIASES.get(title, title)
    lookup = build_title_lookup()
    return lookup.get(title)


def resolve_inquiry_candidates(content_cell):
    """A mapping-grid content cell may list more than one 'Mod N <title>'
    fragment when a question genuinely draws on two modules -- these can be
    joined by '; ' (separate <p>s, via strip_cell) or, in at least one real
    export, simply glued together with no separator at all ('Mod 5 Cell
    replication Mod 6 Mutation'). Split on every 'Mod <digit>' boundary
    regardless of what's between them, then resolve each fragment."""
    fragments = re.split(r"(?=Mod\s*\d\s)", content_cell)
    candidates = []
    for fragment in fragments:
        fragment = fragment.strip(" ;")
        if not fragment:
            continue
        resolved = resolve_inquiry(fragment)
        if resolved and resolved not in candidates:
            candidates.append(resolved)
    return candidates


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s).strip()


def strip_cell(cell_html):
    """A <td> can contain multiple <p> paragraphs (e.g. a question mapped to
    TWO modules, one per line) -- join them with '; ' instead of losing the
    boundary by stripping all tags at once."""
    paras = re.findall(r"<p\b.*?</p>", cell_html, re.S)
    if not paras:
        return strip_tags(cell_html)
    texts = [strip_tags(p) for p in paras]
    return "; ".join(t for t in texts if t)


def table_rows_after(html, anchor_text, stop_text=None):
    """Find the first <table> occurring after the first occurrence of
    anchor_text (and, if stop_text given, before its first occurrence after
    the anchor) and return a list of rows, each a list of cell text strings."""
    start = html.find(anchor_text)
    if start == -1:
        return []
    region_end = len(html)
    if stop_text:
        stop_pos = html.find(stop_text, start + len(anchor_text))
        if stop_pos != -1:
            region_end = stop_pos
    table_start = html.find("<table", start, region_end)
    if table_start == -1:
        return []
    table_end = html.find("</table>", table_start, region_end)
    if table_end == -1:
        table_end = region_end
    table_html = html[table_start:table_end]
    rows = []
    for row_m in re.finditer(r"<tr\b.*?</tr>", table_html, re.S):
        cells = [strip_cell(c) for c in re.findall(r"<td\b.*?</td>", row_m.group(0), re.S)]
        if cells:
            rows.append(cells)
    return rows


def parse_answer_key(answers_html):
    rows = table_rows_after(answers_html, "Multiple-choice Answer Key")
    key = {}
    for cells in rows[1:]:  # skip header row
        if len(cells) >= 2 and cells[0].strip().isdigit():
            key[cells[0].strip()] = cells[1].strip()
    return key


def parse_mapping_grid(answers_html):
    """Section I rows only (plain numeric question numbers, no lettered
    sub-parts) -- Section II uses e.g. '21 (a)' which .isdigit() rejects."""
    rows = table_rows_after(answers_html, "Mapping Grid", stop_text="Section II")
    mapping = {}
    unresolved = []
    for cells in rows[1:]:
        if len(cells) < 4 or not cells[0].strip().isdigit():
            continue
        qnum, marks, content, outcomes = cells[0].strip(), cells[1].strip(), cells[2].strip(), cells[3].strip()
        candidates = resolve_inquiry_candidates(content)
        entry = {"content": content, "outcomes": outcomes}
        if len(candidates) == 1:
            entry["inquiry_id"], entry["module_id"] = candidates[0]
        else:
            # 0 candidates (title didn't match any alias) or 2+ (genuinely
            # spans multiple modules) -- both need a human/agent judgement
            # call rather than a silent guess; surface the raw options.
            entry["candidates"] = [{"inquiry_id": i, "module_id": m} for i, m in candidates]
            unresolved.append((qnum, content))
        mapping[qnum] = entry
    return mapping, unresolved


def extract_section1_text(exam_html):
    transcript = build_transcript(exam_html)
    # Colour markers are noise for HSC papers (whole doc is one dark-grey, not
    # a true highlight) -- strip the wrapper but keep the text inside.
    transcript = re.sub(r"\*\*\{color:[^}]*\}", "", transcript)
    transcript = transcript.replace("**", "")

    start = transcript.find(START_MARKER)
    end = transcript.find(END_MARKER, start if start != -1 else 0)
    if start == -1 or end == -1:
        raise ValueError(f"Could not find Section I boundaries (start={start}, end={end})")
    section = transcript[start:end]

    lines = []
    for line in section.split("\n"):
        line = line.strip()
        if not line or any(p.match(line) for p in PAGE_FURNITURE_RES):
            continue
        lines.append(line)
    return "\n".join(lines)


def main():
    exam_path, answers_path, year_folder, out_path = sys.argv[1:5]
    with open(exam_path, encoding="utf-8", errors="ignore") as f:
        exam_html = f.read()
    with open(answers_path, encoding="utf-8", errors="ignore") as f:
        answers_html = f.read()

    section1_text = extract_section1_text(exam_html)
    images = images_in(section1_text)
    answer_key = parse_answer_key(answers_html)
    mapping, unresolved = parse_mapping_grid(answers_html)

    result = {
        "year": year_folder,
        "exam_slug": f"hsc-{year_folder}",
        "image_folder": year_folder,
        "section1_text": section1_text,
        "images": images,
        "answer_key": answer_key,
        "mapping": mapping,
    }
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"{year_folder}: section1_text {len(section1_text)} chars, {len(images)} images, "
          f"{len(answer_key)} answer-key rows, {len(mapping)} mapping-grid rows")
    if unresolved:
        print(f"  UNRESOLVED content -> inquiry mappings ({len(unresolved)}):")
        for qnum, content in unresolved:
            print(f"    Q{qnum}: {content!r}")
    missing_answers = [q for q in mapping if q not in answer_key]
    if missing_answers:
        print(f"  Questions with mapping but no answer-key entry: {missing_answers}")


if __name__ == "__main__":
    main()
