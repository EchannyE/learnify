import express from "express";
import {
  generateStudyPlan,
  receiveGeneratedStudyPlan,
  getStudyPlans
} from "../controllers/studyPlan.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/generate", protect, generateStudyPlan);
router.get("/", protect, getStudyPlans);

router.post("/generated", receiveGeneratedStudyPlan);

export default router;