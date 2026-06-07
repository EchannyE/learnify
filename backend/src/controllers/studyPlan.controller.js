import {
  requestStudyPlan,
  saveGeneratedStudyPlan,
  getStudentStudyPlans
} from "../services/studyPlan.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const generateStudyPlan = async (req, res) => {
  try {
    const result = await requestStudyPlan({
      studentId: req.user._id,
      noteId: req.body.noteId,
      examDate: req.body.examDate,
      availableHoursPerDay: req.body.availableHoursPerDay
    });

    successResponse(res, "Study planner generation started", result);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const receiveGeneratedStudyPlan = async (req, res) => {
  try {
    const plan = await saveGeneratedStudyPlan(req.body);
    successResponse(res, "Study plan saved successfully", plan, 201);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const getStudyPlans = async (req, res) => {
  try {
    const plans = await getStudentStudyPlans(req.user._id);
    successResponse(res, "Study plans fetched successfully", plans);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};