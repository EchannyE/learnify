import Note     from "../models/Note.js";
import RagChunk from "../models/ragChunk.js";
import axios    from "axios";

const GEMINI_KEY        = () => process.env.GEMINI_API_KEY;
const EMBED_MODEL       = "gemini-embedding-2";
const GENERATION_MODEL  = "gemini-2.5-flash";

// ── Cosine similarity ─────────────────────────────────────────────────────────
const cosine = (a, b) => {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
};

// ── Embed a string using the confirmed working model ──────────────────────────
// FIX 3 + 4: correct model name, model NOT in body (only in URL)
const embedText = async (text) => {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${GEMINI_KEY()}`,
    {
      // FIX 4: no "model" field in body — it belongs in the URL only
      content: { parts: [{ text: String(text).slice(0, 8000) }] },
    }
  );
  return res.data?.embedding?.values ?? [];
};

// ── Semantic RAG retrieval ────────────────────────────────────────────────────
// FIX 1: actually embed the question and rank chunks by cosine similarity
const retrieveChunks = async (question, subject, topic, limit = 5) => {
  const queryEmbedding = await embedText(
    `${subject} ${topic || ""} ${question}`
  );

  // Fetch candidate chunks filtered by subject (+ topic if provided)
  const filter = {};
  if (subject) filter.subject = new RegExp(subject, "i");
  if (topic)   filter.topic   = new RegExp(topic,   "i");

  let chunks = await RagChunk.find(filter).lean();

  // Fallback: if subject filter returns nothing, search all chunks
  if (!chunks.length) {
    chunks = await RagChunk.find().lean();
  }

  if (!chunks.length) return [];

  // Rank by cosine similarity against the question embedding
  return chunks
    .map((c) => ({ ...c, score: cosine(queryEmbedding, c.embedding || []) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

// ── Main tutor function ───────────────────────────────────────────────────────
export const askTutor = async ({
  studentId,
  noteId,
  question,
  subject,
  topic,
  curriculumType = "WAEC",
}) => {

  // FIX 2: note is OPTIONAL — tutor works with or without a note
  let noteContext = "";
  if (noteId) {
    const note = await Note.findOne({ _id: noteId, student: studentId });

    if (note?.status === "processed" && note.extractedText) {
      noteContext = note.extractedText;
    } else if (note && note.status !== "processed") {
      // Note exists but OCR not done — continue without it
      noteContext = "";
    }
    // If note not found — silently continue, don't throw
  }

  // FIX 1: semantic retrieval using embeddings + cosine similarity
  const topChunks   = await retrieveChunks(question, subject, topic);
  const ragContext   = topChunks.length
    ? topChunks.map((c, i) => `[${i + 1}] ${c.chunkText}`).join("\n\n")
    : "No curriculum context found.";

  // ── Build prompt ────────────────────────────────────────────────────────────
  const prompt = `
You are Learnify AI Tutor — an expert in ${subject} for West African secondary school students.
Curriculum: ${curriculumType}
Subject:    ${subject}
Topic:      ${topic || "General"}
Question:   ${question}

CURRICULUM CONTEXT (${curriculumType} syllabus — use as primary source):
${ragContext}
${noteContext ? `\nSTUDENT'S SCANNED NOTE:\n${noteContext.slice(0, 1500)}` : ""}

INSTRUCTIONS:
- Use the Curriculum Context as your primary source.
- If context is insufficient, provide the best explanation possible.
- Be clear, student-friendly, and step-by-step.

RESPONSE FORMAT:
1. Simple Explanation
2. Step-by-Step Breakdown
3. Example
4. Practice Question
`.trim();

  // ── Gemini generation call ──────────────────────────────────────────────────
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${GENERATION_MODEL}:generateContent?key=${GEMINI_KEY()}`,
    { contents: [{ parts: [{ text: prompt }] }] }
  );

  const answer =
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No answer generated.";

  return {
    answer,
    ragChunksFound: topChunks.length,
    ragInjected:    topChunks.length > 0,
    usedNote:       !!noteContext,
  };
};
