// @ts-nocheck
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = "admin123"; // TODO: change before going live
const SCHOOL_NAME = "Biology Quiz Centre";
const FLAG_REASONS = [
  { id: "confusing", label: "Confusing wording", icon: "😕" },
  { id: "difficult", label: "Too difficult", icon: "😤" },
  { id: "content", label: "Not aligned to content", icon: "📚" }
];

// Question-count picker limits per scope
const COUNT_LIMITS = {
  inquiry: { min: 5, softMax: 50 },
  module: { min: 20, softMax: 100 },
  year: { min: 20, softMax: 100 }
};

// ─── MODULE / INQUIRY QUESTION DEFINITIONS ────────────────────────────────────
// Module = whole topic. Inquiry = a single inquiry question within it.
// Ids are what gets stored on each question row (module_id, inquiry_id).
const MODULE_DEFS = [
  {
    id: "module-1",
    icon: "🔬",
    title: "Cells as the Basis of Life",
    color: "#1D9E75",
    description: "The structure and function of cells and how they meet their own needs.",
    inquiries: [
      { id: "1.1", title: "Cell Structure", question: "What distinguishes one cell from another?" },
      { id: "1.2", title: "Cell Function", question: "How do cells coordinate activities within their internal environment and the external environment?" }
    ]
  },
  {
    id: "module-2",
    icon: "🧠",
    title: "Organisation of Living Things",
    color: "#DC2626",
    description: "How cells organise into tissues, organs and systems, and how organisms exchange and transport materials.",
    inquiries: [
      { id: "2.1", title: "Organisation of Cells", question: "How are cells arranged in a multicellular organism?" },
      { id: "2.2", title: "Nutrient and Gas Requirements", question: "What is the difference in nutrient and gas requirements between autotrophs and heterotrophs?" },
      { id: "2.3", title: "Transport", question: "How does the composition of the transport medium change as it moves around an organism?" }
    ]
  },
  {
    id: "module-3",
    icon: "🌿",
    title: "Biological Diversity",
    color: "#0F6E56",
    description: "How environmental pressures drive diversity, adaptation and the evidence for evolution.",
    inquiries: [
      { id: "3.1", title: "Effects of the Environment on Organisms", question: "How do environmental pressures promote a change in species diversity and abundance?" },
      { id: "3.2", title: "Adaptations", question: "How do adaptations increase the organism's ability to survive?" },
      { id: "3.3", title: "Theory of Evolution by Natural Selection", question: "What is the relationship between evolution and biodiversity?" },
      { id: "3.4", title: "Evolution – the Evidence", question: "What is the evidence that supports the Theory of Evolution by Natural Selection?" }
    ]
  },
  {
    id: "module-4",
    icon: "🌏",
    title: "Ecosystem Dynamics",
    color: "#7C3AED",
    description: "Relationships between species, evidence of past ecosystems, and human impact on future ones.",
    inquiries: [
      { id: "4.1", title: "Population Dynamics", question: "What effect can one species have on the other species in a community?" },
      { id: "4.2", title: "Past Ecosystems", question: "How do selection pressures within an ecosystem influence evolutionary change?" },
      { id: "4.3", title: "Future Ecosystems", question: "How can human activity impact on an ecosystem?" }
    ]
  }
];

function findModule(moduleId) { return MODULE_DEFS.find(m => m.id === moduleId); }
function findInquiry(inquiryId) {
  for (const m of MODULE_DEFS) {
    const inq = m.inquiries.find(i => i.id === inquiryId);
    if (inq) return { ...inq, moduleId: m.id, moduleTitle: m.title, color: m.color };
  }
  return null;
}

// ─── FORMAT GUIDES ────────────────────────────────────────────────────────────
const FORMAT_GUIDE = `[
  {
    "type": "multiple-choice",
    "prompt": "Your question here?",
    "image": "",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A"
  },
  {
    "type": "true-false",
    "prompt": "Statement to evaluate.",
    "image": "",
    "options": ["True", "False"],
    "answer": "True"
  },
  {
    "type": "fill-blank",
    "prompt": "The ___ is the answer.",
    "image": "",
    "answer": "answer",
    "hint": "Optional hint text"
  },
  {
    "type": "word-bank",
    "prompt": "The ___ contains an answer to drag in.",
    "image": "",
    "bank": ["correct answer", "distractor 1", "distractor 2", "distractor 3", "distractor 4"],
    "answer": "correct answer"
  },
  {
    "type": "drag-drop",
    "prompt": "Match each item to its pair:",
    "image": "",
    "pairs": [
      { "item": "Item A", "match": "Match A" },
      { "item": "Item B", "match": "Match B" }
    ],
    "answer": { "Item A": "Match A", "Item B": "Match B" }
  },
  {
    "type": "ordering",
    "prompt": "Order these items correctly:",
    "image": "",
    "items": ["First", "Second", "Third", "Fourth"],
    "answer": ["First", "Second", "Third", "Fourth"]
  }
]`;

const BULK_STUDENT_GUIDE = `Smith, John, 11A, 11, STU-AB12
Jones, Emily, 11A, 11, STU-CD34
Williams, Tom, 12B, 12, STU-EF56`;

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: "#f5f4f0", fontFamily: "'Lato', 'Helvetica Neue', Arial, sans-serif", color: "#1a1a1a", colorScheme: "light" },
  nav: { background: "#1a1a1a", padding: "0 2rem", display: "flex", alignItems: "center", gap: "1rem", height: 52, position: "sticky", top: 0, zIndex: 100 },
  navBrand: { fontFamily: "Lato", fontWeight: 700, fontSize: 16, color: "#fff", cursor: "pointer", lineHeight: 1.2 },
  navSub: { fontSize: 11, color: "#888", fontWeight: 400 },
  cont: { maxWidth: 980, margin: "0 auto", padding: "2rem 1.5rem" },
  btn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.15s", fontFamily: "Lato" },
  btnPrimary: { background: "#1a1a1a", color: "#fff" },
  btnOutline: { background: "#fff", color: "#1a1a1a", border: "1px solid #d0cec6" },
  btnSm: { padding: "6px 13px", fontSize: 13 },
  btnSuccess: { background: "#059669", color: "#fff" },
  btnDanger: { background: "#DC2626", color: "#fff" },
  card: { background: "#fff", border: "1px solid #e5e3dc", borderRadius: 12, padding: "1.5rem" },
  input: { width: "100%", padding: "10px 13px", borderRadius: 8, border: "1.5px solid #e5e3dc", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "Lato" },
  label: { fontSize: 12, fontWeight: 700, color: "#666", display: "block", marginBottom: 5, letterSpacing: 0.3 },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "1rem" },
  modalBox: { background: "#fff", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" },
  badge: { display: "inline-flex", alignItems: "center", fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 700 },
  optBtn: { display: "block", width: "100%", textAlign: "left", padding: "11px 15px", borderRadius: 8, border: "1.5px solid #e5e3dc", background: "#fff", cursor: "pointer", fontSize: 14, marginBottom: 9, transition: "all 0.15s", color: "#1a1a1a", fontFamily: "'Lato', 'Helvetica Neue', Arial, sans-serif", lineHeight: 1.5 },
  progress: { background: "#f0ede6", borderRadius: 99, height: 5, overflow: "hidden" },
  th: { padding: "8px 12px", textAlign: "left", background: "#f5f4f0", borderBottom: "1px solid #e5e3dc", fontWeight: 700, fontSize: 12, color: "#666", whiteSpace: "nowrap" },
  td: { padding: "8px 12px", borderBottom: "1px solid #f0ede6", fontSize: 13, verticalAlign: "middle" },
  tabBtn: (active) => ({ padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "Lato", background: active ? "#1a1a1a" : "transparent", color: active ? "#fff" : "#666" }),
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// Deterministic shuffle - same seed gives same order (used within a single render, e.g. MCQ option order)
function seededShuffle(array, seed) {
  if (!array || array.length === 0) return [];
  const arr = [...array];
  const seedStr = String(seed || "default");
  let s = 0;
  for (let i = 0; i < seedStr.length; i++) {
    s = ((s << 5) - s + seedStr.charCodeAt(i)) | 0;
  }
  s = Math.abs(s) || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    const temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
  }
  return arr;
}

// True random shuffle - used when assembling a fresh practice attempt
function randomShuffle(array) {
  const arr = [...(array || [])];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function calcScore(questions, answers) {
  if (!questions || !questions.length) return null;
  let correct = 0;
  questions.forEach(q => {
    if (calcQuestionCorrect(q, answers[q.id])) correct++;
  });
  return { correct, total: questions.length, pct: Math.round((correct / questions.length) * 100) };
}

function calcQuestionCorrect(q, ans) {
  if (ans === undefined || ans === null) return false;
  if (q.type === "multiple-choice" || q.type === "true-false" || q.type === "word-bank") return ans === q.answer;
  if (q.type === "fill-blank") return typeof ans === "string" && ans.trim().toLowerCase() === String(q.answer).toLowerCase();
  if (q.type === "drag-drop") return q.pairs && q.pairs.every(p => ans && ans[p.item] === p.match);
  if (q.type === "ordering") return Array.isArray(ans) && q.answer.every((a, i) => ans[i] === a);
  return false;
}

function hasAnswer(q, ans) {
  if (ans === undefined || ans === null) return false;
  if (q.type === "fill-blank") return typeof ans === "string" && ans.trim().length > 0;
  if (q.type === "drag-drop") return q.pairs && q.pairs.some(p => ans[p.item]);
  if (q.type === "ordering") return Array.isArray(ans) && ans.length > 0;
  return true;
}

function formatCorrectAnswer(q) {
  if (q.type === "drag-drop") return (q.pairs || []).map(p => `${p.item} → ${p.match}`).join(", ");
  if (q.type === "ordering") return (q.answer || []).join(" → ");
  return String(q.answer);
}

function gradientColor(pct) {
  if (pct === null || pct === undefined) return { bg: "#f5f4f0", text: "#aaa" };
  const p = Math.max(0, Math.min(100, pct)) / 100;
  let r, g, b;
  if (p < 0.5) {
    const t = p * 2;
    r = Math.round(220 + (217 - 220) * t);
    g = Math.round(38 + (151 - 38) * t);
    b = Math.round(38 + (6 - 38) * t);
  } else {
    const t = (p - 0.5) * 2;
    r = Math.round(217 + (5 - 217) * t);
    g = Math.round(151 + (150 - 151) * t);
    b = Math.round(6 + (105 - 6) * t);
  }
  const bgAlpha = `rgba(${r},${g},${b},0.15)`;
  const textColor = `rgb(${Math.round(r * 0.6)},${Math.round(g * 0.6)},${Math.round(b * 0.6)})`;
  return { bg: bgAlpha, text: textColor, border: `rgba(${r},${g},${b},0.4)` };
}

// Question pool for a given scope -- every question in the bank is usable
function poolForScope(questions, scopeType, scopeId) {
  if (scopeType === "inquiry") return questions.filter(q => q.inquiry_id === scopeId);
  if (scopeType === "module") return questions.filter(q => q.module_id === scopeId);
  if (scopeType === "year") return questions;
  return [];
}

function buildAttemptQuestions(pool, count) {
  const n = Math.min(count, pool.length);
  return randomShuffle(pool).slice(0, n);
}

// ─── SUPABASE DATA HOOKS ──────────────────────────────────────────────────────
function useQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { reload(); }, []);

  const reload = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("questions").select("*").order("created_at", { ascending: true });
    if (error) { console.error("Load questions error:", error); setLoading(false); return; }
    setQuestions(data || []);
    setLoading(false);
  };

  const addQuestion = async (moduleId, inquiryId, q) => {
    const row = {
      module_id: moduleId, inquiry_id: inquiryId, type: q.type, prompt: q.prompt, image: q.image || "",
      options: q.options || null, bank: q.bank || null, pairs: q.pairs || null, items: q.items || null,
      answer: q.answer, hint: q.hint || null
    };
    const { data, error } = await supabase.from("questions").insert(row).select().single();
    if (error) { console.error("Add question error:", error); return null; }
    setQuestions(prev => [...prev, data]);
    return data;
  };

  const addQuestionsBulk = async (moduleId, inquiryId, list) => {
    const rows = list.map(q => ({
      module_id: moduleId, inquiry_id: inquiryId, type: q.type, prompt: q.prompt, image: q.image || "",
      options: q.options || null, bank: q.bank || null, pairs: q.pairs || null, items: q.items || null,
      answer: q.answer, hint: q.hint || null
    }));
    const { data, error } = await supabase.from("questions").insert(rows).select();
    if (error) { console.error("Bulk add questions error:", error); return false; }
    setQuestions(prev => [...prev, ...(data || [])]);
    return true;
  };

  const updateQuestion = async (id, updates) => {
    const dbUpdates = { ...updates, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("questions").update(dbUpdates).eq("id", id);
    if (error) { console.error("Update question error:", error); return; }
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = async (id) => {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) { console.error("Delete question error:", error); return; }
    await supabase.from("question_flags").delete().eq("question_id", id);
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  return { questions, loading, addQuestion, addQuestionsBulk, updateQuestion, deleteQuestion, reload };
}

function useUsers() {
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*");
    if (!error && data) {
      const obj = {};
      data.forEach(u => {
        obj[u.code] = {
          name: u.name,
          className: u.class_name || "",
          year: u.year || "",
          createdAt: u.created_at ? new Date(u.created_at).getTime() : Date.now()
        };
      });
      setUsers(obj);
    }
    setLoading(false);
  };

  const addUser = async (code, info) => {
    const { error } = await supabase.from("users").insert({
      code, name: info.name, class_name: info.className || null, year: info.year || null
    });
    if (error) { console.error("Add user error:", error); return false; }
    setUsers(p => ({ ...p, [code]: { ...info, createdAt: Date.now() } }));
    return true;
  };

  const addUsersBulk = async (records) => {
    const rows = records.map(r => ({
      code: r.code, name: r.name, class_name: r.className || null, year: r.year || null
    }));
    const { error } = await supabase.from("users").insert(rows);
    if (error) { console.error("Bulk insert error:", error); return false; }
    await loadUsers();
    return true;
  };

  const removeUser = async (code) => {
    await supabase.from("attempts").delete().eq("user_code", code);
    const { error } = await supabase.from("users").delete().eq("code", code);
    if (error) { console.error("Remove user error:", error); return; }
    setUsers(p => { const n = { ...p }; delete n[code]; return n; });
  };

  const removeUsersBulk = async (codes) => {
    if (!codes || codes.length === 0) return;
    for (const code of codes) {
      await supabase.from("attempts").delete().eq("user_code", code);
    }
    const { error } = await supabase.from("users").delete().in("code", codes);
    if (error) { console.error("Bulk remove error:", error); return; }
    setUsers(p => { const n = { ...p }; codes.forEach(c => delete n[c]); return n; });
  };

  return { users, loading, addUser, addUsersBulk, removeUser, removeUsersBulk, reload: loadUsers };
}

function useMyAttempts(userCode) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    if (!userCode) return;
    setLoading(true);
    const { data, error } = await supabase.from("attempts").select("*").eq("user_code", userCode).order("submitted_at", { ascending: false });
    if (!error && data) setAttempts(data);
    setLoading(false);
  };

  useEffect(() => { reload(); }, [userCode]);

  return { attempts, loading, reload };
}

function useAllAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("attempts").select("*").order("submitted_at", { ascending: false });
    if (!error && data) setAttempts(data);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  return { attempts, loading, reload };
}

async function submitAttempt({ userCode, scopeType, scopeId, questionSnapshot, answers, correct, total }) {
  const { error } = await supabase.from("attempts").insert({
    user_code: userCode, scope_type: scopeType, scope_id: scopeId,
    question_snapshot: questionSnapshot, answers, correct, total
  });
  if (error) console.error("Submit attempt error:", error);
}

function useFlags() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("question_flags").select("*").order("created_at", { ascending: false });
    if (!error && data) setFlags(data);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const addFlag = async (questionId, userCode, reasons) => {
    const { error } = await supabase.from("question_flags").insert({ question_id: questionId, user_code: userCode, reasons });
    if (error) { console.error("Add flag error:", error); return; }
    await reload();
  };

  const resolveFlag = async (id) => {
    const { error } = await supabase.from("question_flags").update({ resolved: true }).eq("id", id);
    if (error) { console.error("Resolve flag error:", error); return; }
    setFlags(prev => prev.map(f => f.id === id ? { ...f, resolved: true } : f));
  };

  return { flags, loading, addFlag, resolveFlag, reload };
}

// ─── IMAGE MODAL / QUESTION IMAGE ─────────────────────────────────────────────
function ImageModal({ src, onClose }) {
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
        <img src={src} alt="Enlarged" style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: 12, display: "block" }} />
        <button onClick={onClose}
          style={{ position: "absolute", top: 12, right: 12, width: 40, height: 40, borderRadius: "50%", background: "#fff", border: "none", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          ✕
        </button>
      </div>
    </div>
  );
}

function QuestionImage({ src }) {
  const [modalOpen, setModalOpen] = useState(false);
  if (!src) return null;
  return (
    <>
      <img
        src={src}
        alt="Question visual"
        onClick={() => setModalOpen(true)}
        style={{ maxWidth: "100%", maxHeight: 280, borderRadius: 8, marginBottom: 14, cursor: "pointer", transition: "opacity 0.2s", border: "1px solid #e5e3dc" }}
        onMouseEnter={e => e.target.style.opacity = "0.85"}
        onMouseLeave={e => e.target.style.opacity = "1"}
      />
      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 8px", textAlign: "center" }}>Click image to enlarge</p>
      {modalOpen && <ImageModal src={src} onClose={() => setModalOpen(false)} />}
    </>
  );
}

// ─── QUESTION RENDERERS ───────────────────────────────────────────────────────
function MCQ({ q, ans, setAns, revealed, seed }) {
  const fallbackOptions = q.type === "true-false" ? ["True", "False"] : [];
  const shuffledOptions = seededShuffle(q.options?.length ? q.options : fallbackOptions, seed || "default");
  return (
    <>
      <QuestionImage src={q.image} />
      {shuffledOptions.map(opt => {
        let bg = "#fff", border = "#e5e3dc", col = "#1a1a1a";
        if (ans === opt) { bg = "#f0f0f0"; border = "#1a1a1a"; }
        if (revealed) {
          if (opt === q.answer) { bg = "#d1fae5"; border = "#059669"; col = "#065f46"; }
          else if (ans === opt) { bg = "#fee2e2"; border = "#dc2626"; col = "#7f1d1d"; }
        }
        return (
          <button key={opt} disabled={revealed} onClick={() => setAns(opt)}
            style={{ ...S.optBtn, background: bg, borderColor: border, color: col, fontWeight: ans === opt ? 700 : 400 }}>
            {opt}
            {revealed && opt === q.answer && <span style={{ float: "right" }}>✓</span>}
            {revealed && ans === opt && opt !== q.answer && <span style={{ float: "right" }}>✗</span>}
          </button>
        );
      })}
    </>
  );
}

function FillBlank({ q, ans, setAns, revealed }) {
  const [hint, setHint] = useState(false);
  const ok = revealed && ans && ans.trim().toLowerCase() === String(q.answer).toLowerCase();
  return (
    <div>
      <QuestionImage src={q.image} />
      <input style={{ ...S.input, borderColor: revealed ? (ok ? "#059669" : "#dc2626") : "#e5e3dc", background: revealed ? (ok ? "#d1fae5" : "#fee2e2") : "#fff" }}
        value={ans || ""} onChange={e => !revealed && setAns(e.target.value)} placeholder="Type your answer..." disabled={revealed} />
      {q.hint && !revealed && (!hint
        ? <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm, marginTop: 8 }} onClick={() => setHint(true)}>Show hint</button>
        : <p style={{ fontSize: 13, color: "#666", marginTop: 8 }}>Hint: {q.hint}</p>)}
      {revealed && <p style={{ fontSize: 13, marginTop: 8, color: ok ? "#065f46" : "#7f1d1d" }}>{ok ? "Correct!" : `Correct answer: ${q.answer}`}</p>}
    </div>
  );
}

function WordBank({ q, ans, setAns, revealed, seed }) {
  const [dragging, setDragging] = useState(null);
  const bank = seededShuffle(q.bank || [], seed || "default");
  const placed = ans || null;

  const drop = () => {
    if (!dragging || revealed) return;
    setAns(dragging);
    setDragging(null);
  };

  const clear = () => {
    if (revealed) return;
    setAns(null);
  };

  const ok = revealed && placed === q.answer;
  const bad = revealed && placed && placed !== q.answer;
  const promptParts = q.prompt.split("___");

  return (
    <div>
      <QuestionImage src={q.image} />
      <div style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 18, padding: "14px 16px", background: "#f8f7f4", borderRadius: 8, border: "1px solid #e5e3dc" }}>
        {promptParts[0]}
        <span onDragOver={e => e.preventDefault()} onDrop={drop} onClick={placed && !revealed ? clear : undefined}
          style={{ display: "inline-block", minWidth: 120, padding: "4px 12px", margin: "0 4px", borderRadius: 6,
            border: `2px ${placed ? "solid" : "dashed"} ${ok ? "#059669" : bad ? "#dc2626" : placed ? "#1a1a1a" : "#aaa"}`,
            background: ok ? "#d1fae5" : bad ? "#fee2e2" : placed ? "#fff" : "transparent",
            color: ok ? "#065f46" : bad ? "#7f1d1d" : "#1a1a1a", fontWeight: 600, textAlign: "center",
            cursor: placed && !revealed ? "pointer" : "default", verticalAlign: "middle" }}>
          {placed || <span style={{ color: "#aaa", fontStyle: "italic", fontWeight: 400 }}>drop word here</span>}
        </span>
        {promptParts[1] || ""}
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", margin: "0 0 8px", letterSpacing: 0.5 }}>WORD BANK</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {bank.map(word => {
          const isPlaced = placed === word;
          return (
            <div key={word} draggable={!revealed && !isPlaced} onDragStart={() => setDragging(word)}
              style={{ padding: "8px 14px", border: "1.5px dashed #ccc", borderRadius: 8,
                cursor: revealed || isPlaced ? "default" : "grab", fontSize: 14, fontWeight: 600,
                background: isPlaced ? "#ece9e3" : "#fff", color: isPlaced ? "#aaa" : "#1a1a1a",
                opacity: isPlaced ? 0.5 : 1, userSelect: "none" }}>
              {word}
            </div>
          );
        })}
      </div>
      {revealed && !ok && <p style={{ fontSize: 13, marginTop: 10, color: "#7f1d1d" }}>Correct answer: {q.answer}</p>}
      {revealed && ok && <p style={{ fontSize: 13, marginTop: 10, color: "#065f46" }}>Correct!</p>}
      {placed && !revealed && <p style={{ fontSize: 12, color: "#888", marginTop: 8 }}>Tip: click the word to remove it.</p>}
    </div>
  );
}

function DragDrop({ q, ans, setAns, revealed, seed }) {
  const cur = ans || {};
  const baseSeed = String(seed || "default");
  const items = seededShuffle((q.pairs || []).map(p => p.item), baseSeed + "-items");
  const targets = seededShuffle((q.pairs || []).map(p => p.match), baseSeed + "-targets");

  const setMatch = (item, target) => {
    if (revealed) return;
    const next = { ...cur };
    if (target) {
      Object.keys(next).forEach(k => { if (next[k] === target) delete next[k]; });
      next[item] = target;
    } else {
      delete next[item];
    }
    setAns(next);
  };

  return (
    <div>
      <QuestionImage src={q.image} />
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 12px" }}>Select the correct match for each item from the dropdown:</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map(item => {
          const selected = cur[item] || "";
          const correctMatch = q.answer[item];
          const ok = revealed && selected === correctMatch;
          const bad = revealed && selected && selected !== correctMatch;
          const empty = revealed && !selected;
          let bg = "#fff", borderCol = "#d0cec6";
          if (ok) { bg = "#d1fae5"; borderCol = "#059669"; }
          else if (bad) { bg = "#fee2e2"; borderCol = "#dc2626"; }
          else if (empty) { bg = "#fef3c7"; borderCol = "#d97706"; }
          return (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              border: `1.5px solid ${borderCol}`, borderRadius: 8, background: bg, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 600, flex: "1 1 140px", minWidth: 100 }}>{item}</span>
              <span style={{ fontSize: 18, color: "#aaa" }}>→</span>
              {!revealed ? (
                <select value={selected} onChange={e => setMatch(item, e.target.value)}
                  style={{ flex: "2 1 200px", minWidth: 160, padding: "8px 12px", borderRadius: 6,
                    border: "1.5px solid #d0cec6", fontSize: 14, fontFamily: "Lato", background: "#fff",
                    cursor: "pointer", color: selected ? "#1a1a1a" : "#aaa" }}>
                  <option value="">— select a match —</option>
                  {targets.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : (
                <span style={{ flex: "2 1 200px", minWidth: 160, padding: "8px 12px", borderRadius: 6,
                  background: ok ? "#a7f3d0" : bad ? "#fecaca" : "#fde68a", fontSize: 14, fontWeight: 600,
                  color: ok ? "#065f46" : bad ? "#7f1d1d" : "#92400e", display: "flex", alignItems: "center", gap: 6 }}>
                  {selected || "(no answer)"}
                  {ok && <span>✓</span>}
                  {bad && <span>✗</span>}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {revealed && (
        <div style={{ marginTop: 14, padding: "10px 14px", background: "#f8f7f4", borderRadius: 8, border: "1px solid #e5e3dc" }}>
          <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "#666" }}>CORRECT MATCHES</p>
          {(q.pairs || []).map(p => (
            <p key={p.item} style={{ margin: "3px 0", fontSize: 13, color: "#555" }}>
              <strong>{p.item}</strong> → {p.match}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function Ordering({ q, ans, setAns, revealed }) {
  const initial = ans && ans.length ? ans : [...(q.items || [])].sort(() => Math.random() - 0.5);
  const [order, setOrder] = useState(initial);
  const [drag, setDrag] = useState(null);
  useEffect(() => { setAns(order); }, []);
  const move = (from, to) => { const n = [...order]; const [x] = n.splice(from, 1); n.splice(to, 0, x); setOrder(n); setAns(n); };
  return (
    <div>
      <QuestionImage src={q.image} />
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 10px" }}>Drag to reorder:</p>
      {order.map((item, i) => {
        const ci = (q.answer || []).indexOf(item);
        const ok = revealed && i === ci;
        const bad = revealed && i !== ci;
        return (
          <div key={item} draggable={!revealed} onDragStart={() => setDrag(i)}
            onDragOver={e => e.preventDefault()} onDrop={() => { if (drag !== null && drag !== i) move(drag, i); setDrag(null); }}
            style={{ padding: "10px 15px", marginBottom: 8,
              border: `1.5px solid ${ok ? "#059669" : bad ? "#dc2626" : "#e5e3dc"}`,
              borderRadius: 8, background: ok ? "#d1fae5" : bad ? "#fee2e2" : "#fff",
              cursor: revealed ? "default" : "grab", display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
            <span style={{ color: "#ccc" }}>&#9783;</span>
            <span style={{ flex: 1 }}>{item}</span>
            <span style={{ fontSize: 12, color: "#aaa" }}>#{i + 1}</span>
            {revealed && ok && <span style={{ color: "#059669", fontSize: 12 }}>✓</span>}
            {revealed && bad && <span style={{ color: "#dc2626", fontSize: 12 }}>should be #{ci + 1}</span>}
          </div>
        );
      })}
    </div>
  );
}

function QuestionRenderer({ q, ans, setAns, revealed, seed }) {
  if (!q) return null;
  if (q.type === "multiple-choice" || q.type === "true-false") return <MCQ q={q} ans={ans} setAns={setAns} revealed={revealed} seed={seed} />;
  if (q.type === "fill-blank") return <FillBlank q={q} ans={ans} setAns={setAns} revealed={revealed} />;
  if (q.type === "word-bank") return <WordBank q={q} ans={ans} setAns={setAns} revealed={revealed} seed={seed} />;
  if (q.type === "drag-drop") return <DragDrop q={q} ans={ans} setAns={setAns} revealed={revealed} seed={seed} />;
  if (q.type === "ordering") return <Ordering q={q} ans={ans} setAns={setAns} revealed={revealed} />;
  return null;
}

const AUTO_REVEAL_TYPES = ["multiple-choice", "true-false", "word-bank"];

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ users, onLogin, onAdmin }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    setErr("");
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setErr("Please enter your login code."); return; }
    if (users[trimmed]) {
      onLogin({ code: trimmed, name: users[trimmed].name });
    } else {
      setErr("Login code not recognised. Please check with your teacher.");
    }
  };
  return (
    <div className="login-page-root" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a3a2a 0%, #0f2d1f 30%, #1a3a2a 60%, #0d2318 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Lato", padding: "2rem", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes drift1 { 0%,100% { transform: translateY(0px) translateX(0px) scale(1); } 33% { transform: translateY(-30px) translateX(20px) scale(1.05); } 66% { transform: translateY(15px) translateX(-15px) scale(0.97); } }
        @keyframes drift2 { 0%,100% { transform: translateY(0px) translateX(0px) scale(1); } 40% { transform: translateY(25px) translateX(-20px) scale(1.08); } 70% { transform: translateY(-20px) translateX(10px) scale(0.95); } }
        @keyframes drift3 { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-40px) scale(1.1); } }
        @keyframes shimmer { 0%,100% { opacity: 0.03; } 50% { opacity: 0.07; } }
        .login-page-root * { box-sizing: border-box; }
      `}</style>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "55%", height: "60%", background: "radial-gradient(ellipse, rgba(29,158,117,0.18) 0%, transparent 70%)", animation: "drift1 18s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "60%", height: "65%", background: "radial-gradient(ellipse, rgba(15,110,86,0.15) 0%, transparent 70%)", animation: "drift2 22s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "30%", right: "15%", width: "35%", height: "40%", background: "radial-gradient(ellipse, rgba(29,158,117,0.10) 0%, transparent 70%)", animation: "drift3 15s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", animation: "shimmer 8s ease-in-out infinite" }} />
      </div>
      <div style={{ width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{SCHOOL_NAME}</div>
          <h1 style={{ margin: "0 0 6px", fontSize: 32, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>Quiz Centre</h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.45)", fontSize: 15 }}>Biology revision, any time</p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "2rem" }}>
          <label style={{ ...S.label, color: "rgba(255,255,255,0.6)" }}>YOUR LOGIN CODE</label>
          <input style={{ ...S.input, textAlign: "center", fontSize: 18, letterSpacing: 2, marginBottom: 14 }}
            value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. STU-4821"
            onKeyDown={e => e.key === "Enter" && submit()} />
          {err && <p style={{ color: "#fca5a5", fontSize: 13, margin: "0 0 12px" }}>{err}</p>}
          <button style={{ ...S.btn, ...S.btnPrimary, width: "100%", justifyContent: "center", fontSize: 15, background: "#1D9E75", border: "none" }} onClick={submit}>Sign In</button>
        </div>
        <p style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 12, cursor: "pointer", fontFamily: "Lato" }} onClick={onAdmin}>Admin access</button>
        </p>
      </div>
    </div>
  );
}

// ─── COUNT PICKER MODAL ───────────────────────────────────────────────────────
function CountPickerModal({ title, subtitle, scopeType, poolSize, onStart, onCancel }) {
  const limits = COUNT_LIMITS[scopeType];
  const max = Math.max(1, Math.min(limits.softMax, poolSize));
  const min = Math.min(limits.min, max);
  const [count, setCount] = useState(Math.min(max, Math.max(min, limits.min)));

  if (poolSize === 0) {
    return (
      <div style={S.modal}>
        <div style={S.modalBox}>
          <h3 style={{ margin: "0 0 10px" }}>{title}</h3>
          <p style={{ color: "#777", fontSize: 14, margin: "0 0 1.5rem" }}>No questions have been published for this yet. Check back soon.</p>
          <button style={{ ...S.btn, ...S.btnOutline, width: "100%", justifyContent: "center" }} onClick={onCancel}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.modal}>
      <div style={S.modalBox}>
        <h3 style={{ margin: "0 0 6px" }}>{title}</h3>
        {subtitle && <p style={{ color: "#777", fontSize: 13, margin: "0 0 1.25rem" }}>{subtitle}</p>}
        <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 1rem" }}>{poolSize} question{poolSize === 1 ? "" : "s"} available in the bank</p>
        <label style={S.label}>HOW MANY QUESTIONS? ({min}–{max})</label>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "1.75rem" }}>
          <input type="range" min={min} max={max} value={count} onChange={e => setCount(Number(e.target.value))} style={{ flex: 1 }} />
          <div style={{ width: 52, height: 42, borderRadius: 8, background: "#f0ede6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>{count}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...S.btn, ...S.btnPrimary, flex: 1, justifyContent: "center" }} onClick={() => onStart(count)}>Start Practice</button>
          <button style={{ ...S.btn, ...S.btnOutline, flex: 1, justifyContent: "center" }} onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── PRACTICE SESSION (question-by-question, instant feedback) ───────────────
function PracticeSession({ scopeType, scopeId, scopeLabel, color, pool, count, user, onExit, onTryAgain }) {
  const [questions] = useState(() => buildAttemptQuestions(pool, count));
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealedIds, setRevealedIds] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [flagModal, setFlagModal] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [seed] = useState(() => Math.random().toString(36).slice(2));

  if (!questions.length) {
    return (
      <div style={S.cont}>
        <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm, marginBottom: "1.5rem" }} onClick={onExit}>Back</button>
        <div style={{ ...S.card, textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🚧</p>
          <h3 style={{ margin: "0 0 8px" }}>Nothing to practise yet</h3>
          <p style={{ color: "#777" }}>No questions have been published here yet. Check back later.</p>
        </div>
      </div>
    );
  }

  if (finished) {
    const gc = gradientColor(finalScore.pct);
    return (
      <div style={S.cont}>
        <div style={{ ...S.card, textAlign: "center", padding: "3rem" }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", background: gc.bg, fontSize: 26, fontWeight: 700, color: gc.text }}>{finalScore.pct}%</div>
          <h2 style={{ margin: "0 0 6px" }}>{finalScore.pct >= 70 ? "Nice work!" : "Keep practising"}</h2>
          <p style={{ color: "#777", margin: "0 0 24px" }}>{finalScore.correct} / {finalScore.total} correct</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ ...S.btn, ...S.btnPrimary, background: color }} onClick={onTryAgain}>Try Again</button>
            <button style={{ ...S.btn, ...S.btnOutline }} onClick={onExit}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const isRevealed = !!revealedIds[q.id];
  const needsCheck = !AUTO_REVEAL_TYPES.includes(q.type);
  const canCheck = needsCheck && !isRevealed && hasAnswer(q, answers[q.id]);
  const isLast = idx === questions.length - 1;
  const answeredCount = Object.keys(revealedIds).length;

  const setAns = val => {
    setAnswers(p => ({ ...p, [q.id]: val }));
    if (AUTO_REVEAL_TYPES.includes(q.type)) setRevealedIds(p => ({ ...p, [q.id]: true }));
  };
  const checkAnswer = () => setRevealedIds(p => ({ ...p, [q.id]: true }));

  const finishSession = async () => {
    const score = calcScore(questions, answers);
    setFinalScore(score);
    setFinished(true);
    await submitAttempt({
      userCode: user.code, scopeType, scopeId, questionSnapshot: questions,
      answers, correct: score.correct, total: score.total
    });
  };

  const goNext = () => { if (isLast) finishSession(); else setIdx(i => i + 1); };

  return (
    <div style={S.cont}>
      <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm, marginBottom: "1.5rem" }} onClick={onExit}>Back</button>
      <div style={{ ...S.card, marginBottom: "1.25rem", borderLeft: `4px solid ${color}` }}>
        <p style={{ margin: "0 0 2px", fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: 0.5 }}>{scopeLabel.toUpperCase()}</p>
        <h2 style={{ margin: "0 0 4px", fontSize: 19 }}>Practice · {questions.length} questions</h2>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#777" }}>{answeredCount} of {questions.length} answered</p>
        <div style={{ ...S.progress, marginBottom: 8 }}>
          <div style={{ height: "100%", borderRadius: 99, background: color, width: `${Math.round((answeredCount / questions.length) * 100)}%`, transition: "width 0.3s" }} />
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {questions.map((qq, i) => {
            const rev = !!revealedIds[qq.id];
            const correct = rev ? calcQuestionCorrect(qq, answers[qq.id]) : false;
            let bg, txt;
            if (i === idx) { bg = color; txt = "#fff"; }
            else if (rev) { bg = correct ? "#d1fae5" : "#fee2e2"; txt = correct ? "#065f46" : "#7f1d1d"; }
            else { bg = "#f0ede6"; txt = "#aaa"; }
            return (
              <button key={qq.id} onClick={() => setIdx(i)}
                style={{ width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: bg, color: txt }}>
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ ...S.card, marginBottom: "1.25rem" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1, margin: "0 0 6px", textTransform: "uppercase" }}>Q{idx + 1} of {questions.length} · {(q.type || "").replace(/-/g, " ")}</p>
        <p style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.45, margin: "0 0 1.25rem" }}>{q.prompt}</p>
        <QuestionRenderer q={q} ans={answers[q.id]} setAns={setAns} revealed={isRevealed} seed={`${seed}-${q.id}`} />

        {needsCheck && !isRevealed && (
          <button style={{ ...S.btn, ...S.btnPrimary, background: color, marginTop: 14 }} disabled={!canCheck} onClick={checkAnswer}>
            Check Answer
          </button>
        )}
        {isRevealed && (q.type === "drag-drop" || q.type === "ordering") && (
          <p style={{ fontSize: 13, marginTop: 12, fontWeight: 600, color: calcQuestionCorrect(q, answers[q.id]) ? "#065f46" : "#7f1d1d" }}>
            {calcQuestionCorrect(q, answers[q.id]) ? "Correct!" : `Correct answer: ${formatCorrectAnswer(q)}`}
          </p>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <button style={{ ...S.btn, ...S.btnOutline }} disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>Previous</button>
        <button
          style={{ ...S.btn, background: flaggedQuestions?.[q.id]?.reasons?.length ? "#ede9fe" : "transparent", color: flaggedQuestions?.[q.id]?.reasons?.length ? "#4c1d95" : "#888", border: `1px solid ${flaggedQuestions?.[q.id]?.reasons?.length ? "#c4b5fd" : "#d0cec6"}` }}
          onClick={() => setFlagModal(true)}>
          🚩 {flaggedQuestions?.[q.id]?.reasons?.length ? "Flagged" : "Flag"}
        </button>
        <button style={{ ...S.btn, ...S.btnPrimary, background: isLast ? "#DC2626" : color }} onClick={goNext}>
          {isLast ? "Finish" : "Next"}
        </button>
      </div>

      {flagModal && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <h3 style={{ margin: "0 0 10px" }}>Flag this question</h3>
            <p style={{ color: "#666", fontSize: 13, margin: "0 0 1.5rem" }}>Why are you flagging this question?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.5rem" }}>
              {FLAG_REASONS.map(reason => (
                <button
                  key={reason.id}
                  onClick={() => {
                    setFlaggedQuestions(prev => ({
                      ...prev,
                      [q.id]: {
                        reasons: prev?.[q.id]?.reasons
                          ? (prev[q.id].reasons.includes(reason.id)
                            ? prev[q.id].reasons.filter(r => r !== reason.id)
                            : [...prev[q.id].reasons, reason.id])
                          : [reason.id]
                      }
                    }));
                  }}
                  style={{
                    padding: "12px 14px", borderRadius: 8,
                    border: flaggedQuestions?.[q.id]?.reasons?.includes(reason.id) ? "2px solid #4c1d95" : "1px solid #e5e3dc",
                    background: flaggedQuestions?.[q.id]?.reasons?.includes(reason.id) ? "#f3e8ff" : "#fff",
                    cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: 500, fontFamily: "Lato", transition: "all 0.18s"
                  }}>
                  <span style={{ marginRight: 8 }}>{reason.icon}</span>
                  {reason.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={{ ...S.btn, ...S.btnPrimary, flex: 1, justifyContent: "center" }}
                onClick={async () => {
                  const reasons = flaggedQuestions?.[q.id]?.reasons || [];
                  if (reasons.length) await submitFlag(q.id, user.code, reasons);
                  setFlagModal(false);
                }}
                disabled={!flaggedQuestions?.[q.id]?.reasons?.length}>
                Save Flag
              </button>
              <button style={{ ...S.btn, ...S.btnOutline, flex: 1, justifyContent: "center" }} onClick={() => setFlagModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function submitFlag(questionId, userCode, reasons) {
  const { error } = await supabase.from("question_flags").insert({ question_id: questionId, user_code: userCode, reasons });
  if (error) console.error("Submit flag error:", error);
}

// ─── MODULE PAGE ──────────────────────────────────────────────────────────────
function ModulePage({ moduleDef, questions, user, onBack, onLaunch }) {
  const [picker, setPicker] = useState(null); // { scopeType, scopeId, scopeLabel, title, subtitle }

  const moduleActive = questions.filter(q => q.module_id === moduleDef.id);

  return (
    <div style={S.cont}>
      <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm, marginBottom: "1.5rem" }} onClick={onBack}>← All Modules</button>
      <div style={{ borderLeft: `4px solid ${moduleDef.color}`, paddingLeft: "1rem", marginBottom: "1.5rem" }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 26 }}>{moduleDef.icon} {moduleDef.title}</h1>
        <p style={{ margin: 0, color: "#666", fontSize: 14 }}>{moduleDef.description}</p>
      </div>

      <div style={{ ...S.card, marginBottom: "1.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", background: `${moduleDef.color}0d`, borderColor: moduleDef.color }}>
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Whole Module Quiz</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>{moduleActive.length} questions available across this module</p>
        </div>
        <button style={{ ...S.btn, background: moduleDef.color, color: "#fff" }}
          onClick={() => setPicker({ scopeType: "module", scopeId: moduleDef.id, scopeLabel: moduleDef.title, title: "Whole Module Quiz", subtitle: moduleDef.title })}>
          Start
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {moduleDef.inquiries.map(inq => {
          const bank = questions.filter(q => q.inquiry_id === inq.id);
          return (
            <div key={inq.id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 260px" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#aaa" }}>{inq.id}</span>
                <h3 style={{ margin: "2px 0 6px", fontSize: 16 }}>{inq.title}</h3>
                <p style={{ margin: "0 0 6px", fontSize: 13, color: "#666", fontStyle: "italic" }}>{inq.question}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{bank.length} question{bank.length === 1 ? "" : "s"} available</p>
              </div>
              <button style={{ ...S.btn, background: moduleDef.color, color: "#fff" }}
                onClick={() => setPicker({ scopeType: "inquiry", scopeId: inq.id, scopeLabel: `${moduleDef.title} · ${inq.title}`, title: `Practice: ${inq.title}`, subtitle: inq.question })}>
                Practice
              </button>
            </div>
          );
        })}
      </div>

      {picker && (
        <CountPickerModal
          title={picker.title} subtitle={picker.subtitle} scopeType={picker.scopeType}
          poolSize={poolForScope(questions, picker.scopeType, picker.scopeId).length}
          onCancel={() => setPicker(null)}
          onStart={count => { onLaunch({ ...picker, color: moduleDef.color, count }); setPicker(null); }}
        />
      )}
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ user, questions, onSelectModule, onViewProgress, onLaunch }) {
  const [yearPicker, setYearPicker] = useState(false);
  const totalQuestions = questions.length;

  return (
    <div style={S.cont}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: 26 }}>🧬 Biology</h1>
          <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Pick a module to practise, or jump into a whole-year mix.</p>
        </div>
        <button style={{ ...S.btn, ...S.btnOutline }} onClick={onViewProgress}>My Progress</button>
      </div>

      <div style={{ ...S.card, marginBottom: "1.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", background: "#1a1a1a", color: "#fff", border: "none" }}>
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#fff" }}>Whole Year Quiz</h3>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{totalQuestions} questions across every module</p>
        </div>
        <button style={{ ...S.btn, background: "#fff", color: "#1a1a1a" }} onClick={() => setYearPicker(true)}>Start</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
        {MODULE_DEFS.map(m => {
          const moduleQuestions = questions.filter(q => q.module_id === m.id);
          return (
            <div key={m.id} style={{ ...S.card, cursor: "pointer", borderTop: `3px solid ${m.color}`, transition: "all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.09)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}
              onClick={() => onSelectModule(m)}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>{m.title}</h3>
              <p style={{ margin: "0 0 14px", fontSize: 13, color: "#777", lineHeight: 1.5 }}>{m.description}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{moduleQuestions.length} questions · {m.inquiries.length} inquiry questions</p>
            </div>
          );
        })}
      </div>

      {yearPicker && (
        <CountPickerModal
          title="Whole Year Quiz" subtitle="A random mix from every module" scopeType="year"
          poolSize={totalQuestions}
          onCancel={() => setYearPicker(false)}
          onStart={count => { onLaunch({ scopeType: "year", scopeId: "year", scopeLabel: "Whole Year Quiz", color: "#1a1a1a", count }); setYearPicker(false); }}
        />
      )}
    </div>
  );
}

// ─── MY PROGRESS PAGE ─────────────────────────────────────────────────────────
function ProgressPage({ user, onBack }) {
  const { attempts, loading } = useMyAttempts(user.code);

  const scopeName = (a) => {
    if (a.scope_type === "year") return "Whole Year Quiz";
    if (a.scope_type === "module") return findModule(a.scope_id)?.title || a.scope_id;
    const inq = findInquiry(a.scope_id);
    return inq ? `${inq.moduleTitle} · ${inq.title}` : a.scope_id;
  };

  return (
    <div style={S.cont}>
      <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm, marginBottom: "1.5rem" }} onClick={onBack}>← Home</button>
      <h1 style={{ margin: "0 0 6px", fontSize: 26 }}>My Progress</h1>
      <p style={{ margin: "0 0 1.5rem", color: "#666", fontSize: 14 }}>Every attempt is kept, so you can see how your revision is going over time.</p>

      {loading && <p style={{ color: "#888" }}>Loading...</p>}
      {!loading && attempts.length === 0 && (
        <div style={{ ...S.card, textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "#aaa" }}>No attempts yet — jump into a module to start practising.</p>
        </div>
      )}
      {!loading && attempts.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={S.th}>Date</th>
                <th style={S.th}>Scope</th>
                <th style={S.th}>Score</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map(a => {
                const pct = a.total ? Math.round((a.correct / a.total) * 100) : 0;
                const gc = gradientColor(pct);
                return (
                  <tr key={a.id}>
                    <td style={S.td}>{new Date(a.submitted_at).toLocaleString()}</td>
                    <td style={S.td}>{scopeName(a)}</td>
                    <td style={S.td}>
                      <span style={{ ...S.badge, background: gc.bg, color: gc.text }}>{a.correct}/{a.total} ({pct}%)</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── QUESTION EDITOR ──────────────────────────────────────────────────────────
function QuestionEditor({ question, onSave, onCancel }) {
  const [q, setQ] = useState(question);

  const updateField = (field, value) => setQ(prev => ({ ...prev, [field]: value }));
  const updatePair = (idx, field, value) => { const newPairs = [...(q.pairs || [])]; newPairs[idx] = { ...newPairs[idx], [field]: value }; setQ(prev => ({ ...prev, pairs: newPairs })); };
  const updateItem = (idx, value) => { const newItems = [...(q.items || [])]; newItems[idx] = value; setQ(prev => ({ ...prev, items: newItems })); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label style={S.label}>Type</label>
        <select value={q.type || ""} onChange={e => setQ({ ...question, type: e.target.value })} style={{ ...S.input, fontFamily: "Lato" }}>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="true-false">True/False</option>
          <option value="fill-blank">Fill Blank</option>
          <option value="word-bank">Word Bank</option>
          <option value="drag-drop">Drag Drop (Matching)</option>
          <option value="ordering">Ordering</option>
        </select>
      </div>
      <div>
        <label style={S.label}>Prompt / Question Text</label>
        <textarea value={q.prompt || ""} onChange={e => updateField("prompt", e.target.value)}
          style={{ ...S.input, minHeight: 80, resize: "vertical", fontFamily: "Lato" }} placeholder="Enter the question or prompt here..." />
      </div>
      <div>
        <label style={S.label}>Image URL (optional)</label>
        <input value={q.image || ""} onChange={e => updateField("image", e.target.value)} style={S.input} placeholder="https://example.com/image.png" />
      </div>

      {q.type === "multiple-choice" && (
        <div>
          <label style={S.label}>Options</label>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input value={q.options?.[i] || ""} onChange={e => { const no = [...(q.options || ["", "", "", ""])]; no[i] = e.target.value; setQ(prev => ({ ...prev, options: no })); }} style={{ ...S.input, flex: 1 }} placeholder={`Option ${i + 1}`} />
              <input type="radio" name="answer" checked={q.answer === q.options?.[i]} onChange={() => updateField("answer", q.options?.[i])} style={{ width: 20, height: 20, cursor: "pointer" }} title="Select as correct answer" />
            </div>
          ))}
        </div>
      )}

      {q.type === "true-false" && (
        <div>
          <label style={S.label}>Correct Answer</label>
          <div style={{ display: "flex", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="radio" name="tfAnswer" checked={q.answer === "True"} onChange={() => updateField("answer", "True")} /><span>True</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="radio" name="tfAnswer" checked={q.answer === "False"} onChange={() => updateField("answer", "False")} /><span>False</span>
            </label>
          </div>
        </div>
      )}

      {q.type === "fill-blank" && (
        <div>
          <label style={S.label}>Correct Answer</label>
          <input value={q.answer || ""} onChange={e => updateField("answer", e.target.value)} style={S.input} placeholder="Type the correct answer here" />
          <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>Note: Use ___ in the prompt to mark the blank</p>
        </div>
      )}

      {q.type === "word-bank" && (
        <div>
          <label style={S.label}>Word Bank (5 words: 1 correct, 4 distractors)</label>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input value={q.bank?.[i] || ""} onChange={e => { const nb = [...(q.bank || ["", "", "", "", ""])]; nb[i] = e.target.value; setQ(prev => ({ ...prev, bank: nb })); }}
                style={{ ...S.input, flex: 1 }} placeholder={`Word ${i + 1}`} />
              <input type="radio" name="bankAnswer" checked={q.answer === q.bank?.[i]} onChange={() => updateField("answer", q.bank?.[i])} style={{ width: 20, height: 20, cursor: "pointer" }} title="Select as correct answer" />
            </div>
          ))}
          <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>Note: Use ___ in the prompt to mark the blank</p>
        </div>
      )}

      {q.type === "drag-drop" && (
        <div>
          <label style={S.label}>Pairs (Item → Match)</label>
          {(q.pairs || []).map((pair, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={pair.item || ""} onChange={e => updatePair(i, "item", e.target.value)} style={{ ...S.input, flex: 1 }} placeholder="Item" />
              <span style={{ padding: "8px 0", fontSize: 14 }}>→</span>
              <input value={pair.match || ""} onChange={e => updatePair(i, "match", e.target.value)} style={{ ...S.input, flex: 1 }} placeholder="Match" />
              <button style={{ ...S.btn, ...S.btnDanger, ...S.btnSm }} onClick={() => {
                const newPairs = q.pairs.filter((_, idx) => idx !== i);
                const newAns = { ...(q.answer || {}) }; delete newAns[pair.item];
                setQ(prev => ({ ...prev, pairs: newPairs, answer: newAns }));
              }}>Delete</button>
            </div>
          ))}
          <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm, marginTop: 8 }} onClick={() => setQ(prev => ({ ...prev, pairs: [...(prev.pairs || []), { item: "", match: "" }] }))}>+ Add Pair</button>
        </div>
      )}

      {q.type === "ordering" && (
        <div>
          <label style={S.label}>Items to Order (in correct sequence)</label>
          {(q.items || []).map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span style={{ padding: "8px 12px", background: "#e5e3dc", borderRadius: 6, fontWeight: 700, minWidth: 30, textAlign: "center" }}>{i + 1}</span>
              <input value={item || ""} onChange={e => updateItem(i, e.target.value)} style={{ ...S.input, flex: 1 }} placeholder={`Step ${i + 1}`} />
              <button style={{ ...S.btn, ...S.btnDanger, ...S.btnSm }} onClick={() => { const ni = q.items.filter((_, idx) => idx !== i); setQ(prev => ({ ...prev, items: ni, answer: ni })); }}>Delete</button>
            </div>
          ))}
          <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm, marginTop: 8 }} onClick={() => setQ(prev => ({ ...prev, items: [...(prev.items || []), ""], answer: [...(prev.answer || []), ""] }))}>+ Add Step</button>
          <p style={{ fontSize: 12, color: "#888", margin: "8px 0 0" }}>Items will be shown in random order to students; you're setting the correct sequence here.</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ ...S.btn, ...S.btnPrimary, flex: 1, justifyContent: "center" }} onClick={() => onSave(q)}>Save Question</button>
        <button style={{ ...S.btn, ...S.btnOutline, flex: 1, justifyContent: "center" }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({ questions, questionsApi, users, usersApi, flagsApi, onBack }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [tab, setTab] = useState("questions");

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f4f0" }}>
        <div style={{ ...S.card, width: "100%", maxWidth: 360 }}>
          <h2 style={{ margin: "0 0 1rem" }}>Admin Access</h2>
          <input type="password" style={{ ...S.input, marginBottom: 10 }} placeholder="Password" value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (pw === ADMIN_PASSWORD ? setAuthed(true) : setPwErr("Incorrect password."))} />
          {pwErr && <p style={{ color: "#DC2626", fontSize: 13, margin: "0 0 10px" }}>{pwErr}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ ...S.btn, ...S.btnPrimary, flex: 1, justifyContent: "center" }}
              onClick={() => pw === ADMIN_PASSWORD ? setAuthed(true) : setPwErr("Incorrect password.")}>Enter</button>
            <button style={{ ...S.btn, ...S.btnOutline, flex: 1, justifyContent: "center" }} onClick={onBack}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.cont}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Admin Panel</h1>
        <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm }} onClick={onBack}>Exit Admin</button>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button style={S.tabBtn(tab === "questions")} onClick={() => setTab("questions")}>Questions</button>
        <button style={S.tabBtn(tab === "flags")} onClick={() => setTab("flags")}>
          Flags {flagsApi.flags.filter(f => !f.resolved).length > 0 && `(${flagsApi.flags.filter(f => !f.resolved).length})`}
        </button>
        <button style={S.tabBtn(tab === "students")} onClick={() => setTab("students")}>Students</button>
        <button style={S.tabBtn(tab === "progress")} onClick={() => setTab("progress")}>Progress</button>
      </div>

      {tab === "questions" && <AdminQuestions questions={questions} questionsApi={questionsApi} />}
      {tab === "flags" && <AdminFlags flagsApi={flagsApi} questions={questions} questionsApi={questionsApi} />}
      {tab === "students" && <AdminStudents users={users} usersApi={usersApi} />}
      {tab === "progress" && <AdminProgress users={users} />}
    </div>
  );
}

function AdminQuestions({ questions, questionsApi }) {
  const [moduleId, setModuleId] = useState(MODULE_DEFS[0].id);
  const mod = findModule(moduleId);
  const [inquiryId, setInquiryId] = useState(mod.inquiries[0].id);
  const [editing, setEditing] = useState(null); // question object or "new"
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkErr, setBulkErr] = useState("");

  const changeModule = (id) => { setModuleId(id); setInquiryId(findModule(id).inquiries[0].id); };

  const bankQuestions = questions.filter(q => q.inquiry_id === inquiryId);

  const blankQuestion = { type: "multiple-choice", prompt: "", image: "", options: ["", "", "", ""], answer: "" };

  const saveQuestion = async (q) => {
    if (editing && editing.id) await questionsApi.updateQuestion(editing.id, q);
    else await questionsApi.addQuestion(moduleId, inquiryId, q);
    setEditing(null);
  };

  const runBulkImport = async () => {
    setBulkErr("");
    let parsed;
    try { parsed = JSON.parse(bulkText); } catch (e) { setBulkErr("Invalid JSON — check the format guide."); return; }
    if (!Array.isArray(parsed)) { setBulkErr("Expected a JSON array of question objects."); return; }
    const ok = await questionsApi.addQuestionsBulk(moduleId, inquiryId, parsed);
    if (!ok) { setBulkErr("Import failed — check the console for details."); return; }
    setBulkText(""); setBulkOpen(false);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <select value={moduleId} onChange={e => changeModule(e.target.value)} style={{ ...S.input, width: "auto", minWidth: 220 }}>
          {MODULE_DEFS.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <select value={inquiryId} onChange={e => setInquiryId(e.target.value)} style={{ ...S.input, width: "auto", minWidth: 220 }}>
          {mod.inquiries.map(i => <option key={i.id} value={i.id}>{i.id} — {i.title}</option>)}
        </select>
      </div>

      <div style={{ ...S.card, marginBottom: "1.25rem" }}>
        <p style={{ margin: "0 0 4px", fontSize: 13, color: "#666", fontStyle: "italic" }}>{findInquiry(inquiryId)?.question}</p>
        <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{bankQuestions.length} question{bankQuestions.length === 1 ? "" : "s"} in this bank</p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
        <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => setEditing({ id: null, ...blankQuestion })}>+ Add Question</button>
        <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => setBulkOpen(true)}>Bulk Import (JSON)</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={S.th}>Prompt</th>
              <th style={S.th}>Type</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {bankQuestions.map(q => (
              <tr key={q.id}>
                <td style={{ ...S.td, maxWidth: 360 }}>{q.prompt}</td>
                <td style={S.td}>{q.type}</td>
                <td style={S.td}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm }} onClick={() => setEditing(q)}>Edit</button>
                    <button style={{ ...S.btn, ...S.btnDanger, ...S.btnSm }} onClick={() => { if (confirm("Delete this question?")) questionsApi.deleteQuestion(q.id); }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {bankQuestions.length === 0 && (
              <tr><td style={S.td} colSpan={3}><span style={{ color: "#aaa" }}>No questions yet for this inquiry question.</span></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <h3 style={{ margin: "0 0 14px" }}>{editing.id ? "Edit Question" : "New Question"}</h3>
            <QuestionEditor question={editing} onSave={saveQuestion} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}

      {bulkOpen && (
        <div style={S.modal}>
          <div style={{ ...S.modalBox, maxWidth: 640 }}>
            <h3 style={{ margin: "0 0 6px" }}>Bulk Import Questions</h3>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 12px" }}>Imports into <strong>{mod.title} → {inquiryId} {findInquiry(inquiryId)?.title}</strong> and is immediately visible to students. Paste a JSON array in this format:</p>
            <pre style={{ background: "#f5f4f0", padding: 12, borderRadius: 8, fontSize: 11, overflowX: "auto", marginBottom: 12 }}>{FORMAT_GUIDE}</pre>
            <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} style={{ ...S.input, minHeight: 160, fontFamily: "monospace", fontSize: 12, marginBottom: 10 }} placeholder="Paste JSON array here..." />
            {bulkErr && <p style={{ color: "#DC2626", fontSize: 13, margin: "0 0 10px" }}>{bulkErr}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btn, ...S.btnPrimary, flex: 1, justifyContent: "center" }} onClick={runBulkImport}>Import</button>
              <button style={{ ...S.btn, ...S.btnOutline, flex: 1, justifyContent: "center" }} onClick={() => { setBulkOpen(false); setBulkErr(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminFlags({ flagsApi, questions, questionsApi }) {
  const [editing, setEditing] = useState(null);
  const unresolved = flagsApi.flags.filter(f => !f.resolved);
  const questionById = id => questions.find(q => q.id === id);

  return (
    <div>
      {unresolved.length === 0 && (
        <div style={{ ...S.card, textAlign: "center", padding: "2.5rem" }}>
          <p style={{ color: "#aaa" }}>No open flags. 🎉</p>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {unresolved.map(f => {
          const q = questionById(f.question_id);
          return (
            <div key={f.id} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 300px" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600 }}>{q ? q.prompt : "(question deleted)"}</p>
                  <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888" }}>Flagged by {f.user_code} · {new Date(f.created_at).toLocaleString()}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {f.reasons.map(r => {
                      const reason = FLAG_REASONS.find(fr => fr.id === r);
                      return <span key={r} style={{ ...S.badge, background: "#f3e8ff", color: "#4c1d95" }}>{reason?.icon} {reason?.label}</span>;
                    })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                  {q && <button style={{ ...S.btn, ...S.btnOutline, ...S.btnSm }} onClick={() => setEditing(q)}>Edit Question</button>}
                  <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm }} onClick={() => flagsApi.resolveFlag(f.id)}>Resolve</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <h3 style={{ margin: "0 0 14px" }}>Edit Question</h3>
            <QuestionEditor question={editing} onSave={async q => { await questionsApi.updateQuestion(editing.id, q); setEditing(null); }} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

function AdminStudents({ users, usersApi }) {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", className: "", year: "" });
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkErr, setBulkErr] = useState("");
  const [selected, setSelected] = useState([]);

  const codes = Object.keys(users).sort();

  const addSingle = async () => {
    if (!form.code.trim() || !form.name.trim()) return;
    const ok = await usersApi.addUser(form.code.trim().toUpperCase(), { name: form.name.trim(), className: form.className.trim(), year: form.year.trim() });
    if (ok) { setForm({ code: "", name: "", className: "", year: "" }); setAddOpen(false); }
  };

  const runBulk = async () => {
    setBulkErr("");
    const lines = bulkText.split("\n").map(l => l.trim()).filter(Boolean);
    const records = [];
    for (const line of lines) {
      const parts = line.split(",").map(p => p.trim());
      if (parts.length < 4) { setBulkErr(`Line skipped (needs 4 fields): ${line}`); continue; }
      const [lastName, firstName, className, year, code] = parts;
      records.push({ code: (code || "").toUpperCase(), name: `${firstName} ${lastName}`, className, year });
    }
    if (!records.length) { setBulkErr("No valid rows found."); return; }
    const ok = await usersApi.addUsersBulk(records);
    if (!ok) { setBulkErr("Import failed — a code may already exist."); return; }
    setBulkText(""); setBulkOpen(false);
  };

  const toggleSelect = (code) => setSelected(p => p.includes(code) ? p.filter(c => c !== code) : [...p, code]);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => setAddOpen(true)}>+ Add Student</button>
        <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => setBulkOpen(true)}>Bulk Import</button>
        {selected.length > 0 && (
          <button style={{ ...S.btn, ...S.btnDanger }} onClick={() => { if (confirm(`Remove ${selected.length} student(s)?`)) { usersApi.removeUsersBulk(selected); setSelected([]); } }}>
            Remove Selected ({selected.length})
          </button>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={S.th}></th>
              <th style={S.th}>Code</th>
              <th style={S.th}>Name</th>
              <th style={S.th}>Class</th>
              <th style={S.th}>Year</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {codes.map(code => (
              <tr key={code}>
                <td style={S.td}><input type="checkbox" checked={selected.includes(code)} onChange={() => toggleSelect(code)} /></td>
                <td style={S.td}>{code}</td>
                <td style={S.td}>{users[code].name}</td>
                <td style={S.td}>{users[code].className}</td>
                <td style={S.td}>{users[code].year}</td>
                <td style={S.td}><button style={{ ...S.btn, ...S.btnDanger, ...S.btnSm }} onClick={() => { if (confirm(`Remove ${code}?`)) usersApi.removeUser(code); }}>Remove</button></td>
              </tr>
            ))}
            {codes.length === 0 && <tr><td style={S.td} colSpan={6}><span style={{ color: "#aaa" }}>No students yet.</span></td></tr>}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <h3 style={{ margin: "0 0 14px" }}>Add Student</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.5rem" }}>
              <div><label style={S.label}>Login Code</label><input style={S.input} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="STU-1234" /></div>
              <div><label style={S.label}>Name</label><input style={S.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" /></div>
              <div><label style={S.label}>Class</label><input style={S.input} value={form.className} onChange={e => setForm(f => ({ ...f, className: e.target.value }))} placeholder="11A" /></div>
              <div><label style={S.label}>Year</label><input style={S.input} value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="11" /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btn, ...S.btnPrimary, flex: 1, justifyContent: "center" }} onClick={addSingle}>Add</button>
              <button style={{ ...S.btn, ...S.btnOutline, flex: 1, justifyContent: "center" }} onClick={() => setAddOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {bulkOpen && (
        <div style={S.modal}>
          <div style={{ ...S.modalBox, maxWidth: 640 }}>
            <h3 style={{ margin: "0 0 6px" }}>Bulk Import Students</h3>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 8px" }}>One student per line: <code>Last, First, Class, Year, Code</code></p>
            <pre style={{ background: "#f5f4f0", padding: 12, borderRadius: 8, fontSize: 12, marginBottom: 12 }}>{BULK_STUDENT_GUIDE}</pre>
            <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} style={{ ...S.input, minHeight: 140, fontFamily: "monospace", fontSize: 12, marginBottom: 10 }} placeholder="Paste rows here..." />
            {bulkErr && <p style={{ color: "#DC2626", fontSize: 13, margin: "0 0 10px" }}>{bulkErr}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btn, ...S.btnPrimary, flex: 1, justifyContent: "center" }} onClick={runBulk}>Import</button>
              <button style={{ ...S.btn, ...S.btnOutline, flex: 1, justifyContent: "center" }} onClick={() => { setBulkOpen(false); setBulkErr(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminProgress({ users }) {
  const { attempts, loading } = useAllAttempts();
  const codes = Object.keys(users).sort();

  const statsFor = (code) => {
    const mine = attempts.filter(a => a.user_code === code);
    const totalQuestions = mine.reduce((s, a) => s + (a.total || 0), 0);
    const totalCorrect = mine.reduce((s, a) => s + (a.correct || 0), 0);
    const avgPct = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : null;
    const last = mine[0]; // already ordered desc by submitted_at
    return { attemptCount: mine.length, totalQuestions, avgPct, lastActive: last?.submitted_at };
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 1.25rem" }}>This is a revision tool, so the focus is on practice volume rather than single scores — how much each student is actually practising.</p>
      {loading && <p style={{ color: "#888" }}>Loading...</p>}
      {!loading && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={S.th}>Student</th>
                <th style={S.th}>Attempts</th>
                <th style={S.th}>Questions Practised</th>
                <th style={S.th}>Avg Score</th>
                <th style={S.th}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {codes.map(code => {
                const s = statsFor(code);
                const gc = gradientColor(s.avgPct);
                return (
                  <tr key={code}>
                    <td style={S.td}>{users[code].name} <span style={{ color: "#aaa" }}>({code})</span></td>
                    <td style={S.td}>{s.attemptCount}</td>
                    <td style={S.td}>{s.totalQuestions}</td>
                    <td style={S.td}>{s.avgPct !== null ? <span style={{ ...S.badge, background: gc.bg, color: gc.text }}>{s.avgPct}%</span> : <span style={{ color: "#ccc" }}>—</span>}</td>
                    <td style={S.td}>{s.lastActive ? new Date(s.lastActive).toLocaleDateString() : <span style={{ color: "#ccc" }}>—</span>}</td>
                  </tr>
                );
              })}
              {codes.length === 0 && <tr><td style={S.td} colSpan={5}><span style={{ color: "#aaa" }}>No students yet.</span></td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const questionsApi = useQuestions();
  const usersApi = useUsers();
  const flagsApi = useFlags();
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login");
  const [activeModule, setActiveModule] = useState(null);
  const [session, setSession] = useState(null); // { scopeType, scopeId, scopeLabel, color, count, key }

  const logout = () => { setUser(null); setPage("login"); setActiveModule(null); setSession(null); };

  if (questionsApi.loading || usersApi.loading) return (
    <div style={{ minHeight: "100vh", background: "#f5f4f0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Lato", color: "#666" }}>
      Loading...
    </div>
  );

  if (page === "admin") return (
    <AdminPanel questions={questionsApi.questions} questionsApi={questionsApi} users={usersApi.users} usersApi={usersApi} flagsApi={flagsApi}
      onBack={() => setPage(user ? "home" : "login")} />
  );
  if (page === "login" || !user) return <LoginPage users={usersApi.users} onLogin={u => { setUser(u); setPage("home"); }} onAdmin={() => setPage("admin")} />;

  const launchSession = (params) => {
    setSession({ ...params, key: Math.random().toString(36).slice(2) });
    setPage("practice");
  };
  const retrySession = () => {
    setSession(prev => ({ ...prev, key: Math.random().toString(36).slice(2) }));
  };
  const exitSession = () => {
    setSession(null);
    setPage(activeModule ? "module" : "home");
  };

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={{ cursor: "pointer" }} onClick={() => { setPage("home"); setActiveModule(null); setSession(null); }}>
          <div style={S.navBrand}>{SCHOOL_NAME}</div>
          <div style={S.navSub}>🧬 Biology</div>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: "#888" }}>{user.name}</span>
        <button style={{ ...S.btn, ...S.btnSm, background: "transparent", color: "#888", border: "1px solid #444", padding: "5px 12px" }} onClick={logout}>Sign out</button>
      </nav>

      {page === "home" && (
        <HomePage user={user} questions={questionsApi.questions}
          onSelectModule={m => { setActiveModule(m); setPage("module"); }}
          onViewProgress={() => setPage("progress")}
          onLaunch={launchSession} />
      )}
      {page === "module" && activeModule && (
        <ModulePage moduleDef={activeModule} questions={questionsApi.questions} user={user}
          onBack={() => setPage("home")} onLaunch={launchSession} />
      )}
      {page === "progress" && <ProgressPage user={user} onBack={() => setPage("home")} />}
      {page === "practice" && session && (
        <PracticeSession
          key={session.key}
          scopeType={session.scopeType} scopeId={session.scopeId} scopeLabel={session.scopeLabel} color={session.color}
          pool={poolForScope(questionsApi.questions, session.scopeType, session.scopeId)} count={session.count}
          user={user} onExit={exitSession} onTryAgain={retrySession}
        />
      )}
    </div>
  );
}
