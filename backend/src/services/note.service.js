import axios from "axios";
import Note from "../models/Note.js";

export const createNote = async (studentId, data, file) => {
  const noteData = {
    student: studentId,
    title: data.title,
    subject: data.subject,
    topic: data.topic
  };

  /* -----------------------------
     FILE HANDLING (PRODUCTION STYLE)
  ------------------------------ */
  if (file) {
    const fileType = file.mimetype;

    // Save ONLY file path (NOT base64)
    if (fileType.startsWith("image/")) {
      noteData.imageUrl = `/uploads/notes/${file.filename}`;
    } else {
      noteData.documentUrl = `/uploads/notes/${file.filename}`;
      noteData.originalFileName = file.originalname;
    }
  }

  /* -----------------------------
     TEXT NOTES (OCR RESULT)
  ------------------------------ */
  if (data.extractedText) {
    noteData.extractedText = data.extractedText;
    noteData.status = "processed";
  } else {
    noteData.status = "pending";
  }

  const note = await Note.create(noteData);

  /* -----------------------------
     OCR TRIGGER (SAFE VERSION)
  ------------------------------ */
  const shouldTriggerOCR =
    !data.extractedText &&
    process.env.N8N_OCR_WEBHOOK_URL &&
    (noteData.imageUrl || noteData.documentUrl);

  if (shouldTriggerOCR) {
    try {
      await axios.post(process.env.N8N_OCR_WEBHOOK_URL, {
        noteId: note._id,
        imageUrl: note.imageUrl,
        documentUrl: note.documentUrl,
        subject: note.subject,
        topic: note.topic
      });
    } catch (err) {
      console.error("OCR webhook failed:", err.message);
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
    {
      extractedText,
      status: "processed"
    },
    { new: true }
  );
};