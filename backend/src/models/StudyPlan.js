import mongoose from "mongoose";

const studyPlanSchema = new mongoose.Schema(
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
    examDate: Date,
    availableHoursPerDay: Number,
    plan: [
      {
        day: String,
        subject: String,
        topic: String,
        durationMinutes: Number,
        task: String,
        completed: {
          type: Boolean,
          default: false
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("StudyPlan", studyPlanSchema);
