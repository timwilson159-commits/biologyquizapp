import json, base64, os, html, sys

# Usage: python build_preview.py <examFolder> <questions.json> <out.html> "<Display Title>"
EXAM_FOLDER = sys.argv[1]
QUESTIONS_PATH = sys.argv[2]
OUT_PATH = sys.argv[3]
DISPLAY_TITLE = sys.argv[4] if len(sys.argv) > 4 else os.path.basename(EXAM_FOLDER)

MODULE_DEFS = [
    {"id": "module-1", "title": "Cells as the Basis of Life", "color": "#1D9E75", "inquiries": [
        {"id": "1.1", "title": "Cell Structure"},
        {"id": "1.2", "title": "Cell Function"},
    ]},
    {"id": "module-2", "title": "Organisation of Living Things", "color": "#DC2626", "inquiries": [
        {"id": "2.1", "title": "Organisation of Cells"},
        {"id": "2.2", "title": "Nutrient and Gas Requirements"},
        {"id": "2.3", "title": "Transport"},
    ]},
    {"id": "module-3", "title": "Biological Diversity", "color": "#0F6E56", "inquiries": [
        {"id": "3.1", "title": "Effects of the Environment on Organisms"},
        {"id": "3.2", "title": "Adaptations"},
        {"id": "3.3", "title": "Theory of Evolution by Natural Selection"},
        {"id": "3.4", "title": "Evolution - the Evidence"},
    ]},
    {"id": "module-4", "title": "Ecosystem Dynamics", "color": "#7C3AED", "inquiries": [
        {"id": "4.1", "title": "Population Dynamics"},
        {"id": "4.2", "title": "Past Ecosystems"},
        {"id": "4.3", "title": "Future Ecosystems"},
    ]},
]

MIME = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif"}

def img_data_uri(filename):
    ext = os.path.splitext(filename)[1].lower()
    path = os.path.join(EXAM_FOLDER, filename)
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    return f"data:{MIME.get(ext,'application/octet-stream')};base64,{b64}"

def esc(s):
    return html.escape(str(s), quote=True)

with open(QUESTIONS_PATH, encoding="utf-8") as f:
    questions = json.load(f)

for i, q in enumerate(questions):
    q.setdefault("source_ref", f"#{i+1}")

image_cache = {}
def get_img(filename):
    if filename not in image_cache:
        image_cache[filename] = img_data_uri(filename)
    return image_cache[filename]

by_inquiry = {}
for q in questions:
    by_inquiry.setdefault(q["inquiry_id"], []).append(q)

TYPE_LABELS = {
    "multiple-choice": "Multiple Choice",
    "true-false": "True / False",
    "fill-blank": "Fill the Blank",
    "word-bank": "Word Bank",
    "drag-drop": "Drag & Drop Matching",
    "ordering": "Ordering",
}

def render_question_body(q):
    t = q["type"]
    parts = []
    if t in ("multiple-choice", "true-false"):
        parts.append('<div class="options">')
        for opt in q.get("options", []):
            correct = opt == q["answer"]
            cls = "opt correct" if correct else "opt"
            mark = ' <span class="tick">&#10003; correct</span>' if correct else ""
            parts.append(f'<div class="{cls}">{esc(opt)}{mark}</div>')
        parts.append('</div>')
    elif t == "fill-blank":
        prompt_html = esc(q["prompt"]).replace("___", '<span class="blank">___</span>')
        parts.append(f'<p class="prompt-inline">{prompt_html}</p>')
        parts.append(f'<div class="answer-box">Correct answer: <strong>{esc(q["answer"])}</strong></div>')
        if q.get("hint"):
            parts.append(f'<div class="hint-box">Hint: {esc(q["hint"])}</div>')
    elif t == "word-bank":
        prompt_html = esc(q["prompt"]).replace("___", '<span class="blank">___</span>')
        parts.append(f'<p class="prompt-inline">{prompt_html}</p>')
        parts.append('<div class="options">')
        for w in q.get("bank", []):
            correct = w == q["answer"]
            cls = "opt correct" if correct else "opt"
            mark = ' <span class="tick">&#10003; correct</span>' if correct else ""
            parts.append(f'<div class="{cls}">{esc(w)}{mark}</div>')
        parts.append('</div>')
    elif t == "drag-drop":
        parts.append('<table class="pairs-table"><thead><tr><th>Item</th><th>Correct match</th></tr></thead><tbody>')
        for p in q.get("pairs", []):
            parts.append(f'<tr><td>{esc(p["item"])}</td><td>{esc(p["match"])}</td></tr>')
        parts.append('</tbody></table>')
    elif t == "ordering":
        parts.append('<ol class="order-list">')
        for item in q.get("answer", []):
            parts.append(f'<li>{esc(item)}</li>')
        parts.append('</ol>')
        shown = q.get("items", [])
        if shown:
            parts.append(f'<p class="shuffled-note">Shown to students in shuffled order, e.g.: {esc(", ".join(shown))}</p>')
    return "".join(parts)

card_html = []
toc_html = []
total = 0
for mod in MODULE_DEFS:
    mod_inquiries = [inq for inq in mod["inquiries"] if inq["id"] in by_inquiry]
    if not mod_inquiries:
        continue
    card_html.append(f'<h2 class="module-heading" style="border-color:{mod["color"]}">{esc(mod["title"])}</h2>')
    for inq in mod_inquiries:
        qs = by_inquiry[inq["id"]]
        anchor = f"inq-{inq['id']}"
        toc_html.append(f'<a href="#{anchor}" class="toc-link">{esc(inq["id"])} {esc(inq["title"])} <span class="toc-count">({len(qs)})</span></a>')
        card_html.append(f'<h3 id="{anchor}" class="inquiry-heading">{esc(inq["id"])} &middot; {esc(inq["title"])} <span class="count-badge">{len(qs)} questions</span></h3>')
        for q in qs:
            total += 1
            img_filename = q.get("image_filename") or q.get("image")
            img_html = ""
            if img_filename:
                try:
                    img_html = f'<img class="q-image" src="{get_img(img_filename)}" alt="stimulus image" />'
                except FileNotFoundError:
                    img_html = f'<div class="img-missing">Image file not found: {esc(img_filename)}</div>'
            note = q.get("conversion_note", "")
            card_html.append(f'''
<div class="q-card">
  <div class="q-meta">
    <span class="badge source">{esc(q["source_ref"])}</span>
    <span class="badge type">{esc(TYPE_LABELS.get(q["type"], q["type"]))}</span>
  </div>
  <p class="q-prompt">{esc(q["prompt"])}</p>
  {img_html}
  {render_question_body(q)}
  {f'<p class="conversion-note"><strong>Conversion note:</strong> {esc(note)}</p>' if note else ''}
</div>''')

type_counts = {}
for q in questions:
    type_counts[q["type"]] = type_counts.get(q["type"], 0) + 1
type_summary = " &middot; ".join(f"{v} {TYPE_LABELS.get(k,k)}" for k, v in type_counts.items())

html_out = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Girraween 2020 - Question Preview</title>
<style>
  * {{ box-sizing: border-box; }}
  body {{ font-family: 'Lato', 'Helvetica Neue', Arial, sans-serif; background: #f5f4f0; color: #1a1a1a; margin: 0; padding: 0; }}
  .header {{ background: #1a1a1a; color: #fff; padding: 2rem 2rem 1.5rem; position: sticky; top: 0; z-index: 10; }}
  .header h1 {{ margin: 0 0 6px; font-size: 22px; }}
  .header p {{ margin: 0; color: #aaa; font-size: 13px; }}
  .layout {{ display: flex; max-width: 1200px; margin: 0 auto; }}
  .toc {{ width: 260px; flex-shrink: 0; padding: 1.5rem 1rem; position: sticky; top: 100px; align-self: flex-start; max-height: calc(100vh - 120px); overflow-y: auto; }}
  .toc-link {{ display: block; padding: 6px 10px; border-radius: 6px; color: #444; text-decoration: none; font-size: 12.5px; margin-bottom: 2px; }}
  .toc-link:hover {{ background: #ece9e3; }}
  .toc-count {{ color: #aaa; }}
  .content {{ flex: 1; padding: 1.5rem 2rem 4rem; min-width: 0; }}
  .module-heading {{ border-left: 5px solid; padding-left: 12px; margin: 2.5rem 0 1rem; font-size: 20px; }}
  .inquiry-heading {{ font-size: 15px; color: #555; margin: 1.75rem 0 1rem; display: flex; align-items: center; gap: 10px; }}
  .count-badge {{ background: #ece9e3; color: #777; font-size: 11px; padding: 2px 8px; border-radius: 20px; font-weight: 700; }}
  .q-card {{ background: #fff; border: 1px solid #e5e3dc; border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }}
  .q-meta {{ display: flex; gap: 8px; margin-bottom: 10px; }}
  .badge {{ font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 20px; letter-spacing: 0.3px; }}
  .badge.source {{ background: #1a1a1a; color: #fff; }}
  .badge.type {{ background: #ede9fe; color: #4c1d95; }}
  .q-prompt {{ font-size: 15.5px; font-weight: 700; line-height: 1.5; margin: 0 0 12px; }}
  .q-image {{ max-width: 100%; max-height: 320px; display: block; margin: 0 0 14px; border-radius: 8px; border: 1px solid #e5e3dc; }}
  .img-missing {{ background: #fef3c7; color: #92400e; padding: 8px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 12px; }}
  .options {{ display: flex; flex-direction: column; gap: 6px; }}
  .opt {{ padding: 9px 13px; border-radius: 8px; border: 1.5px solid #e5e3dc; font-size: 13.5px; }}
  .opt.correct {{ background: #d1fae5; border-color: #059669; color: #065f46; font-weight: 700; }}
  .tick {{ float: right; font-size: 11px; }}
  .prompt-inline {{ font-size: 14px; margin: 0 0 10px; padding: 10px 13px; background: #f8f7f4; border-radius: 8px; border: 1px solid #e5e3dc; }}
  .blank {{ font-weight: 700; color: #aaa; }}
  .answer-box {{ background: #d1fae5; color: #065f46; padding: 9px 13px; border-radius: 8px; font-size: 13.5px; }}
  .hint-box {{ background: #f8f7f4; color: #666; padding: 8px 13px; border-radius: 8px; font-size: 12.5px; margin-top: 6px; }}
  .pairs-table {{ width: 100%; border-collapse: collapse; font-size: 13.5px; }}
  .pairs-table th {{ text-align: left; background: #f5f4f0; padding: 7px 10px; border-bottom: 1px solid #e5e3dc; font-size: 11px; color: #666; }}
  .pairs-table td {{ padding: 7px 10px; border-bottom: 1px solid #f0ede6; }}
  .order-list {{ font-size: 13.5px; padding-left: 22px; }}
  .order-list li {{ margin-bottom: 4px; }}
  .shuffled-note {{ font-size: 12px; color: #888; margin-top: 8px; }}
  .conversion-note {{ font-size: 12px; color: #888; margin: 12px 0 0; padding-top: 10px; border-top: 1px dashed #e5e3dc; line-height: 1.5; }}
</style>
</head>
<body>
  <div class="header">
    <h1>{esc(DISPLAY_TITLE)} &mdash; Question Preview</h1>
    <p>{total} questions confirmed &middot; {type_summary} &middot; all inserted as <strong>inactive</strong> once uploaded (not visible to students until reviewed)</p>
  </div>
  <div class="layout">
    <div class="toc">
      {''.join(toc_html)}
    </div>
    <div class="content">
      {''.join(card_html)}
    </div>
  </div>
</body>
</html>'''

with open(OUT_PATH, "w", encoding="utf-8") as f:
    f.write(html_out)

print("Written to", OUT_PATH)
print("Size (KB):", os.path.getsize(OUT_PATH) // 1024)
print("Unique images embedded:", len(image_cache))
