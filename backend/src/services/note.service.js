import fs from "fs";
import path from "path";
import axios from "axios";
import Note from "../models/Note.js";

/* ─────────────────────────────────────────────────────────────
   HELPER — send payload to n8n OCR webhook
   Always includes noteId, userId, inputType and all metadata
───────────────────────────────────────────────────────────── */
const triggerN8nOcr = (payload) => {
  if (!process.env.N8N_OCR_WEBHOOK_URL) return;

  axios
    .post(process.env.N8N_OCR_WEBHOOK_URL, payload, {
      headers: { "Content-Type": "application/json" },
    })
    .catch((err) => console.error("n8n OCR webhook failed:", err.message));
};

/* ─────────────────────────────────────────────────────────────
   HELPER — direct Gemini OCR from local file (fallback only)
───────────────────────────────────────────────────────────── */
const runGeminiOcr = async (filePath, mimeType) => {
  try {
    const data = fs.readFileSync(filePath);
    const b64  = data.toString("base64");

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            { inlineData: { mimeType, data: b64 } },
            { text: "Extract all text from this document or image exactly as written. Return only the extracted text, no commentary or formatting." },
          ],
        }],
      }
    );

    return res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  } catch (err) {
    console.error("Gemini OCR failed:", err.message);
    return "";
  }
};

/* ─────────────────────────────────────────────────────────────
   HELPER — direct Gemini OCR from external image URL (fallback)
───────────────────────────────────────────────────────────── */
const runGeminiOcrUrl = async (imageUrl, mimeType = "image/jpeg") => {
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            { fileData: { fileUri: imageUrl, mimeType } },
            { text: "Extract all text from this image exactly as written. Return only the extracted text, no commentary." },
          ],
        }],
      }
    );

    return res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  } catch (err) {
    console.error("Gemini OCR (URL) failed:", err.message);
    return "";
  }
};

/* ─────────────────────────────────────────────────────────────
   MAIN — createNote
───────────────────────────────────────────────────────────── */
export const createNote = async (studentId, data, file) => {

  /* ── 1. Build note document ── */
  const noteData = {
    student: studentId,
    title:   data.title?.trim() || (file ? file.originalname.replace(/\.[^.]+$/, "") : "Untitled Note"),
    subject: data.subject  || "",
    topic:   data.topic    || "",
    status:  "pending",
  };

  if (file) {
    if (file.mimetype.startsWith("image/")) {
      noteData.imageUrl = `/uploads/notes/${file.filename}`;
    } else {
      noteData.documentUrl      = `/uploads/notes/${file.filename}`;
      noteData.originalFileName = file.originalname;
    }
  } else if (data.imageUrl) {
    noteData.imageUrl = data.imageUrl;
  }

  /* paste text — already processed, skip OCR */
  if (data.extractedText?.trim()) {
    noteData.extractedText = data.extractedText.trim();
    noteData.status        = "processed";
  }

  const note = await Note.create(noteData);

  /* ── 2. OCR trigger — only when no extractedText yet ── */
  if (!noteData.extractedText) {

    /* ── Shared base payload for all n8n calls ── */
    const basePayload = {
      noteId:  String(note._id),
      userId:  String(studentId),
      title:   note.title,
      subject: note.subject,
      topic:   note.topic,
    };

    /* ────────────────────────────────────────────
       PATH A — FILE UPLOAD
       Read file → base64 → send to n8n as upload
       Falls back to direct Gemini if no webhook URL
    ──────────────────────────────────────────── */
    if (file) {
      if (process.env.N8N_OCR_WEBHOOK_URL) {
        const filePath = path.join(process.cwd(), "uploads", "notes", file.filename);

        let imageBase64 = "";
        try {
          const fileBuffer = fs.readFileSync(filePath);
          imageBase64 = fileBuffer.toString("base64");
        } catch (err) {
          console.error("Failed to read file for n8n:", err.message);
        }

        if (imageBase64) {
          triggerN8nOcr({
            ...basePayload,
            inputType:   "upload",
            imageBase64,             // clean base64 — no data URI prefix
            mimeType:    file.mimetype,
          });
        } else {
          /* base64 read failed — fall back to direct Gemini */
          const filePath2 = path.join(process.cwd(), "uploads", "notes", file.filename);
          const text = await runGeminiOcr(filePath2, file.mimetype);
          if (text) {
            await Note.findByIdAndUpdate(note._id, { extractedText: text, status: "processed" });
            note.extractedText = text;
            note.status        = "processed";
          }
        }

      } else {
        /* No webhook — direct Gemini OCR */
        const filePath = path.join(process.cwd(), "uploads", "notes", file.filename);
        const text = await runGeminiOcr(filePath, file.mimetype);
        if (text) {
          await Note.findByIdAndUpdate(note._id, { extractedText: text, status: "processed" });
          note.extractedText = text;
          note.status        = "processed";
        }
      }

    /* ────────────────────────────────────────────
       PATH B — EXTERNAL IMAGE URL
       Only valid if the URL is publicly reachable.
       Falls back to direct Gemini if no webhook URL.
    ──────────────────────────────────────────── */
    } else if (noteData.imageUrl && noteData.imageUrl.startsWith("http")) {
      if (process.env.N8N_OCR_WEBHOOK_URL) {
        triggerN8nOcr({
          ...basePayload,
          inputType: "url",
          imageUrl:  noteData.imageUrl,
          mimeType:  data.mimeType || "image/jpeg",
        });
      } else {
        const text = await runGeminiOcrUrl(noteData.imageUrl);
        if (text) {
          await Note.findByIdAndUpdate(note._id, { extractedText: text, status: "processed" });
          note.extractedText = text;
          note.status        = "processed";
        }
      }

    /* ────────────────────────────────────────────
       PATH C — LOCAL FILE URL (saved by multer)
       Can't be fetched externally — run direct OCR.
       This covers the case where imageUrl is /uploads/...
    ──────────────────────────────────────────── */
    } else if (noteData.imageUrl && noteData.imageUrl.startsWith("/uploads")) {
      const filePath = path.join(process.cwd(), noteData.imageUrl);
      const mimeType = data.mimeType || "image/jpeg";
      const text = await runGeminiOcr(filePath, mimeType);
      if (text) {
        await Note.findByIdAndUpdate(note._id, { extractedText: text, status: "processed" });
        note.extractedText = text;
        note.status        = "processed";
      }
    }
  }

  return note;
};

/* ─────────────────────────────────────────────────────────────
   READ helpers
───────────────────────────────────────────────────────────── */
export const getStudentNotes = async (studentId) => {
  return Note.find({ student: studentId }).sort({ createdAt: -1 });
};

export const getNoteById = async (noteId, studentId) => {
  return Note.findOne({ _id: noteId, student: studentId });
};

export const saveOcrResult = async (noteId, extractedText) => {
  return Note.findByIdAndUpdate(
    noteId,
    { extractedText, status: "processed" },
    { new: true }
  );
};
