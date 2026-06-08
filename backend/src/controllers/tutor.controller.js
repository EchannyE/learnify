import { askTutor } from "../services/tutor.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const tutorChat = async (req, res) => {
  try {
     const result = await askTutor({
  studentId: req.user._id,
  noteId: req.body.noteId,
  question: req.body.question,
  curriculum: req.user.curriculum,
  subject: req.body.subject,
  topic: req.body.topic
});

successResponse(
  res,
  "Tutor response generated",
  result
);

  } catch (error) {
    console.error("Error in tutorChat:", error);
    errorResponse(res, "Failed to get tutor response");
  }
};