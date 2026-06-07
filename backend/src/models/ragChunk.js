import mongoose from "mongoose";

const ragChunkSchema = new mongoose.Schema(
  {
    curriculumType: {
      type: String,
      required: true,
      index: true
    },
    subject: {
      type: String,
      required: true,
      index: true
    },
    topic: {
      type: String,
      required: true,
      index: true
    },
    level: {
      type: String,
      default: ""
    },
    sourceName: {
      type: String,
      default: ""
    },
    sourceFileId: {
      type: String,
      default: ""
    },
    sourceMimeType: {
      type: String,
      default: ""
    },
    chunkIndex: {
      type: Number,
      required: true
    },
    chunkText: {
      type: String,
      required: true
    },
    embedding: {
      type: [Number],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("RagChunk", ragChunkSchema);
