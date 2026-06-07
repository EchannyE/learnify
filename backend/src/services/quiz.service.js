import axios from "axios";
import Quiz from "../models/Quiz.js";
import Note from "../models/Note.js";
import Performance from "../models/Performance.js";

export const requestQuizGeneration = async ({ studentId, noteId, questionType }) => {
  const note = await Note.findOne({ _id: noteId, student: studentId });

  if (!note) {
    throw new Error("Note not found");
  }

  if (!note.extractedText) {
    throw new Error("OCR text is not ready yet");
  }

  const response = await axios.post(process.env.N8N_QUIZ_WEBHOOK_URL, {
    studentId,
    noteId,
    subject: note.subject,
    topic: note.topic,
    questionType,
    extractedText: note.extractedText
  });

  return response.data;
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
    {
      score,
      completed: true
    },
    { new: true }
  );

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const status = score < 50 ? "weak" : score < 75 ? "at_risk" : "mastered";

  await Performance.findOneAndUpdate(
    {
      student: studentId,
      subject: quiz.subject,
      topic: quiz.topic
    },
    {
      $inc: { attempts: 1 },
      $set: {
        averageScore: score,
        status
      }
    },
    { upsert: true, new: true }
  );

  return quiz;
};