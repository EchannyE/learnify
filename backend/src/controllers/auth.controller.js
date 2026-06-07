
import { registerUser, loginUser } from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    successResponse(res, "Account created successfully", user, 201);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    successResponse(res, "Login successful", result);
  } catch (error) {
    errorResponse(res, error.message, 401);
  }
};