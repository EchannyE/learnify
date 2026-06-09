import axios from "axios";
import StudyPlan from "../models/StudyPlan.js";
import Note from "../models/Note.js";

/* ── Gemini direct generation ─────────────────────────────── */
const generatePlanWithGemini = async ({ subject, topic, extractedText, examDate, availableHoursPerDay }) => {
  const today = new Date().toISOString().slice(0, 10);
  const exam  = new Date(examDate).toISOString().slice(0, 10);

  const prompt = `You are a professional study planner for WAEC, NECO, JAMB, BECE and GCE students.

Create a day-by-day study plan from today (${today}) to the exam date (${exam}).
Available study time: ${availableHoursPerDay} hours per day.
Subject: ${subject || "General"}
Topic: ${topic || "General"}

Note Content to study:
${extractedText || "No note content provided — generate a general plan for the subject/topic."}

IMPORTANT: Reply ONLY with a valid JSON array. No markdown, no code blocks, no explanation.
Each item represents one study session and must have these exact keys:
- "day": label like "Day 1 – Mon Jun 10"
- "subject": subject name
- "topic": specific topic to study that day
- "durationMinutes": number (${availableHoursPerDay} hours = ${availableHoursPerDay * 60} minutes)
- "task": a clear, actionable study task description (2-3 sentences)

Spread the note content logically across the available days. End with a revision day before the exam.

Example format:
[
  {
    "day": "Day 1 – Mon Jun 10",
    "subject": "Mathematics",
    "topic": "Algebra – Linear Equations",
    "durationMinutes": 120,
    "task": "Read through your notes on linear equations. Solve 10 practice problems and check your answers."
  }
]`;

  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] }
  );

  const raw = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  const cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
  return JSON.parse(cleaned);
};

/* ── public API ───────────────────────────────────────────── */
export const requestStudyPlan = async ({ studentId, noteId, examDate, availableHoursPerDay }) => {
  const note = noteId
    ? await Note.findOne({ _id: noteId, student: studentId })
    : null;

  if (noteId && !note) throw new Error("Note not found");

  /* ── Path 1: n8n webhook (if configured) ── */
  if (process.env.N8N_STUDY_PLANNER_WEBHOOK_URL) {
    const response = await axios.post(process.env.N8N_STUDY_PLANNER_WEBHOOK_URL, {
      studentId,
      noteId,
      subject: note?.subject,
      topic: note?.topic,
      extractedText: note?.extractedText,
      examDate,
      availableHoursPerDay
    });
    return response.data;
  }

  /* ── Path 2: direct Gemini generation ── */
  const plan = await generatePlanWithGemini({
    subject: note?.subject,
    topic: note?.topic,
    extractedText: note?.extractedText,
    examDate,
    availableHoursPerDay
  });

  const studyPlan = await StudyPlan.create({
    student: studentId,
    note: noteId || undefined,
    examDate,
    availableHoursPerDay,
    plan
  });

  return { studyPlan, message: "Study plan generated successfully" };
};

export const saveGeneratedStudyPlan = async (data) => {
  return StudyPlan.create({
    student: data.studentId,
    note: data.noteId,
    examDate: data.examDate,
    availableHoursPerDay: data.availableHoursPerDay,
    plan: data.plan
  });
};

export const getStudentStudyPlans = async (studentId) => {
  return StudyPlan.find({ student: studentId }).sort({ createdAt: -1 });
};
