import ragChunk from "../models/ragChunk.js";

export const saveRagChunk = async (data) => {
  if (!data.chunkText || !data.embedding?.length) {
    throw new Error("Chunk text and embedding are required");
  }

  return ragChunk.create({
    curriculumType: data.curriculumType,
    subject: data.subject,
    topic: data.topic,
    level: data.level,
    sourceName: data.sourceName,
    sourceFileId: data.sourceFileId,
    sourceMimeType: data.sourceMimeType,
    chunkIndex: data.chunkIndex,
    chunkText: data.chunkText,
    embedding: data.embedding
  });
};

const cosineSimilarity = (vectorA, vectorB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  if (!normA || !normB) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const searchRagChunks = async ({
  embedding,
  curriculumType,
  subject,
  topic,
  limit = 5
}) => {
  if (!embedding?.length) {
    throw new Error("Search embedding is required");
  }

  const query = {};

  if (curriculumType) {
    query.curriculumType = new RegExp(curriculumType, "i");
  }

  if (subject) {
    query.subject = new RegExp(subject, "i");
  }

  if (topic) {
    query.topic = new RegExp(topic, "i");
  }

  const chunks = await ragChunk.find(query).limit(300);

  const scoredChunks = chunks
    .map((chunk) => ({
      _id: chunk._id,
      curriculumType: chunk.curriculumType,
      subject: chunk.subject,
      topic: chunk.topic,
      level: chunk.level,
      sourceName: chunk.sourceName,
      chunkIndex: chunk.chunkIndex,
      chunkText: chunk.chunkText,
      score: cosineSimilarity(embedding, chunk.embedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Number(limit));

  return scoredChunks;
};

export const getRagChunks = async () => {
  return ragChunk.find()
    .select("-embedding")
    .sort({ createdAt: -1 })
    .limit(100);
};