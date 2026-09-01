import json, html, base64, os, sys, mimetypes

BASE = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE, "..", "..", "HTML Exams", "Year 12 Exams", "Further Year 11 Papers", "Extracted Images")
OUT_PATH = os.path.join(BASE, "preview.html")

MODULE_DEFS = [
    {"id": "module-1", "title": "Module 1 — Cells as the Basis of Life", "color": "#059669",
     "inquiries": [{"id": "1.1", "title": "Cell Structure"}, {"id": "1.2", "title": "Cell Function"}]},
    {"id": "module-2", "title": "Module 2 — Organisation of Living Things", "color": "#EA580C",
     "inquiries": [{"id": "2.1", "title": "Organisation of Cells"}, {"id": "2.2", "title": "Nutrient and Gas Requirements"}, {"id": "2.3", "title": "Transport"}]},
    {"id": "module-3", "title": "Module 3 — Biological Diversity", "color": "#7C3AED",
     "inquiries": [{"id": "3.1", "title": "Effects of the Environment on Organisms"}, {"id": "3.2", "title": "Adaptations"}, {"id": "3.3", "title": "Theory of Evolution by Natural Selection"}, {"id": "3.4", "title": "Evolution – the Evidence"}]},
    {"id": "module-4", "title": "Module 4 — Ecosystem Dynamics", "color": "#0284C7",
     "inquiries": [{"id": "4.1", "title": "Population Dynamics"}, {"id": "4.2", "title": "Past Ecosystems"}, {"id": "4.3", "title": "Future Ecosystems"}]},
]

SOURCE_FILES = [
    ("paper1_mc.json", "Paper 1 — Section I"),
    ("paper1_section2.json", "Paper 1 — Section II (converted)"),
    ("paper2_mc.json", "Paper 2 — Part A"),
    ("paper2_section2.json", "Paper 2 — Part B (converted)"),
    ("paper3_mc.json", "Paper 3 — Part A"),
    ("paper3_section2.json", "Paper 3 — Part B (converted)"),
]

def esc(s):
    return html.escape(str(s), quote=True)

_img_cache = {}
def embed_image(filename):
    if not filename:
        return None
    if filename in _img_cache:
        return _img_cache[filename]
    path = os.path.join(IMG_DIR, filename)
    if not os.path.exists(path):
        return None
    mime, _ = mimetypes.guess_type(path)
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode("ascii")
    uri = f"data:{mime};base64,{data}"
    _img_cache[filename] = uri
    return uri

questions = []
for fname, label in SOURCE_FILES:
    with open(os.path.join(BASE, fname), encoding="utf-8") as f:
        rows = json.load(f)
    for r in rows:
        q = dict(r)
        q["source_label"] = label
        questions.append(q)

by_inquiry = {}
for q in questions:
    by_inquiry.setdefault(q["inquiry_id"], []).append(q)

TYPE_LABELS = {
    "multiple-choice": "Multiple Choice", "true-false": "True / False",
    "word-bank": "Word Bank", "drag-drop": "Matching", "ordering": "Ordering",
}

def render_body(q):
    t = q["type"]
    parts = []
    if t in ("multiple-choice", "true-false"):
        parts.append('<div class="options">')
        for opt in q.get("options") or []:
            correct = opt == q["answer"]
            cls = "opt correct" if correct else "opt"
            mark = ' <span class="tick">&#10003; correct</span>' if correct else ""
            parts.append(f'<div class="{cls}">{esc(opt)}{mark}</div>')
        parts.append("</div>")
    elif t == "word-bank":
        answer_arr = q["answer"] if isinstance(q["answer"], list) else [q["answer"]]
        prompt_html = esc(q["prompt"])
        for a in answer_arr:
            prompt_html = prompt_html.replace("___", f'<span class="blank">{esc(a)}</span>', 1)
        parts.append(f'<p class="prompt-filled">{prompt_html}</p>')
        parts.append('<div class="options">')
        for w in q.get("bank") or []:
            correct = w in answer_arr
            cls = "opt correct" if correct else "opt"
            mark = ' <span class="tick">&#10003; correct</span>' if correct else ""
            parts.append(f'<div class="{cls}">{esc(w)}{mark}</div>')
        parts.append("</div>")
    elif t == "drag-drop":
        parts.append('<table class="pairs-table"><thead><tr><th>Item</th><th>Correct match</th></tr></thead><tbody>')
        for p in q.get("pairs") or []:
            parts.append(f'<tr><td>{esc(p["item"])}</td><td>{esc(p["match"])}</td></tr>')
        parts.append("</tbody></table>")
    elif t == "ordering":
        parts.append('<ol class="order-list">')
        for item in q.get("answer") or []:
            parts.append(f"<li>{esc(item)}</li>")
        parts.append("</ol>")
    return "".join(parts)

card_html = []
toc_html = []
total = 0
type_counts = {}
for q in questions:
    type_counts[q["type"]] = type_counts.get(q["type"], 0) + 1
for mod in MODULE_DEFS:
    mod_inquiries = [inq for inq in mod["inquiries"] if inq["id"] in by_inquiry]
    if not mod_inquiries:
        continue
    mod_count = sum(len(by_inquiry[inq["id"]]) for inq in mod_inquiries)
    card_html.append(f'<h2 class="module-heading" style="border-color:{mod["color"]}">{esc(mod["title"])} <span class="count">{mod_count} questions</span></h2>')
    toc_html.append(f'<li><a href="#{mod["id"]}" style="color:{mod["color"]}">{esc(mod["title"])}</a> ({mod_count})</li>')
    card_html.append(f'<div id="{mod["id"]}"></div>')
    for inq in mod_inquiries:
        qs = by_inquiry[inq["id"]]
        card_html.append(f'<h3 class="inquiry-heading">{esc(inq["id"])} {esc(inq["title"])} <span class="count">{len(qs)}</span></h3>')
        for i, q in enumerate(qs, 1):
            total += 1
            img_uri = embed_image(q.get("image"))
            img_html = f'<img src="{img_uri}" class="q-img" alt="stimulus image"/>' if img_uri else ""
            prompt_html = esc(q["prompt"]).replace("\n", "<br/>")
            type_label = TYPE_LABELS.get(q["type"], q["type"])
            prompt_block = "" if q["type"] == "word-bank" else f'<p class="qprompt">{prompt_html}</p>'
            card_html.append(f'''
            <div class="qcard">
              <div class="qmeta"><span class="qsource">{esc(q["source_label"])}</span> · <span class="qtype">{esc(type_label)}</span></div>
              {prompt_block}
              {img_html}
              {render_body(q)}
              <p class="hint"><strong>Hint:</strong> {esc(q.get("hint") or "")}</p>
            </div>''')

html_doc = f"""<!doctype html>
<html><head><meta charset="utf-8"/><title>Further Year 11 Papers — Preview</title>
<style>
  body {{ font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem 6rem; color: #1a1a1a; background:#fafafa; }}
  h1 {{ font-size: 1.8rem; }}
  .summary {{ background:#fff; border:1px solid #ddd; border-radius:10px; padding:1rem 1.25rem; margin-bottom:1.5rem; }}
  .toc {{ list-style:none; padding:0; display:flex; flex-wrap:wrap; gap:0.75rem 1.5rem; }}
  .module-heading {{ border-left: 6px solid; padding-left: 0.6rem; margin-top: 2.5rem; }}
  .inquiry-heading {{ color:#555; margin-top:1.5rem; border-bottom:1px solid #ddd; padding-bottom:4px;}}
  .count {{ font-weight:400; color:#888; font-size:0.85em; }}
  .qcard {{ background:#fff; border:1px solid #ddd; border-radius:10px; padding:1rem 1.25rem; margin:0.75rem 0; }}
  .qmeta {{ font-size:0.75rem; color:#999; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px;}}
  .qprompt {{ font-weight:600; margin: 0 0 0.6rem; }}
  .q-img {{ max-width:100%; max-height:320px; display:block; margin:0.5rem 0; border:1px solid #eee; border-radius:6px; }}
  .options {{ display:flex; flex-direction:column; gap:4px; margin-bottom:0.6rem; }}
  .opt {{ padding:6px 10px; border-radius:6px; background:#f3f3f3; font-size:0.92rem; }}
  .opt.correct {{ background:#dcfce7; font-weight:600; }}
  .tick {{ color:#16a34a; font-size:0.8em; }}
  .hint {{ font-size:0.85rem; color:#666; margin:0; }}
  a {{ text-decoration:none; font-weight:600; }}
  .qtype {{ font-weight:700; }}
  .prompt-filled {{ font-weight:600; margin: 0 0 0.6rem; }}
  .blank {{ background:#dcfce7; color:#166534; padding:1px 8px; border-radius:5px; font-weight:700; }}
  .pairs-table {{ width:100%; border-collapse:collapse; margin-bottom:0.6rem; }}
  .pairs-table th, .pairs-table td {{ text-align:left; padding:6px 10px; border-bottom:1px solid #eee; font-size:0.92rem; }}
  .pairs-table th {{ color:#888; font-size:0.75rem; text-transform:uppercase; }}
  .order-list {{ margin:0 0 0.6rem; padding-left:1.3rem; }}
  .order-list li {{ padding:3px 0; font-size:0.92rem; }}
  .type-tally {{ display:flex; gap:1rem; flex-wrap:wrap; margin-top:0.5rem; font-size:0.85rem; color:#555; }}
</style></head>
<body>
<h1>🧬 Further Year 11 Papers — Preview</h1>
<div class="summary">
  <p><strong>{total} questions</strong> staged, not yet pushed to the site. Correct answers are highlighted in green.
  Source: 3 current-syllabus Year 11 Yearly trial exam papers (Section I multiple-choice + Section II questions converted to closed format).</p>
  <div class="type-tally">{' &nbsp;·&nbsp; '.join(f"<strong>{v}</strong> {TYPE_LABELS.get(k,k)}" for k, v in sorted(type_counts.items(), key=lambda x:-x[1]))}</div>
  <ul class="toc">{''.join(toc_html)}</ul>
</div>
{''.join(card_html)}
</body></html>"""

with open(OUT_PATH, "w", encoding="utf-8") as f:
    f.write(html_doc)
print(f"Wrote {total} questions -> {OUT_PATH}")
