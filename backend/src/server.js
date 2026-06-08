import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import noteRoutes from "./routes/note.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import tutorRoutes from "./routes/tutor.routes.js";
import studyPlanRoutes from "./routes/studyPlan.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import ragChunkRoutes from "./routes/ragChunk.routes.js";


dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://learnify-six-mu.vercel.app"
  ],
  credentials: true
}));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Learnify API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/study-plans", studyPlanRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/rag-chunks", ragChunkRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Learnify server running on port ${PORT}`);
});