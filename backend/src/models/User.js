import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    curriculum: {
      type: String,
      enum: ["WAEC", "NECO", "JAMB", "BECE", "GCE"],
      default: "WAEC"
    },
    role: {
      type: String,
      enum: ["student", "parent", "teacher", "admin"],
      default: "student"
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);