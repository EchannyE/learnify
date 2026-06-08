import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import OcrSuccessModal from "../components/OcrSuccessModal";
import LoadingButton from "../components/LoadingButton";
import useOcrActions from "../hooks/useOcrActions";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { useToast } from "../context/ToastContext";
import {
  getOfflineItems,
  saveOfflineItem,
  saveOfflineItems
} from "../utils/offlineDb";
import {
  downloadPdf,
  downloadDocx,
  formatNoteForDownload
} from "../utils/downloadFile";

export default function Notes() {
  const { handleOcrAction } = useOcrActions();
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const toast = useToast();
  const token = localStorage.getItem("learnify_token");

  const [form, setForm] = useState({
    title: "",
    subject: "",
    topic: "",
    imageUrl: ""
  });

  const [pastedText, setPastedText] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [savedNote, setSavedNote] = useState(null);

  const fetchNotes = async () => {
    try {
      if (!isOnline) {
        const offlineNotes = await getOfflineItems("notes");
        setNotes(offlineNotes);
        return;
      }

      if (!token) {
        setNotes([]);
        return;
      }

      const res = await api.get("/notes");
      const serverNotes = res.data.data || [];
      setNotes(serverNotes);
      await saveOfflineItems("notes", serverNotes);
    } catch {
      const offlineNotes = await getOfflineItems("notes");
      setNotes(offlineNotes);
    }
  };

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchNotes();
  }, [isOnline, token, navigate]);

  const submitNote = async (event) => {
    event.preventDefault();

    if (!isOnline) {
      return toast.error("You're offline. Connect to the internet to upload notes.");
    }
    if (!token) {
      return toast.error("You must be logged in to upload notes.");
    }
    if (!form.imageUrl && !file && !pastedText) {
      return toast.error("Please provide a file, image URL, or paste some text.");
    }
    if (fileError) {
      return toast.error(fileError);
    }

    try {
      setLoading(true);

      let res;

      if (file) {
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("subject", form.subject);
        formData.append("topic", form.topic);
        if (form.imageUrl) formData.append("imageUrl", form.imageUrl);
        if (pastedText) formData.append("extractedText", pastedText);
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
    } catch (err) {
      const msg = err?.response?.data?.message;
      toast.error(msg || "Failed to upload note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pollNoteStatus = async (noteId) => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/notes/${noteId}`);
        if (res.data.data.status === "processed") {
          clearInterval(interval);
          fetchNotes();
        }
      } catch {
        clearInterval(interval);
      }
    }, 5000);
  };

  const downloadNotePdf = (note) =>
    downloadPdf({
      filename: note.title || "note",
      title: "LEARNIFY NOTE",
      content: formatNoteForDownload(note),
      meta: { subject: note.subject, topic: note.topic, extra: `Status: ${note.status || "N/A"}` }
    });

  const downloadNoteDocx = (note) =>
    downloadDocx({
      filename: note.title || "note",
      title: "LEARNIFY NOTE",
      content: formatNoteForDownload(note),
      meta: { subject: note.subject, topic: note.topic }
    });

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100";

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">OCR Note Scanner</h1>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Upload documents or paste text. Convert notes into structured learning content with AI tools.
        </p>
        {!isOnline && (
          <div className="mt-4 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-800">
            Offline mode enabled — viewing cached notes only.
          </div>
        )}
      </div>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <form onSubmit={submitNote} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <input
              className={inputClass}
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={!isOnline}
            />
            <input
              className={inputClass}
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              disabled={!isOnline}
            />
            <input
              className={inputClass}
              placeholder="Topic"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              disabled={!isOnline}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-600">Upload file</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                className={inputClass}
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (!selected) return setFile(null);
                  const ext = selected.name.split(".").pop().toLowerCase();
                  if (!["pdf", "doc", "docx", "png", "jpg", "jpeg", "webp"].includes(ext)) {
                    setFileError("Only PDF, DOC, DOCX, PNG, JPG, JPEG, and WEBP files are allowed.");
                    setFile(null);
                    return;
                  }
                  setFile(selected);
                  setFileError("");
                }}
                disabled={!isOnline}
              />
              {fileError && (
                <p className="text-sm text-red-600 mt-1">{fileError}</p>
              )}
            </div>

            <input
              className={inputClass}
              placeholder="Image URL (optional)"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              disabled={!isOnline}
            />
          </div>

          <textarea
            rows={5}
            className={inputClass}
            placeholder="Paste text here (optional)"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            disabled={!isOnline}
          />

          <LoadingButton
            loading={loading}
            loadingText="Processing..."
            className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700"
          >
            Create Note
          </LoadingButton>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Saved Notes</h2>

        {notes.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center text-slate-500 shadow-sm">
            No notes available yet.
          </div>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{note.title}</h3>
                  <p className="text-sm text-slate-600">{note.subject} • {note.topic}</p>
                  <div className="mt-2">
                    {note.status === "processed" && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">OCR Processed</span>
                    )}
                    {note.status === "processing" && (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">OCR Processing</span>
                    )}
                    {!note.status && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Pending</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => downloadNotePdf(note)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">PDF</button>
                  <button onClick={() => downloadNoteDocx(note)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700">DOCX</button>
                  <button onClick={() => navigate(`/quiz?noteId=${note._id}`)} className="rounded-xl bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700">Quiz</button>
                  <button onClick={() => navigate(`/tutor?noteId=${note._id}`)} className="rounded-xl bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">Tutor</button>
                  <button onClick={() => navigate(`/study-planner?noteId=${note._id}`)} className="rounded-xl bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700">Planner</button>
                </div>
              </div>

              {note.extractedText && (
                <p className="mt-3 text-sm text-slate-700 line-clamp-2">{note.extractedText}</p>
              )}
            </div>
          ))
        )}
      </section>

      <OcrSuccessModal
        open={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
        onSelect={(action) => handleOcrAction({ action, noteId: savedNote?._id })}
      />
    </main>
  );
}
