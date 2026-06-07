import express from "express";
import { tutorChat } from "../controllers/tutor.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/ask", protect, tutorChat);

export default router;