import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  addNote,
  getNotes,
  getSingleNote,
  receiveOcrResult
} from "../controllers/note.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* -----------------------------
   PATH SETUP
------------------------------ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../../uploads/notes");

// ensure folder exists
fs.mkdirSync(uploadDir, { recursive: true });

/* -----------------------------
   MULTER STORAGE
------------------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const baseName = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, "-"); // safer sanitization

    const uniqueName = `${baseName}-${Date.now()}${extension}`;

    cb(null, uniqueName);
  }
});

/* -----------------------------
   FILE TYPE VALIDATION
------------------------------ */
const allowedFileTypes = [
  // PDF
  "application/pdf",

  // Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Images (for OCR)
  "image/jpeg",
  "image/jpg",
  "image/png"
];

const fileFilter = (req, file, cb) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, Word documents, and images are supported."), false);
  }
};

/* -----------------------------
   MULTER CONFIG
------------------------------ */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  }
});

/* -----------------------------
   ROUTES
------------------------------ */

// Create note with file upload
router.post(
  "/",
  protect,
  upload.single("noteFile"),
  addNote
);

// Get all notes
router.get("/", protect, getNotes);

// Get single note
router.get("/:id", protect, getSingleNote);

// OCR callback (secure later with token if needed)
router.post("/ocr-result", receiveOcrResult);

/* -----------------------------
   GLOBAL MULTER ERROR HANDLER
------------------------------ */
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error"
    });
  }
  next();
});

export default router;