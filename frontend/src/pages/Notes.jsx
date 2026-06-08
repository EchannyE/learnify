import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Brain,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileText,
  Send,
  X,
} from "lucide-react";
import api from "../api/axios";
import LoadingButton from "../components/LoadingButton";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { useToast } from "../context/ToastContext";
import {
  getOfflineItems,
  saveOfflineItem,
  saveOfflineItems,
} from "../utils/offlineDb";
import { downloadPdf, downloadDocx, formatNoteForDownload } from "../utils/downloadFile";

/* ─── helpers ─────────────────────────────────────────────── */
const TABS = [
  { id: "quiz",    label: "Quiz Generator", icon: BookOpen,     color: "blue"   },
  { id: "planner", label: "Study Planner",  icon: CalendarDays, color: "yellow" },
  { id: "tutor",   label: "AI Tutor",       icon: Brain,        color: "green"  },
];

const TAB_ACTIVE = {
  blue:   "bg-blue-600 text-white",
  yellow: "bg-yellow-500 text-white",
  green:  "bg-green-600 text-white",
};
const TAB_IDLE = "bg-white border border-slate-200 text-slate-700 hover:border-slate-300";

/* ═══════════════════════════════════════════════════════════ */
export default function Notes() {
  const isOnline  = useOnlineStatus();
  const navigate  = useNavigate();
  const toast     = useToast();
  const token     = localStorage.getItem("learnify_token");

  /* upload form */
  const [form, setForm]           = useState({ title: "", subject: "", topic: "", imageUrl: "" });
  const [pastedText, setPastedText] = useState("");
  const [file, setFile]           = useState(null);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);

  /* notes list */
  const [notes, setNotes]         = useState([]);

  /* active note + tab */
  const [selected, setSelected]   = useState(null);   // full note object
  const [activeTab, setActiveTab] = useState("quiz");

  /* quiz panel */
  const [qType,        setQType]       = useState("mcq");
  const [qLoading,     setQLoading]    = useState(false);
  const [qResult,      setQResult]     = useState(null);   // last generated quiz
  const [qPollMsg,     setQPollMsg]    = useState("");

  /* planner panel */
  const [examDate,   setExamDate]   = useState("");
  const [hours,      setHours]      = useState(2);
  const [pLoading,   setPLoading]   = useState(false);
  const [pResult,    setPResult]    = useState(null);
  const [pPollMsg,   setPPollMsg]   = useState("");

  /* tutor panel */
  const [tSubject,   setTSubject]   = useState("Mathematics");
  const [tTopic,     setTTopic]     = useState("");
  const [tQuestion,  setTQuestion]  = useState("");
  const [tLoading,   setTLoading]   = useState(false);
  const [tMessages,  setTMessages]  = useState([]);
  const chatEndRef = useRef(null);

  /* ── data ──────────────────────────────────────────────── */
  const fetchNotes = async () => {
    try {
      if (!isOnline) { setNotes(await getOfflineItems("notes")); return; }
      if (!token)    { setNotes([]); return; }
      const res = await api.get("/notes");
      const data = res.data.data || [];
      setNotes(data);
      await saveOfflineItems("notes", data);
    } catch {
      setNotes(await getOfflineItems("notes"));
    }
  };

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchNotes();
  }, [isOnline, token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tMessages, tLoading]);

  /* ── select note & reset panels ────────────────────────── */
  const selectNote = (note) => {
    setSelected(note);
    setQResult(null);  setQPollMsg("");
    setPResult(null);  setPPollMsg("");
    setTMessages([]);
    setActiveTab("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── upload ─────────────────────────────────────────────── */
  const submitNote = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("You must be logged in to upload notes.");
    if (!form.imageUrl && !file && !pastedText)
      return toast.error("Please provide a file, image URL, or paste some text.");
    if (fileError) return toast.error(fileError);

    try {
      setUploading(true);
      let res;
      if (file) {
        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("subject", form.subject);
        fd.append("topic", form.topic);
        if (form.imageUrl)  fd.append("imageUrl", form.imageUrl);
        if (pastedText)     fd.append("extractedText", pastedText);
        fd.append("noteFile", file);
        res = await api.post("/notes", fd);
      } else {
        res = await api.post("/notes", { ...form, extractedText: pastedText });
      }
      const note = res.data.data;
      await saveOfflineItem("notes", note);
      await fetchNotes();
      selectNote(note);
      setForm({ title: "", subject: "", topic: "", imageUrl: "" });
      setPastedText("");
      setFile(null);
      setFileError("");
      toast.success("Note created! Choose an action below to use it.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload note. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  /* ── quiz generation ────────────────────────────────────── */
  const generateQuiz = async () => {
    if (!selected) return;
    try {
      setQLoading(true);
      setQResult(null);
      setQPollMsg("Generating quiz with AI — please wait…");
      const res = await api.post("/quizzes/generate", { noteId: selected._id, questionType: qType });
      /* direct response contains quiz (Gemini path) */
      const quiz = res.data?.data?.quiz || res.data?.data;
      if (quiz?.questions?.length) {
        setQResult(quiz);
        setQPollMsg("");
        toast.success("Quiz ready!");
      } else {
        /* n8n async path — fall back to polling */
        pollForQuiz(selected._id);
      }
    } catch (err) {
      setQPollMsg("");
      toast.error(err?.response?.data?.message || "Failed to generate quiz. Please try again.");
    } finally {
      setQLoading(false);
    }
  };

  const pollForQuiz = (noteId) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get("/quizzes");
        const quizzes = res.data.data || [];
        const match = quizzes.find(q => String(q.note) === String(noteId));
        if (match) {
          clearInterval(interval);
          setQResult(match);
          setQPollMsg("");
          setQLoading(false);
          toast.success("Quiz ready!");
        } else if (attempts >= 20) {
          clearInterval(interval);
          setQPollMsg("Taking longer than expected — check the Quiz page for results.");
          setQLoading(false);
        }
      } catch {
        if (attempts >= 20) { clearInterval(interval); setQLoading(false); }
      }
    }, 3000);
  };

  /* ── study plan generation ──────────────────────────────── */
  const generatePlan = async (e) => {
    e.preventDefault();
    if (!selected) return;
    try {
      setPLoading(true);
      setPResult(null);
      setPPollMsg("Generating study plan with AI — please wait…");
      const res = await api.post("/study-plans/generate", { noteId: selected._id, examDate, availableHoursPerDay: hours });
      /* direct response contains plan (Gemini path) */
      const plan = res.data?.data?.studyPlan || res.data?.data;
      if (plan?.plan?.length) {
        setPResult(plan);
        setPPollMsg("");
        toast.success("Study plan ready!");
      } else {
        /* n8n async path — fall back to polling */
        pollForPlan(selected._id);
      }
    } catch (err) {
      setPPollMsg("");
      toast.error(err?.response?.data?.message || "Failed to generate study plan. Please try again.");
      setPLoading(false);
    }
  };

  const pollForPlan = (noteId) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get("/study-plans");
        const plans = res.data.data || [];
        const match = plans.find(p => String(p.note) === String(noteId));
        if (match) {
          clearInterval(interval);
          setPResult(match);
          setPPollMsg("");
          setPLoading(false);
          toast.success("Study plan ready!");
        } else if (attempts >= 15) {
          clearInterval(interval);
          setPPollMsg("Generation is taking longer than expected. Check the Study Planner page for results.");
          setPLoading(false);
        }
      } catch {
        if (attempts >= 15) { clearInterval(interval); setPLoading(false); }
      }
    }, 3000);
  };

  /* ── tutor chat ─────────────────────────────────────────── */
  const askTutor = async (e) => {
    e.preventDefault();
    if (!tQuestion.trim()) return;
    const q = tQuestion;
    setTMessages(prev => [...prev, { role: "user", text: q }]);
    setTQuestion("");
    try {
      setTLoading(true);
      const res = await api.post("/tutor/ask", {
        subject: tSubject,
        topic: tTopic || undefined,
        question: q,
        noteId: selected?._id,
      });
      const data = res.data.data;
      setTMessages(prev => [...prev, { role: "ai", text: data.answer || data }]);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setTMessages(prev => [...prev, {
        role: "error",
        text: msg || "Something went wrong. Please check your connection and try again.",
      }]);
    } finally {
      setTLoading(false);
    }
  };

  /* ── download helpers ───────────────────────────────────── */
  const dlNotePdf  = (n) => downloadPdf({ filename: n.title || "note", title: "LEARNIFY NOTE", content: formatNoteForDownload(n), meta: { subject: n.subject, topic: n.topic } });
  const dlNoteDocx = (n) => downloadDocx({ filename: n.title || "note", title: "LEARNIFY NOTE", content: formatNoteForDownload(n), meta: { subject: n.subject, topic: n.topic } });

  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100";

  /* ═══════════════════════════════════════════════════════ */
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">

      {/* ── HEADER ─────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Note Scanner</h1>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Upload a file, paste an image URL, or type your notes — then instantly generate a quiz, build a study plan, or chat with the AI tutor.
        </p>
        {!isOnline && (
          <div className="mt-4 rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
            Offline mode — viewing cached notes only.
          </div>
        )}
      </div>

      {/* ── UPLOAD FORM ────────────────────────────────── */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Add a New Note</h2>
        <form onSubmit={submitNote} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <input className={inputCls} placeholder="Title" value={form.title}   onChange={e => setForm({ ...form, title:   e.target.value })} />
            <input className={inputCls} placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            <input className={inputCls} placeholder="Topic"   value={form.topic}   onChange={e => setForm({ ...form, topic:   e.target.value })} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Upload file <span className="text-slate-400 font-normal">(PDF, DOC, DOCX, PNG, JPG, WEBP)</span></label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                className={inputCls}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f) return setFile(null);
                  const ext = f.name.split(".").pop().toLowerCase();
                  if (!["pdf","doc","docx","png","jpg","jpeg","webp"].includes(ext)) {
                    setFileError("Only PDF, DOC, DOCX, PNG, JPG, JPEG, and WEBP files are allowed.");
                    setFile(null); return;
                  }
                  setFile(f); setFileError("");
                }}
              />
              {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Image URL <span className="text-slate-400 font-normal">(optional)</span></label>
              <input className={inputCls} placeholder="https://..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Paste text <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea rows={4} className={inputCls} placeholder="Paste your notes or any text here…" value={pastedText} onChange={e => setPastedText(e.target.value)} />
          </div>

          <LoadingButton loading={uploading} loadingText="Processing…" className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-60">
            Scan &amp; Save Note
          </LoadingButton>
        </form>
      </section>

      {/* ── ACTIVE NOTE PANEL ──────────────────────────── */}
      {selected && (
        <section className="rounded-2xl border-2 border-blue-200 bg-blue-50 shadow-sm overflow-hidden">

          {/* selected note banner */}
          <div className="flex items-start justify-between gap-4 px-6 py-4 bg-white border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2">
                <FileText size={20} className="text-blue-700" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-blue-500">Active Note</p>
                <h3 className="font-semibold text-slate-900">{selected.title || "Untitled"}</h3>
                {(selected.subject || selected.topic) && (
                  <p className="text-sm text-slate-500">{[selected.subject, selected.topic].filter(Boolean).join(" • ")}</p>
                )}
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
              <X size={18} />
            </button>
          </div>

          {/* tab bar */}
          <div className="flex gap-2 px-6 py-4 flex-wrap">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${isActive ? TAB_ACTIVE[tab.color] : TAB_IDLE}`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── QUIZ TAB ─────────────────────────────── */}
          {activeTab === "quiz" && (
            <div className="px-6 pb-6 space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700">Question type</label>
                  <select
                    className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={qType}
                    onChange={e => setQType(e.target.value)}
                  >
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="closed_ended">Closed-ended (Short Answer)</option>
                  </select>
                </div>
                <LoadingButton
                  loading={qLoading}
                  loadingText="Generating…"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                  onClick={generateQuiz}
                >
                  Generate Quiz
                </LoadingButton>
              </div>

              {qPollMsg && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800 flex items-center gap-2">
                  <span className="animate-spin inline-block h-3.5 w-3.5 rounded-full border-2 border-blue-400 border-t-transparent" />
                  {qPollMsg}
                </div>
              )}

              {qResult && <QuizResult quiz={qResult} />}

              {!qLoading && !qResult && !qPollMsg && (
                <p className="text-sm text-slate-500">Click <strong>Generate Quiz</strong> to create a 10-question quiz from this note.</p>
              )}
            </div>
          )}

          {/* ── PLANNER TAB ──────────────────────────── */}
          {activeTab === "planner" && (
            <div className="px-6 pb-6 space-y-5">
              <form onSubmit={generatePlan} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Exam date</label>
                  <input type="date" className={inputCls} value={examDate} onChange={e => setExamDate(e.target.value)} required />
                </div>
                <div className="w-40">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Hours / day</label>
                  <input type="number" min="1" max="12" className={inputCls} value={hours} onChange={e => setHours(Number(e.target.value))} required />
                </div>
                <LoadingButton
                  loading={pLoading}
                  loadingText="Generating…"
                  className="rounded-xl bg-yellow-500 px-5 py-3 text-sm text-white font-semibold hover:bg-yellow-600 disabled:opacity-60 whitespace-nowrap"
                >
                  Generate Plan
                </LoadingButton>
              </form>

              {pPollMsg && (
                <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800 flex items-center gap-2">
                  <span className="animate-spin inline-block h-3.5 w-3.5 rounded-full border-2 border-yellow-400 border-t-transparent" />
                  {pPollMsg}
                </div>
              )}

              {pResult && <PlanResult plan={pResult} />}

              {!pLoading && !pResult && !pPollMsg && (
                <p className="text-sm text-slate-500">Set your exam date and daily study hours, then click <strong>Generate Plan</strong>.</p>
              )}
            </div>
          )}

          {/* ── TUTOR TAB ────────────────────────────── */}
          {activeTab === "tutor" && (
            <div className="px-6 pb-6 space-y-4">
              {/* chat messages */}
              <div className="rounded-xl bg-white border border-slate-200 h-72 overflow-y-auto p-3 space-y-3">
                {tMessages.length === 0 && (
                  <p className="text-center text-slate-400 text-sm mt-20">Ask anything about this note 👇</p>
                )}
                {tMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                      msg.role === "user"  ? "ml-auto bg-green-600 text-white"
                      : msg.role === "error" ? "bg-red-50 border border-red-200 text-red-800"
                      : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {msg.role === "error" && <p className="font-semibold mb-1">⚠ Error</p>}
                    {msg.text}
                  </div>
                ))}
                {tLoading && (
                  <div className="bg-slate-100 text-slate-500 rounded-2xl px-4 py-3 text-sm w-fit">
                    Thinking…
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* tutor input */}
              <form onSubmit={askTutor} className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <select
                    className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-100"
                    value={tSubject}
                    onChange={e => setTSubject(e.target.value)}
                  >
                    {["Mathematics","English","Physics","Chemistry","Biology","Economics","Government"].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <input
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-100"
                    placeholder="Topic (optional, e.g. Algebra)"
                    value={tTopic}
                    onChange={e => setTTopic(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-100"
                    placeholder="Ask a question about this note…"
                    value={tQuestion}
                    onChange={e => setTQuestion(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={tLoading || !tQuestion.trim()}
                    className="rounded-xl bg-green-600 px-4 py-3 text-white hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      )}

      {/* ── NOTES LIST ─────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Saved Notes</h2>

        {notes.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm">
            No notes yet. Upload your first note above.
          </div>
        ) : (
          notes.map(note => (
            <NoteCard
              key={note._id}
              note={note}
              isSelected={selected?._id === note._id}
              onSelect={() => selectNote(note)}
              onDeselect={() => setSelected(null)}
              onPdf={dlNotePdf}
              onDocx={dlNoteDocx}
              onNavigate={navigate}
            />
          ))
        )}
      </section>
    </main>
  );
}

/* ─── NoteCard ───────────────────────────────────────────── */
function NoteCard({ note, isSelected, onSelect, onDeselect, onPdf, onDocx, onNavigate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-2xl border bg-white shadow-sm transition-all ${isSelected ? "border-blue-300 ring-2 ring-blue-100" : "border-slate-100"}`}>
      <div className="flex flex-col gap-3 p-5 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 truncate">{note.title || "Untitled"}</h3>
            <StatusBadge status={note.status} />
          </div>
          {(note.subject || note.topic) && (
            <p className="mt-0.5 text-sm text-slate-500">{[note.subject, note.topic].filter(Boolean).join(" • ")}</p>
          )}
          {note.extractedText && (
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">{note.extractedText}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {isSelected ? (
            <button
              onClick={onDeselect}
              className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              Deselect
            </button>
          ) : (
            <button
              onClick={onSelect}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Use this note →
            </button>
          )}
          <button onClick={() => setExpanded(v => !v)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-1">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            More
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 flex flex-wrap gap-2">
          <button onClick={() => onPdf(note)}  className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">PDF</button>
          <button onClick={() => onDocx(note)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700">DOCX</button>
          <button onClick={() => onNavigate(`/quiz?noteId=${note._id}`)}          className="rounded-xl bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700">Quiz Page</button>
          <button onClick={() => onNavigate(`/tutor?noteId=${note._id}`)}         className="rounded-xl bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">Tutor Page</button>
          <button onClick={() => onNavigate(`/study-planner?noteId=${note._id}`)} className="rounded-xl bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700">Planner Page</button>
        </div>
      )}
    </div>
  );
}

/* ─── StatusBadge ────────────────────────────────────────── */
function StatusBadge({ status }) {
  if (status === "processed")
    return <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">OCR Processed</span>;
  if (status === "processing")
    return <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">Processing…</span>;
  return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">Pending</span>;
}

/* ─── QuizResult ─────────────────────────────────────────── */
function QuizResult({ quiz }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-800">{quiz.subject} • {quiz.topic}</h4>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{quiz.questions?.length || 0} Questions</span>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {quiz.questions?.map((q, i) => (
          <div key={i} className="rounded-xl bg-white border border-slate-200 p-4">
            <p className="font-medium text-slate-900 text-sm">{i + 1}. {q.question}</p>
            {q.options?.length > 0 && (
              <div className="mt-2 space-y-1">
                {q.options.map((opt, j) => (
                  <div key={j} className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-700">{opt}</div>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs font-semibold text-green-700">✓ {q.correctAnswer}</p>
            {q.explanation && <p className="mt-1 text-xs text-slate-500">{q.explanation}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── PlanResult ─────────────────────────────────────────── */
function PlanResult({ plan }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">
        Exam: <span className="text-slate-900">{plan.examDate?.slice(0, 10)}</span>
        {" • "}
        {plan.availableHoursPerDay}h/day
      </p>
      <div className="grid gap-3 md:grid-cols-2 max-h-96 overflow-y-auto pr-1">
        {plan.plan?.map((item, i) => (
          <div key={i} className="rounded-xl bg-yellow-50 border border-yellow-100 p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-sm">{item.day}</span>
              <span className="text-xs font-medium text-yellow-700">{item.durationMinutes} min</span>
            </div>
            <p className="mt-1 text-xs text-slate-600">{item.subject} • {item.topic}</p>
            <p className="mt-1 text-xs text-slate-700">{item.task}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
