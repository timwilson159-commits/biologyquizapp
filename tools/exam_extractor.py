"""
Reusable extractor for the PDF->HTML exam exports in "Year 11 Exams/HTML Exams".

Turns a messy, position-styled export into:
  1. A clean linear text transcript, with:
       - [[IMG:relative/path/to/Image_NNN.ext]] markers left in reading order
       - Any text styled with a non-black colour wrapped as **{color:#RRGGBB}text**
         (generic signal for "this is highlighted" -- e.g. a marked correct answer --
         without hardcoding any specific school's convention)
  2. A rough split into chunks ready to hand to a drafting agent:
       - One chunk per "Question N (" block in the extended-response section
         (mechanical, page-order boundaries -- no reading required)
       - The whole multiple-choice section as 2-3 roughly-even chunks (MCQs have
         no per-question marker text, so an agent segments them itself)
     Each chunk carries the list of image filenames it references.

Usage:
    python exam_extractor.py "<path to exam .html>" "<output .json path>"
"""
import re
import sys
import json
import os


def parse_style_block(html_content):
    """Parse `<style>` rules into (class_colors, tag_colors) dicts of name -> hex
    colour, for any rule with a non-black `color`. Handles comma-separated
    selector lists (e.g. ".h4, h4 { color: #C00000; }" applies to BOTH the
    ".h4" class and the bare <h4> tag)."""
    head_end = html_content.find("</head>")
    style_block = html_content[:head_end] if head_end != -1 else ""

    class_colors = {}
    tag_colors = {}
    for m in re.finditer(r"([^{}]+)\{([^}]*)\}", style_block):
        selector_list, body = m.group(1), m.group(2)
        cm = re.search(r"color:\s*(#[0-9A-Fa-f]{3,6})", body)
        if not cm or cm.group(1).lower() in ("#000", "#000000"):
            continue
        color = cm.group(1)
        for sel in selector_list.split(","):
            sel = sel.strip()
            if sel.startswith("."):
                cls_name = re.match(r"\.([\w-]+)", sel)
                if cls_name:
                    class_colors[cls_name.group(1)] = color
            elif re.fullmatch(r"[a-zA-Z][a-zA-Z0-9]*", sel):
                tag_colors[sel] = color
    return class_colors, tag_colors


def strip_inner(s):
    return re.sub(r"<[^>]+>", "", s)


def build_transcript(html_content):
    class_colors, tag_colors = parse_style_block(html_content)

    body_idx = html_content.find("<body")
    content = html_content[body_idx:] if body_idx != -1 else html_content

    # image markers
    def img_marker(m):
        src = re.search(r'src="([^"]+)"', m.group(0))
        return f'\n[[IMG:{src.group(1) if src else "?"}]]\n' if src else ""
    content = re.sub(r"<img[^>]*>", img_marker, content)

    # highlight any bare tag with a colour rule (e.g. <h4>) regardless of attrs
    for tag, color in tag_colors.items():
        if tag in ("body", "html"):
            continue
        content = re.sub(
            rf"<{tag}\b[^>]*>(.*?)</{tag}>",
            lambda m, c=color: f"\n**{{color:{c}}}{strip_inner(m.group(1))}**\n",
            content, flags=re.S,
        )

    # highlight elements carrying a class with a colour rule
    if class_colors:
        class_pattern = "|".join(re.escape(c) for c in class_colors)
        tag_re = re.compile(
            r'<(span|p|td|li)\b([^>]*\bclass="(?:' + class_pattern + r')"[^>]*)>(.*?)</\1>',
            re.S,
        )
        def class_repl(m):
            cls_match = re.search(r'class="([^"]+)"', m.group(2))
            cls = cls_match.group(1) if cls_match else ""
            color = class_colors.get(cls, "?")
            return f"\n**{{color:{color}}}{strip_inner(m.group(3))}**\n"
        prev = None
        guard = 0
        while prev != content and guard < 10:
            prev = content
            content = tag_re.sub(class_repl, content)
            guard += 1

    # any remaining inline color:#RRGGBB not already caught (skip black)
    def inline_repl(m):
        color = m.group(1)
        if color.lower() in ("#000", "#000000"):
            return m.group(0)
        return f"**{{color:{color}}}{strip_inner(m.group(2))}**"
    content = re.sub(
        r'<span[^>]*color:\s*(#[0-9A-Fa-f]{3,6})[^>]*>(.*?)</span>',
        inline_repl, content, flags=re.S,
    )

    content = re.sub(r"<(p|h[1-6]|tr|li|td|/table|table)\b", r"\n<\1", content)
    text = re.sub(r"<[^>]+>", "", content)
    text = re.sub(r"&amp;", "&", text)
    text = re.sub(r"&#39;", "'", text)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"&micro;", "u", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\*\*\{color:[^}]*\}\s*\*\*", "", text)
    text = re.sub(r"\n[ \t]*\n+", "\n", text)
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    return "\n".join(lines)


def images_in(chunk_text):
    return re.findall(r"\[\[IMG:([^\]]+)\]\]", chunk_text)


def split_chunks(transcript, exam_title_hint=None):
    """Split into: MCQ section (2-3 even chunks) + one chunk per extended-response
    'Question N (' block, using only the ORIGINAL exam occurrence of each (first
    time it appears), not any repeated solutions copy."""
    chunks = []

    q_markers = [(m.start(), m.group(1)) for m in re.finditer(r"\nQuestion (\d+) \(", "\n" + transcript)]
    ext_start = q_markers[0][0] if q_markers else None

    # The MCQ section is normally printed twice: once as asked (no answers marked)
    # and once inside the solutions booklet (correct option highlighted -- see the
    # **{color:...}** markers from build_transcript). We need the SECOND copy, since
    # that's the only one carrying the answer. It sits between the two "End of
    # Section I" markers (response-booklet filler pages in between are harmless
    # noise -- the drafting agent will recognise blank bubble lists and ignore them).
    end_positions = [m.start() for m in re.finditer(r"End of Section I", transcript)]
    if len(end_positions) >= 2:
        region = transcript[end_positions[-2]: end_positions[-1]]
    elif len(end_positions) == 1:
        region = transcript[:end_positions[0]]  # no solutions copy -- best effort, unanswered
    else:
        region = transcript[:ext_start] if ext_start else transcript

    # Within `region` there is usually a blank answer-booklet page ("Select the
    # alternative... fill in the response circle completely" followed by a bare
    # "1. A B C D / 2. A B C D / ...") BEFORE the actual solutions-highlighted
    # Q1-15 content -- so take the LAST match of the instructions phrase, not the
    # first, so we land on the real (answered) copy.
    start_matches = list(re.finditer(r"Select the alternative|Fill in the response (circle|oval) completely\.", region))
    mcq_text = region[start_matches[-1].start():] if start_matches else region

    lines = mcq_text.split("\n")
    n = len(lines)
    if n > 0:
        num_pieces = 3 if n > 90 else 2 if n > 30 else 1
        size = max(1, n // num_pieces)
        for i in range(num_pieces):
            piece_lines = lines[i * size: None if i == num_pieces - 1 else (i + 1) * size]
            piece = "\n".join(piece_lines)
            if piece.strip():
                chunks.append({
                    "chunk_id": f"MCQ-part{i+1}",
                    "kind": "multiple_choice_section",
                    "text": piece,
                    "images": images_in(piece),
                })

    # extended response: one chunk per Question N. Most exams state each question
    # once (as-asked) then repeat the whole section again with marking criteria /
    # sample answers filled in (a "solutions booklet" appended to the same file).
    # Pair up occurrence #1 (the question) with occurrence #2 (its solution) so the
    # drafting agent gets both the clean question AND the ground-truth answer,
    # without swallowing unrelated pages (blank answer sheets, cover pages, etc.)
    # in between.
    if q_markers:
        positions_by_num = {}
        order = []
        for pos, num in q_markers:
            if num not in positions_by_num:
                positions_by_num[num] = []
                order.append(num)
            positions_by_num[num].append(pos)

        end_of_exam = transcript.find("End of examination")
        doc_end = end_of_exam if end_of_exam != -1 else len(transcript)
        # Where the whole "solutions booklet" replay begins: the 2nd occurrence of
        # the very first question number (since the replay restates Q16, 17, 18...
        # in the same order). The LAST original question's occurrence-0 must be
        # capped here -- NOT at its own 2nd occurrence, which comes much later
        # since the replay runs through every other question first.
        first_num = order[0]
        first_num_positions = positions_by_num[first_num]
        solutions_start = first_num_positions[1] if len(first_num_positions) > 1 else doc_end
        # The LAST original question is immediately followed by an "Extra page:"
        # (working space) marker, then a whole repeated MCQ-solutions section
        # before the extended-response solutions replay begins -- so cap there
        # too, whichever comes first.
        extra_page_pos = transcript.find("Extra page")
        if extra_page_pos != -1:
            solutions_start = min(solutions_start, extra_page_pos)

        def bound_of(occurrence_index, num):
            """End boundary for `occurrence_index`-th occurrence of question `num`:
            the same occurrence-index position of the next question number if there
            is one; otherwise (this is the last question) fall back to the start of
            the solutions replay (for occurrence 0) or the end of the exam (for
            occurrence 1+)."""
            idx = order.index(num)
            if idx + 1 < len(order):
                next_positions = positions_by_num[order[idx + 1]]
                if occurrence_index < len(next_positions):
                    return next_positions[occurrence_index]
                return next_positions[-1]
            return solutions_start if occurrence_index == 0 else doc_end

        for num in order:
            occs = positions_by_num[num]
            piece = transcript[occs[0]: bound_of(0, num)]
            if len(occs) > 1:
                sol_piece = transcript[occs[1]: bound_of(1, num)]
                piece = piece + "\n\n--- MARKING CRITERIA / SOLUTIONS FOR THIS QUESTION ---\n\n" + sol_piece
            chunks.append({
                "chunk_id": f"Q{num}",
                "kind": "extended_response_question",
                "text": piece,
                "images": images_in(piece),
            })

    return chunks


def main():
    html_path = sys.argv[1]
    out_path = sys.argv[2]
    with open(html_path, encoding="utf-8", errors="ignore") as f:
        html_content = f.read()
    transcript = build_transcript(html_content)
    chunks = split_chunks(transcript)
    exam_dir = os.path.splitext(os.path.basename(html_path))[0]
    result = {"exam_folder_name": exam_dir, "chunk_count": len(chunks), "chunks": chunks}
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print(f"Wrote {len(chunks)} chunks to {out_path}")
    for c in chunks:
        print(f"  {c['chunk_id']:12s} ({c['kind']:28s}) {len(c['text']):5d} chars, {len(c['images'])} images")


if __name__ == "__main__":
    main()
