import { askTutor } from "../services/tutor.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const tutorChat = async (req, res) => {
  try {
    const { noteId, question, subject, topic } = req.body;

    // 1. VALIDATION (IMPORTANT)
    if (!question || !subject) {
      return errorResponse(res, "Question and subject are required", 400);
    }

    // 2. CALL SERVICE
    const result = await askTutor({
      studentId: req.user._id,
      noteId,
      question,
      subject,
      topic
    });

    return successResponse(
      res,
      "Tutor response generated",
      result
    );

  } catch (error) {
    console.error("❌ Tutor Controller Error:", error);

    return errorResponse(
      res,
      error.message || "Failed to get tutor response",
      500
    );
  }
};
