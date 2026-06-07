import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String,
    type: {
      type: String,
      enum: ["mcq", "closed_ended"],
      default: "mcq"
    }
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note"
    },
    subject: String,
    topic: String,
    questionType: {
      type: String,
      enum: ["mcq", "closed_ended"],
      default: "mcq"
    },
    questions: [questionSchema],
    score: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);