import axios from "axios";
import Quiz from "../models/Quiz.js";
import Note from "../models/Note.js";
import Performance from "../models/Performance.js";

/* ── Gemini direct generation (no n8n needed) ─────────────── */
const generateWithGemini = async ({ subject, topic, questionType, extractedText }) => {
  const typeLabel = questionType === "mcq" ? "multiple choice (MCQ)" : "closed-ended short answer";
  const optionsInstruction = questionType === "mcq"
    ? 'Include an "options" array with exactly 4 answer choices (A–D).'
    : 'Set "options" to an empty array [].';

  const prompt = `You are a professional exam question generator for WAEC, NECO, JAMB, BECE and GCE students.

Generate exactly 10 ${typeLabel} questions based on the content below.

Subject: ${subject || "General"}
Topic: ${topic || "General"}

Note Content:
${extractedText}

IMPORTANT: Reply ONLY with a valid JSON array. No markdown, no code blocks, no explanation.
Each item must have these exact keys:
- "question": the question text
- "options": ${optionsInstruction}
- "correctAnswer": the correct answer (full text, not just A/B/C/D)
- "explanation": a brief explanation of why this is correct

Example format:
[
  {
    "question": "What is photosynthesis?",
    "options": ["The process plants use to make food", "The process of breathing", "Digestion in plants", "Root absorption"],
    "correctAnswer": "The process plants use to make food",
    "explanation": "Photosynthesis is the process by which plants convert sunlight, water and CO2 into glucose."
  }
]`;

  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] }
  );

  const raw = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

  // Strip markdown fences if present
  const cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
  return JSON.parse(cleaned);
};

/* ── public API ───────────────────────────────────────────── */
export const requestQuizGeneration = async ({ studentId, noteId, questionType }) => {
  const note = await Note.findOne({ _id: noteId, student: studentId });

  if (!note) throw new Error("Note not found");
  if (!note.extractedText) throw new Error("This note has no text content yet. Please paste text when creating the note, or wait for OCR to complete.");

  /* ── Path 1: n8n webhook (if configured) ── */
  if (process.env.N8N_QUIZ_WEBHOOK_URL) {
    const response = await axios.post(process.env.N8N_QUIZ_WEBHOOK_URL, {
      studentId,
      noteId,
      subject: note.subject,
      topic: note.topic,
      questionType,
      extractedText: note.extractedText
    });
    return response.data;
  }

  /* ── Path 2: direct Gemini generation ── */
  const questions = await generateWithGemini({
    subject: note.subject,
    topic: note.topic,
    questionType,
    extractedText: note.extractedText
  });

  const quiz = await Quiz.create({
    student: studentId,
    note: noteId,
    subject: note.subject,
    topic: note.topic,
    questionType,
    questions
  });

  return { quiz, message: "Quiz generated successfully" };
};

export const saveGeneratedQuiz = async (data) => {
  return Quiz.create({
    student: data.studentId,
    note: data.noteId,
    subject: data.subject,
    topic: data.topic,
    questionType: data.questionType,
    questions: data.questions
  });
};

export const getStudentQuizzes = async (studentId) => {
  return Quiz.find({ student: studentId }).sort({ createdAt: -1 });
};

export const submitQuizScore = async ({ quizId, studentId, score }) => {
  const quiz = await Quiz.findOneAndUpdate(
    { _id: quizId, student: studentId },
    { score, completed: true },
    { new: true }
  );

  if (!quiz) throw new Error("Quiz not found");

  const status = score < 50 ? "weak" : score < 75 ? "at_risk" : "mastered";

  await Performance.findOneAndUpdate(
    { student: studentId, subject: quiz.subject, topic: quiz.topic },
    { $inc: { attempts: 1 }, $set: { averageScore: score, status } },
    { upsert: true, new: true }
  );

  return quiz;
};
