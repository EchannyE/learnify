import Note from "../models/Note.js";
import ragChunk from "../models/ragChunk.js";
import axios from "axios";

export const askTutor = async ({
  studentId,
  noteId,
  question,
  subject,
  topic
}) => {

  // 1. Load note
  const note = noteId
    ? await Note.findOne({ _id: noteId, student: studentId })
    : null;

  if (!note) {
    throw new Error("Note not found or not accessible");
  }

  if (note.status !== "processed") {
    throw new Error("Note is still processing. Try again shortly.");
  }

  const noteContext = note.extractedText || "";

  // 2. BETTER RAG RETRIEVAL (no regex-only filtering)
  const chunks = await ragChunk.find({
    subject: subject
  });

  // fallback if subject mismatch
  const filteredChunks = chunks.length
    ? chunks
    : await ragChunk.find();

  // take top relevant chunks (simple heuristic improvement)
  const topChunks = filteredChunks
    .slice(0, 5)
    .map((c) => `• ${c.chunkText}`)
    .join("\n");

  // 3. BUILD STRONG CONTEXT
  const contextBlock = `
NOTE CONTENT:
${noteContext || "No note content available"}

RELEVANT STUDY MATERIAL:
${topChunks || "No curriculum data found"}
`;

  // 4. STRONG BUT SAFE PROMPT
  const prompt = `
You are Learnify AI Tutor.

INSTRUCTIONS:
- Use the provided context as primary knowledge
- If context is incomplete, still give best possible explanation based on it
- Be clear, educational, and step-by-step

SUBJECT: ${subject}
TOPIC: ${topic || "General"}
QUESTION: ${question}

CONTEXT:
${contextBlock}

RESPONSE FORMAT:
1. Simple explanation
2. Step-by-step breakdown
3. Example
4. Practice question
`;

  // 5. GEMINI CALL
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }]
    }
  );

  const answer =
    response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No answer generated.";

  return {
    answer,
    ragChunksFound: filteredChunks.length,
    usedChunks: topChunks.length > 0
  };
};
