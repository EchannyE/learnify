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

import {
  getOfflineItems,
  saveOfflineItem,
  saveOfflineItems,
  deleteOfflineItem,
  clearStore
} from "../utils/offlineDb";

import {
  downloadPdf,
  downloadDocx,
  formatNoteForDownload
} from "../utils/downloadFile";

/* ═══════════════════════════════════════════════════════════ */
export default function Notes() {
  const { handleOcrAction } = useOcrActions();
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const token = localStorage.getItem("learnify_token");

  const pollRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    subject: "",
    topic: "",
    imageUrl: ""
  });

  /* upload form */
  const [form, setForm]           = useState({ title: "", subject: "", topic: "", imageUrl: "" });
  const [pastedText, setPastedText] = useState("");
  const [file, setFile]           = useState(null);
  const [fileError, setFileError] = useState("");

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [savedNote, setSavedNote] = useState(null);

  /**
   * FETCH NOTES (ONLINE + OFFLINE)
   */
  const fetchNotes = async () => {
    try {
      if (!isOnline) {
        const offlineNotes = await getOfflineItems("notes");
        setNotes(offlineNotes || []);
        return;
      }

      if (!token) return setNotes([]);

      const res = await api.get("/notes");
      const serverNotes = res.data.data || [];

      setNotes(serverNotes);
      await saveOfflineItems("notes", serverNotes);
    } catch (error) {
      console.error(error);
      const offlineNotes = await getOfflineItems("notes");
      setNotes(offlineNotes || []);
    }
  };

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchNotes();
  }, [isOnline, token]);

  /**
   * POLLING
   */
  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const pollNoteStatus = (noteId) => {
    stopPolling();

    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/notes/${noteId}`);

        if (res.data.data.status === "processed") {
          stopPolling();
          fetchNotes();
        }
      } catch {
        stopPolling();
      }
    }, 4000);
  };

  /**
   * SUBMIT NOTE
   */
  const submitNote = async (event) => {
    event.preventDefault();

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
        const formData = new FormData();

        Object.entries(form).forEach(([k, v]) =>
          formData.append(k, v)
        );

        if (pastedText) {
          formData.append("extractedText", pastedText);
        }

        formData.append("noteFile", file);

        res = await api.post("/notes", formData);
      } else {
        res = await api.post("/notes", { ...form, extractedText: pastedText });
      }
      const note = res.data.data;

      setSavedNote(note);
      await saveOfflineItem("notes", note);
      setOcrModalOpen(true);

      await fetchNotes();

      if (note.status !== "processed") {
        pollNoteStatus(note._id);
      }

      setForm({ title: "", subject: "", topic: "", imageUrl: "" });
      setPastedText("");
      setFile(null);
      setFileError("");
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  /**
   * DELETE SINGLE NOTE
   */
  const deleteNote = async (noteId) => {
    const confirmDelete = window.confirm(
      "Delete this note permanently?"
    );

    if (!confirmDelete) return;

    try {
      if (isOnline && token) {
        await api.delete(`/notes/${noteId}`);
      }

      await deleteOfflineItem("notes", noteId);

      setNotes((prev) =>
        prev.filter((n) => n._id !== noteId)
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete note.");
    }
  };

  /**
   * CLEAR ALL NOTES
   */
  const clearAllNotes = async () => {
    const confirmClear = window.confirm(
      "This will delete ALL notes. Continue?"
    );

    if (!confirmClear) return;

    try {
      if (isOnline && token) {
        await api.delete("/notes");
      }

      await clearStore("notes");

      setNotes([]);
    } catch (error) {
      console.error(error);
      alert("Failed to clear notes.");
    }
  };

  /**
   * DOWNLOADS
   */
  const downloadNotePdf = (note) =>
    downloadPdf({
      filename: note.title || "note",
      title: "LEARNIFY NOTE",
      content: formatNoteForDownload(note),
      meta: {
        subject: note.subject,
        topic: note.topic,
        extra: `Status: ${note.status || "N/A"}`
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

  useEffect(() => {
    return () => stopPolling();
  }, []);

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

      {/* HEADER ACTIONS */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Notes</h1>

        {notes.length > 0 && (
          <button
            onClick={clearAllNotes}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            Clear All
          </button>
        )}
      </div>

      {/* NOTES LIST */}
      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note._id}
            className="flex items-center justify-between rounded-xl border p-4"
          >
            <div>
              <h3 className="font-semibold">
                {note.title}
              </h3>
              <p className="text-sm text-gray-500">
                {note.subject}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Image URL <span className="text-slate-400 font-normal">(optional)</span></label>
              <input className={inputCls} placeholder="https://..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
            </div>
          </div>

            <div className="flex gap-3 text-sm">
              <button
                onClick={() => downloadNotePdf(note)}
                className="text-blue-600"
              >
                PDF
              </button>

              <button
                onClick={() => downloadNoteDocx(note)}
                className="text-green-600"
              >
                DOCX
              </button>

              <button
                onClick={() => deleteNote(note._id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* OCR MODAL */}
      <OcrSuccessModal
        open={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
        onSelect={(action) =>
          handleOcrAction({
            action,
            noteId: savedNote?._id,
            disabled: savedNote?.status !== "processed"
          })
        }
      />

    </main>
  );
}
