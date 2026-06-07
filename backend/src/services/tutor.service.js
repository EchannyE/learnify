import axios from "axios";
import Note from "../models/Note.js";
import RagChunk from "../models/RagChunk.js";

export const askTutor = async ({ studentId, noteId, question, curriculum, subject, topic }) => {
  const note = noteId ? await Note.findOne({ _id: noteId, student: studentId }) : null;

  const noteContext = note?.extractedText
    ? `Use this scanned note as context:\n${note.extractedText}`
    : "No scanned note context was provided.";

  // Search RAG chunks for relevant curriculum resources
  let ragContext = "";
  try {
    const ragChunks = await RagChunk.find({
      subject: new RegExp(subject, "i"),
      ...(topic && { topic: new RegExp(topic, "i") })
    })
      .limit(3)
      .select("chunkText sourceName topic");

    if (ragChunks.length > 0) {
      ragContext = `\n\nCurriculum Resources:\n${ragChunks
        .map((chunk, i) => `${i + 1}. (${chunk.sourceName}) ${chunk.chunkText.substring(0, 300)}...`)
        .join("\n")}`;
    }
  } catch (err) {
    console.warn("RAG search failed:", err.message);
  }

  const prompt = `
You are Learnify, an AI tutor for West African students.
Curriculum: ${curriculum}
Subject: ${subject}

${noteContext}
${ragContext}

Student question:
${question}

Answer format:
1. Simple explanation
2. Step-by-step breakdown
3. Example
4. Practice question
`;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    }
  );

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No answer generated.";
};