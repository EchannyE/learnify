import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import OcrSuccessModal from "../components/OcrSuccessModal";
import LoadingButton from "../components/LoadingButton";
import useOcrActions from "../hooks/useOcrActions";
import useOnlineStatus from "../hooks/useOnlineStatus";

import {
  getOfflineItems,
  saveOfflineItem,
  saveOfflineItems,
  deleteOfflineItem,
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

  /* ================= STATE ================= */
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

  /* ================= FETCH NOTES (FIXED) ================= */
  const fetchNotes = async () => {
    try {
      if (!token) {
        setNotes([]);
        return;
      }

      // ONLINE
      if (isOnline) {
        const res = await api.get("/notes");

        // FIX: multiple backend response shapes
        const serverNotes =
          res?.data?.data ||
          res?.data?.notes ||
          res?.data ||
          [];

        if (Array.isArray(serverNotes)) {
          setNotes(serverNotes);

          // sync offline cache safely
          await saveOfflineItems("notes", serverNotes);
        } else {
          console.warn("Invalid notes response:", res.data);
          setNotes([]);
        }

        return;
      }

      // OFFLINE
      const offlineNotes = await getOfflineItems("notes");
      setNotes(Array.isArray(offlineNotes) ? offlineNotes : []);
    } catch (err) {
      console.error("fetchNotes error:", err);

      const offlineNotes = await getOfflineItems("notes");
      setNotes(Array.isArray(offlineNotes) ? offlineNotes : []);
    }
  };

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchNotes();
  }, [isOnline, token]);

  /* ================= POLLING ================= */
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

        if (res?.data?.data?.status === "processed") {
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

  /* ================= SUBMIT NOTE (FIXED DISPLAY BUG) ================= */
  const submitNote = async (event) => {
    event.preventDefault();

    if (!isOnline) return alert("Offline mode: cannot upload.");
    if (!token) return alert("Login required.");

    if (!form.imageUrl && !file && !pastedText) {
      return alert("Provide file, image URL, or text.");
    }

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

      const note = res?.data?.data;

      setSavedNote(note);
      await saveOfflineItem("notes", note);
      setOcrModalOpen(true);

      /* 🔥 FIX: instantly show new note */
      setNotes((prev) => [note, ...prev]);

      // background sync
      fetchNotes();

      if (note?.status !== "processed") {
        pollNoteStatus(note._id);
      }

      setForm({ title: "", subject: "", topic: "", imageUrl: "" });
      setPastedText("");
      setFile(null);
      setFileError("");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setLoading(false);
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
        extra: `Status: ${note.status || "N/A"}`,
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

      {/* SCAN FORM */}
      <form
        onSubmit={submitNote}
        className="rounded-2xl border bg-white p-5 space-y-4"
      >
        <h2 className="text-lg font-semibold">Scan / Upload Note</h2>

        <input
          className="w-full border p-3 rounded-xl"
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <input
          className="w-full border p-3 rounded-xl"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) =>
            setForm({ ...form, subject: e.target.value })
          }
        />

        <input
          className="w-full border p-3 rounded-xl"
          placeholder="Topic"
          value={form.topic}
          onChange={(e) =>
            setForm({ ...form, topic: e.target.value })
          }
        />

        <input
          className="w-full border p-3 rounded-xl"
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={(e) =>
            setForm({ ...form, imageUrl: e.target.value })
          }
        />

        <input
          type="file"
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
        />

        <textarea
          className="w-full border p-3 rounded-xl"
          placeholder="Paste text..."
          value={pastedText}
          onChange={(e) =>
            setPastedText(e.target.value)
          }
        />

        <LoadingButton
          loading={loading}
          loadingText="Scanning..."
          className="bg-blue-600 text-white px-5 py-2 rounded-xl"
          type="submit"
        >
          Scan Note
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
              <h3 className="font-semibold">
                {note.title}
              </h3>
              <p className="text-sm text-gray-500">
                {note.subject}
              </p>
            </div>

            <div className="flex gap-3 text-sm">
              <button
                onClick={() =>
                  downloadNotePdf(note)
                }
                className="text-blue-600"
              >
                PDF
              </button>

              <button
                onClick={() =>
                  downloadNoteDocx(note)
                }
                className="text-green-600"
              >
                DOCX
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* OCR MODAL */}
      <OcrSuccessModal
        open={ocrModalOpen}
        onClose={() =>
          setOcrModalOpen(false)
        }
        onSelect={(action) =>
          handleOcrAction({
            action,
            noteId: savedNote?._id,
            disabled:
              savedNote?.status !== "processed",
          })
        }
      />
    </main>
  );
}