import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    topic: {
      type: String,
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["weak", "at_risk", "mastered"],
      default: "at_risk"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Performance", performanceSchema);