import { getAnalytics } from "../services/analytics.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const getStudentAnalytics = async (req, res) => {
  try {
    const analytics = await getAnalytics(req.user._id);
    successResponse(res, "Analytics fetched successfully", analytics);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};