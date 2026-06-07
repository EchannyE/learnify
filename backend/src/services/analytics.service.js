import Performance from "../models/Performance.js";
import Quiz from "../models/Quiz.js";
import Note from "../models/Note.js";

export const getAnalytics = async (studentId) => {
  const performances = await Performance.find({ student: studentId });
  const quizzes = await Quiz.find({ student: studentId });
  const notes = await Note.find({ student: studentId });

  const weakTopics = performances.filter((item) => item.status === "weak");
  const masteredTopics = performances.filter((item) => item.status === "mastered");

  return {
    totalNotes: notes.length,
    totalQuizzes: quizzes.length,
    completedQuizzes: quizzes.filter((quiz) => quiz.completed).length,
    weakTopics,
    masteredTopics,
    performances
  };
};