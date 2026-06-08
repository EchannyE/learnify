import {
  requestQuizGeneration,
  saveGeneratedQuiz,
  getStudentQuizzes,
  submitQuizScore
} from "../services/quiz.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const generateQuiz = async (req, res) => {
  try {
    const result = await requestQuizGeneration({
      studentId: req.user._id,
      noteId: req.body.noteId,
      questionType: req.body.questionType || "mcq",
      extractedText: req.body.extractedText
    });

    successResponse(res, "Quiz generation started", result);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};




export const receiveGeneratedQuiz = async (req, res) => {
  try {
    const quiz = await saveGeneratedQuiz(req.body);
    successResponse(res, "Quiz saved successfully", quiz, 201);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await getStudentQuizzes(req.user._id);
    successResponse(res, "Quizzes fetched successfully", quizzes);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const quiz = await submitQuizScore({
      quizId: req.params.id,
      studentId: req.user._id,
      score: req.body.score
    });

    successResponse(res, "Quiz submitted successfully", quiz);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};