import express from "express";
import { generateQuiz, getQuizzes, submitQuiz } from "../controllers/quiz.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/generate", protect, generateQuiz);
router.get("/", protect, getQuizzes);
router.post("/:id/submit", protect, submitQuiz);

export default router;
