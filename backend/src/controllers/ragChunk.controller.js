import {
  saveRagChunk,
  searchRagChunks,
  getRagChunks
} from "../services/rag.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const createRagChunk = async (req, res) => {
  try {
    const chunk = await saveRagChunk(req.body);

    successResponse(res, "RAG chunk saved successfully", chunk, 201);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const searchRagContext = async (req, res) => {
  try {
    const chunks = await searchRagChunks(req.body);

    successResponse(res, "RAG context fetched successfully", chunks);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const listRagChunks = async (req, res) => {
  try {
    const chunks = await getRagChunks();

    successResponse(res, "RAG chunks fetched successfully", chunks);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};