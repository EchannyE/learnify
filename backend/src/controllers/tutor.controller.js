import { askTutor } from "../services/tutor.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const tutorChat = async (req, res) => {
  try {
    const answer = await askTutor({
      studentId: req.user._id,
      curriculum: req.user.curriculum,
      subject: req.body.subject,
      question: req.body.question,
      noteId: req.body.noteId,
      topic: req.body.topic
    });

    successResponse(res, "Tutor response generated", answer);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};