import axios from "axios";
import Note from "../models/Note.js";

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
    ? await Note.findOne({
        _id: noteId,
        student: studentId
      })
    : null;

  const noteContext = note?.extractedText
    ? `
Student Note Context:
${note.extractedText}
`
    : "";

  // ─────────────────────────────
  // RAG SEARCH
  // ─────────────────────────────
  let ragContext = "";
  let ragChunksFound = 0;

  try {
    const ragResponse = await axios.post(
      `${process.env.BACKEND_URL}/api/rag/search`,
      {
        question,
        curriculumType: curriculum,
        subject,
        topic,
        limit: 5
      }
    );

    const ragChunks =
      ragResponse.data?.data ||
      ragResponse.data?.matches ||
      ragResponse.data?.results ||
      [];

    ragChunksFound = ragChunks.length;

    if (ragChunks.length > 0) {
      ragContext = `
Retrieved Curriculum Context:

${ragChunks
  .map(
    (chunk, index) => `
SOURCE ${index + 1}
Subject: ${chunk.subject || ""}
Topic: ${chunk.topic || ""}
Source: ${chunk.sourceName || ""}

${chunk.chunkText || chunk.text || chunk.content || ""}
`
  )
  .join("\n\n")}
`;
    }
  } catch (error) {
    console.error("RAG Search Error:", error.message);
  }

  // ─────────────────────────────
  // PROMPT
  // ─────────────────────────────
  const prompt = `
You are Learnify AI Tutor.

Curriculum:
${curriculum}

Subject:
${subject}

Topic:
${topic || "Not specified"}

IMPORTANT RULES:

1. Use the Retrieved Curriculum Context as your PRIMARY source.
2. Use Student Note Context as a secondary source.
3. If curriculum context exists, do not ignore it.
4. If information is missing from the curriculum context, clearly state that.
5. Explain concepts in a way suitable for WAEC, NECO, BECE, JAMB and GCE students.
6. Use simple language.
7. Include examples when appropriate.

${ragContext}

${noteContext}

Student Question:
${question}

Response Format:

📘 Explanation
- Give a simple explanation.

🧩 Step-by-Step Breakdown
- Explain the concept carefully.

✅ Example
- Provide a worked example if relevant.

📝 Practice Question
- Give one practice question without the answer.
`;

  // ─────────────────────────────
  // GEMINI
  // ─────────────────────────────
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    }
  );

  const answer =
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No answer generated.";

  return {
    answer,
    ragChunksFound
  };
};