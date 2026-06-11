import { askTutor } from "../services/tutor.service.js";

// POST /api/tutor/ask
export const ask = async (req, res) => {
  try {
    const {
      question,
      subject,
      topic,
      noteId,
      curriculumType,   
      curriculum,       
    } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({ success: false, message: "question is required." });
    }
    if (!subject) {
      return res.status(400).json({ success: false, message: "subject is required." });
    }

    const result = await askTutor({
      studentId:     req.user._id,
      question,
      subject,
      topic,
      noteId,
      // accept both field names so old frontend still works during transition
      curriculumType: curriculumType || curriculum || "WAEC",
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
