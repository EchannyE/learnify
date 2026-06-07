import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      trim: true
    },
    topic: {
      type: String,
      trim: true
    },
    imageUrl: {
      type: String,
      trim: true
    },
    documentUrl: {
      type: String,
      trim: true
    },
    originalFileName: {
      type: String,
      trim: true
    },
    extractedText: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "processed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);