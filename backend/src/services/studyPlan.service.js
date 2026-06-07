import axios from "axios";
import StudyPlan from "../models/StudyPlan.js";
import Note from "../models/Note.js";

export const requestStudyPlan = async ({
  studentId,
  noteId,
  examDate,
  availableHoursPerDay
}) => {
  const note = await Note.findOne({ _id: noteId, student: studentId });

  if (!note) {
    throw new Error("Note not found");
  }

  const response = await axios.post(process.env.N8N_STUDY_PLANNER_WEBHOOK_URL, {
    studentId,
    noteId,
    subject: note.subject,
    topic: note.topic,
    extractedText: note.extractedText,
    examDate,
    availableHoursPerDay
  });

  return response.data;
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