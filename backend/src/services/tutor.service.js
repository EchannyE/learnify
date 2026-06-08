import axios from "axios";
import Note from "../models/Note.js";
import { searchRagChunks } from "./rag.service.js";

/* ── generate a Gemini text embedding for a string ────────── */
const embedText = async (text) => {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      model: "models/text-embedding-004",
      content: { parts: [{ text }] }
    }
  );
  return res.data?.embedding?.values ?? [];
};

/* ── main tutor function ──────────────────────────────────── */
export const askTutor = async ({
  studentId,
  noteId,
  question,
  curriculum,
  subject,
  topic
}) => {

  // ─────────────────────────────
  // NOTE CONTEXT
  // ─────────────────────────────
  const note = noteId
    ? await Note.findOne({ _id: noteId, student: studentId })
    : null;

  const noteContext = note?.extractedText
    ? `Student Note Context:\n${note.extractedText}`
    : "";

  // ─────────────────────────────
  // RAG SEARCH (with embedding)
  // ─────────────────────────────
  let ragContext = "";
  let ragChunksFound = 0;

  try {
    const embedding = await embedText(question);

    if (embedding.length > 0) {
      const chunks = await searchRagChunks({
        embedding,
        curriculumType: curriculum,
        subject,
        topic,
        limit: 5
      });

      ragChunksFound = chunks.length;

      if (chunks.length > 0) {
        ragContext = `Retrieved Curriculum Context:\n\n${chunks
          .map(
            (chunk, i) =>
              `SOURCE ${i + 1}\nSubject: ${chunk.subject || ""}\nTopic: ${chunk.topic || ""}\nSource: ${chunk.sourceName || ""}\n\n${chunk.chunkText || ""}`
          )
          .join("\n\n---\n\n")}`;
      }
    }
  } catch (err) {
    console.error("RAG search failed:", err.message);
  }

  // ─────────────────────────────
  // PROMPT
  // ─────────────────────────────
  const prompt = `You are Learnify AI Tutor.

Curriculum: ${curriculum || "Not specified"}
Subject: ${subject || "Not specified"}
Topic: ${topic || "Not specified"}

IMPORTANT RULES:
1. Use the Retrieved Curriculum Context as your PRIMARY source.
2. Use Student Note Context as a secondary source.
3. If curriculum context exists, do not ignore it.
4. If information is missing from both contexts, state that clearly.
5. Explain concepts in a way suitable for WAEC, NECO, BECE, JAMB and GCE students.
6. Use simple language and include worked examples when appropriate.

${ragContext ? ragContext + "\n\n" : ""}${noteContext ? noteContext + "\n\n" : ""}Student Question:
${question}

Response Format:

📘 Explanation
- Give a simple explanation.

🧩 Step-by-Step Breakdown
- Explain the concept carefully.

✅ Example
- Provide a worked example if relevant.

📝 Practice Question
- Give one practice question without the answer.`;

  // ─────────────────────────────
  // GEMINI GENERATE
  // ─────────────────────────────
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }]
    }
  );

  const answer =
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No answer generated.";

  return { answer, ragChunksFound };
};
