import fs from "fs";
import path from "path";
import axios from "axios";
import Note from "../models/Note.js";

/* ── Gemini OCR (image or PDF via base64) ─────────────────── */
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
            { text: "Extract all text from this document or image exactly as written. Return only the extracted text, no commentary or formatting." }
          ]
        }]
      }
    );

    return res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  } catch (err) {
    console.error("Gemini OCR failed:", err.message);
    return "";
  }
};

/* ── Gemini OCR from external image URL ───────────────────── */
const runGeminiOcrUrl = async (imageUrl, mimeType = "image/jpeg") => {
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            { fileData: { fileUri: imageUrl, mimeType } },
            { text: "Extract all text from this image exactly as written. Return only the extracted text, no commentary." }
          ]
        }]
      }
    );

    return res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  } catch (err) {
    console.error("Gemini OCR (URL) failed:", err.message);
    return "";
  }
};

/* ── main create ──────────────────────────────────────────── */
export const createNote = async (studentId, data, file) => {
  const noteData = {
    student: studentId,
    title:   data.title?.trim() || (file ? file.originalname.replace(/\.[^.]+$/, "") : "Untitled Note"),
    subject: data.subject,
    topic:   data.topic,
    status:  "pending"
  };

  /* file handling */
  if (file) {
    if (file.mimetype.startsWith("image/")) {
      noteData.imageUrl = `/uploads/notes/${file.filename}`;
    } else {
      noteData.documentUrl    = `/uploads/notes/${file.filename}`;
      noteData.originalFileName = file.originalname;
    }
  } else if (data.imageUrl) {
    noteData.imageUrl = data.imageUrl;
  }

  /* paste text – already processed */
  if (data.extractedText?.trim()) {
    noteData.extractedText = data.extractedText.trim();
    noteData.status        = "processed";
  }

  const note = await Note.create(noteData);

  /* ── OCR trigger ── */
  if (!noteData.extractedText) {
    if (process.env.N8N_OCR_WEBHOOK_URL && (noteData.imageUrl || noteData.documentUrl)) {
      /* path 1 – n8n */
      axios.post(process.env.N8N_OCR_WEBHOOK_URL, {
        noteId:      note._id,
        imageUrl:    note.imageUrl,
        documentUrl: note.documentUrl,
        subject:     note.subject,
        topic:       note.topic
      }).catch(err => console.error("OCR webhook failed:", err.message));

    } else if (file) {
      /* path 2 – direct Gemini OCR from uploaded file */
      const filePath = path.join(process.cwd(), "uploads", "notes", file.filename);
      const text = await runGeminiOcr(filePath, file.mimetype);
      if (text) {
        await Note.findByIdAndUpdate(note._id, { extractedText: text, status: "processed" });
        note.extractedText = text;
        note.status        = "processed";
      }

    } else if (noteData.imageUrl && noteData.imageUrl.startsWith("http")) {
      /* path 3 – direct Gemini OCR from image URL */
      const text = await runGeminiOcrUrl(noteData.imageUrl);
      if (text) {
        await Note.findByIdAndUpdate(note._id, { extractedText: text, status: "processed" });
        note.extractedText = text;
        note.status        = "processed";
      }
    }
  }

  return note;
};

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
