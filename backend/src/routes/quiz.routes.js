import express from "express";
import {
  generateQuiz,
  receiveGeneratedQuiz,
  getQuizzes,
  submitQuiz
} from "../controllers/quiz.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/generate", protect, generateQuiz);
router.get("/", protect, getQuizzes);
router.patch("/:id/submit", protect, submitQuiz);

router.post("/generated", receiveGeneratedQuiz);

export default router;