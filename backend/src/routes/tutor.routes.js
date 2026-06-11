import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { ask } from "../controllers/tutor.controller.js";

const router = express.Router();

// POST /api/tutor/ask
router.post("/ask", protect, ask);

export default router;
