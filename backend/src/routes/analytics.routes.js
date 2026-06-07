import express from "express";
import { getStudentAnalytics } from "../controllers/analytics.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getStudentAnalytics);

export default router;