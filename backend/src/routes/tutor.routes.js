import express from "express";
import { askTutor } from "../controllers/tutor.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/ask", protect, tutorChat);

export default router;
