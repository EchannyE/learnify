import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useOnlineStatus from "../hooks/useOnlineStatus";
import LoadingButton from "../components/LoadingButton";
import OcrSuccessModal from "../components/OcrSuccessModal";
import useOcrActions from "../hooks/useOcrActions";

import {
  getOfflineItems,
  saveOfflineItems,
  saveOfflineItem,
  deleteOfflineItem,
  clearStore,
} from "../utils/offlineDb";

import {
  downloadPdf,
  downloadDocx,
  formatNoteForDownload,
} from "../utils/downloadFile";

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
    imageUrl: "",
  });

  const [pastedText, setPastedText] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [savedNote, setSavedNote] = useState(null);

  /* ================= FETCH NOTES ================= */
  const fetchNotes = async () => {
    try {
      if (!token) return setNotes([]);

      if (!isOnline) {
        const offline = await getOfflineItems("notes");
        setNotes(offline || []);
        return;
      }

      const res = await api.get("/notes");
      const serverNotes = res.data?.data || [];

      setNotes(serverNotes);
      await saveOfflineItems("notes", serverNotes);
    } catch (err) {
      console.error(err);
      const offline = await getOfflineItems("notes");
      setNotes(offline || []);
    }
  };

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchNotes();
  }, [isOnline]);

  /* ================= POLLING ================= */
  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const pollNoteStatus = (id) => {
    stopPolling();

    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/notes/${id}`);

        if (res.data?.data?.status === "processed") {
          stopPolling();
          fetchNotes();
        }
      } catch {
        stopPolling();
      }
    }, 4000);
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  /* ================= SUBMIT NOTE ================= */
  const submitNote = async (e) => {
    e.preventDefault();

    if (!token) return alert("Login required");
    if (!form.imageUrl && !file && !pastedText) {
      return alert("Provide file, image URL, or text");
    }
    if (fileError) return alert(fileError);

    try {
      setLoading(true);

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
        res = await api.post("/notes", {
          ...form,
          extractedText: pastedText,
        });
      }

      const note = res.data?.data;

      setSavedNote(note);
      await saveOfflineItem("notes", note);
      setOcrModalOpen(true);

      await fetchNotes();

      if (note?.status !== "processed") {
        pollNoteStatus(note._id);
      }

      setForm({ title: "", subject: "", topic: "", imageUrl: "" });
      setPastedText("");
      setFile(null);
      setFileError("");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const deleteNote = async (id) => {
    const ok = window.confirm("Delete this note?");
    if (!ok) return;

    try {
      if (isOnline && token) {
        await api.delete(`/notes/${id}`);
      }

      await deleteOfflineItem("notes", id);

      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  /* ================= CLEAR ALL ================= */
  const clearAllNotes = async () => {
    const ok = window.confirm("Delete ALL notes?");
    if (!ok) return;

    try {
      if (isOnline && token) {
        await api.delete("/notes");
      }

      await clearStore("notes");
      setNotes([]);
    } catch (err) {
      console.error(err);
      alert("Failed to clear notes");
    }
  };

  /* ================= DOWNLOAD ================= */
  const downloadNotePdf = (note) =>
    downloadPdf({
      filename: note.title || "note",
      title: "LEARNIFY NOTE",
      content: formatNoteForDownload(note),
      meta: {
        subject: note.subject,
        topic: note.topic,
      },
    });

  const downloadNoteDocx = (note) =>
    downloadDocx({
      filename: note.title || "note",
      title: "LEARNIFY NOTE",
      content: formatNoteForDownload(note),
      meta: {
        subject: note.subject,
        topic: note.topic,
      },
    });

  /* ================= UI ================= */
  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Notes</h1>

        {notes.length > 0 && (
          <button
            onClick={clearAllNotes}
            className="rounded-lg bg-red-500 px-4 py-2 text-white text-sm"
          >
            Clear All
          </button>
        )}
      </div>

      {/* FORM */}
      <form onSubmit={submitNote} className="space-y-3">
        <input
          className="input"
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <input
          className="input"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) =>
            setForm({ ...form, subject: e.target.value })
          }
        />

        <textarea
          className="input"
          placeholder="Paste text"
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
        />

        <LoadingButton loading={loading} type="submit">
          Upload Note
        </LoadingButton>
      </form>

      {/* NOTES LIST */}
      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note._id}
            className="flex justify-between border p-4 rounded-xl"
          >
            <div>
              <h3 className="font-semibold">{note.title}</h3>
              <p className="text-sm text-gray-500">
                {note.subject}
              </p>
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

      {/* MODAL */}
      <OcrSuccessModal
        open={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
        onSelect={(action) =>
          handleOcrAction({
            action,
            noteId: savedNote?._id,
            disabled: savedNote?.status !== "processed",
          })
        }
      />
    </main>
  );
}
