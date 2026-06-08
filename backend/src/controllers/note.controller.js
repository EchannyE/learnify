import {
  createNote,
  getStudentNotes,
  getNoteById,
  saveOcrResult
} from "../services/note.service.js";

import { successResponse, errorResponse } from "../utils/apiResponse.js";

/* -----------------------------
   CREATE NOTE
------------------------------ */
export const addNote = async (req, res) => {
  try {
    const note = await createNote(
      req.user._id,
      req.body,
      req.file
    );

    successResponse(
      res,
      "Note uploaded. OCR processing started.",
      note,
      201
    );
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/* -----------------------------
   GET ALL NOTES
------------------------------ */
export const getNotes = async (req, res) => {
  try {
    const notes = await getStudentNotes(req.user._id);
    successResponse(res, "Notes fetched successfully", notes);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/* -----------------------------
   GET SINGLE NOTE
------------------------------ */
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

/* -----------------------------
   OCR CALLBACK
------------------------------ */
export const receiveOcrResult = async (req, res) => {
  try {
    const { noteId, extractedText } = req.body;

    const note = await saveOcrResult(noteId, extractedText);

    successResponse(res, "OCR result saved successfully", note);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};