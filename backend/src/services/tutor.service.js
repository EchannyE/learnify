import Note from "../models/Note.js";
import ragChunk from "../models/ragChunk.js";
import axios from "axios";

export const askTutor = async ({
  studentId,
  noteId,
  question,
  curriculum,
  subject,
  topic
}) => {

  // 1. Get note
  const note = noteId
    ? await Note.findOne({ _id: noteId, student: studentId })
    : null;

  if (!note) {
    throw new Error("Note not found or not accessible");
  }

  if (note.status !== "processed") {
    throw new Error("Note is still processing. Try again shortly.");
  }

  const noteContext = note.extractedText
    ? note.extractedText
    : "";

  // 2. STRICT RAG SEARCH (improved filtering)
  const chunks = await ragChunk.find({
    subject: new RegExp(subject, "i")
  });

  const topChunks = chunks
    .slice(0, 5)
    .map((c) => c.chunkText)
    .join("\n\n");

  const contextBlock = `
===== NOTE CONTENT =====
${noteContext}

===== CURRICULUM CONTENT =====
${topChunks}
`;

  // 3. FORCEFUL PROMPT (THIS IS THE KEY FIX)
  const prompt = `
You are Learnify AI Tutor.

CRITICAL RULE:
You MUST use ONLY the provided context below to answer.
If the answer is not in context, say:
"Based on your notes, I don't have enough information."

CURRICULUM: ${curriculum}
SUBJECT: ${subject}
TOPIC: ${topic || "General"}

QUESTION:
${question}

CONTEXT:
${contextBlock}

FORMAT:
1. Explanation
2. Step-by-step solution
3. Example
4. Practice question
`;

  // 4. CALL GEMINI
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
    ragChunksFound: chunks.length,
    usedChunks: topChunks.length > 0
  };
};
