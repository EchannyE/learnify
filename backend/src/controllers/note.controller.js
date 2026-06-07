import {
  createNote,
  getStudentNotes,
  getNoteById,
  saveOcrResult
} from "../services/note.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const addNote = async (req, res) => {
  try {
    const noteData = { ...req.body };

    if (req.file) {
      noteData.documentUrl = `${req.protocol}://${req.get("host")}/uploads/notes/${req.file.filename}`;
      noteData.originalFileName = req.file.originalname;
    }

    const note = await createNote(req.user._id, noteData);
    successResponse(res, "Note uploaded. OCR processing started.", note, 201);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const getNotes = async (req, res) => {
  try {
    const notes = await getStudentNotes(req.user._id);
    successResponse(res, "Notes fetched successfully", notes);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const getSingleNote = async (req, res) => {
  try {
    const note = await getNoteById(req.params.id, req.user._id);

    if (!note) {
      return errorResponse(res, "Note not found", 404);
    }

    successResponse(res, "Note fetched successfully", note);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const receiveOcrResult = async (req, res) => {
  try {
    const { noteId, extractedText } = req.body;

    const note = await saveOcrResult(noteId, extractedText);

    successResponse(res, "OCR result saved successfully", note);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};