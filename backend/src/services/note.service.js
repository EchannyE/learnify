import axios from "axios";
import Note from "../models/Note.js";

export const createNote = async (studentId, data) => {
  const noteData = {
    student: studentId,
    title: data.title,
    subject: data.subject,
    topic: data.topic
  };

  if (data.imageUrl) {
    noteData.imageUrl = data.imageUrl;
  }

  if (data.documentUrl) {
    noteData.documentUrl = data.documentUrl;
    noteData.originalFileName = data.originalFileName;
  }

  if (data.extractedText) {
    noteData.extractedText = data.extractedText;
    noteData.status = "processed";
  }

  const note = await Note.create(noteData);

  if (!data.extractedText && process.env.N8N_OCR_WEBHOOK_URL) {
    await axios.post(process.env.N8N_OCR_WEBHOOK_URL, {
      noteId: note._id,
      imageUrl: note.imageUrl,
      documentUrl: note.documentUrl,
      subject: note.subject,
      topic: note.topic
    });
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
}