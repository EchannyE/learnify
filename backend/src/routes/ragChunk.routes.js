import express from "express";
import {
  createRagChunk,
  searchRagContext,
  listRagChunks
} from "../controllers/ragChunk.controller.js";

const router = express.Router();

router.post("/chunks", createRagChunk);
router.post("/search", searchRagContext);
router.get("/chunks", listRagChunks);

export default router;