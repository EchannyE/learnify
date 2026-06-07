import { jsPDF } from "jspdf";
import { Document, Paragraph, Packer, HeadingLevel, TextRun } from "docx";
import { saveAs } from "file-saver";

// ── Brand constants ───────────────────────────────────────────────────────────
const BRAND = {
  name:    "Learnify",
  tagline: "AI-Powered Learning Companion",
  blue:    [37, 99, 235],
  green:   [22, 163, 74],
  yellow:  [250, 204, 21],
  dark:    [15, 23, 42],
  muted:   [100, 116, 139],
  light:   [248, 250, 252],
  border:  [226, 232, 240],
};

// ── Pure helpers ──────────────────────────────────────────────────────────────
const cleanFileName = (name = "learnify-file") =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const isSectionHeading = (text) => {
  const trimmed = text.trim();
  return (
    !!trimmed &&
    trimmed.length <= 60 &&
    trimmed === trimmed.toUpperCase() &&
    /[A-Z]/.test(trimmed)
  );
};

// ── PDF internal helpers (defined BEFORE use) ─────────────────────────────────

// FIX 1: moved addCoverPage above downloadPdf so const is reachable
const addCoverPage = (doc, title, meta = {}) => {
  const { width, height } = doc.internal.pageSize;

  doc.setFillColor(...BRAND.blue);
  doc.rect(0, 0, width, height, "F");
  doc.setTextColor(255, 255, 255);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text("LEARNIFY", width / 2, 70, { align: "center" });

  doc.setFontSize(18);
  doc.text(title, width / 2, 95, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  if (meta.subject) doc.text(`Subject: ${meta.subject}`, width / 2, 120, { align: "center" });
  if (meta.topic)   doc.text(`Topic: ${meta.topic}`,     width / 2, 130, { align: "center" });

  doc.text(
    `Generated: ${new Date().toLocaleDateString()}`,
    width / 2,
    170,
    { align: "center" }
  );

  doc.addPage();
};

const addHeader = (doc, title) => {
  const { width } = doc.internal.pageSize;

  doc.setFillColor(...BRAND.blue);
  doc.rect(0, 0, width, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(BRAND.name, 15, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(BRAND.tagline, 15, 19);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title, width - 15, 17, { align: "right" });

  doc.setTextColor(...BRAND.dark);
};

const addMetaBox = (doc, meta = {}) => {
  const y = 40;

  doc.setFillColor(...BRAND.light);
  doc.setDrawColor(...BRAND.border);
  doc.roundedRect(15, y, 180, 32, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.dark);
  doc.text("Document Details", 20, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);

  doc.text(`Subject: ${meta.subject || "N/A"}`,               20,  y + 17);
  doc.text(`Topic: ${meta.topic || "N/A"}`,                   20,  y + 25);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`,   120, y + 17);
  if (meta.extra) doc.text(meta.extra,                        120, y + 25);

  doc.setTextColor(...BRAND.dark);
  return y + 45; // returns next Y position for content
};

// FIX 2: addWatermark lifted out of addWrappedText to module scope
const addWatermark = (doc) => {
  doc.setTextColor(240, 240, 240);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.text("LEARNIFY", 105, 150, { angle: 45, align: "center" });
  doc.setTextColor(...BRAND.dark);
};

// FIX 6: forEach → for...of so break/continue work naturally for page overflow
const addWrappedText = (doc, text, startY = 90) => {
  const { width, height } = doc.internal.pageSize;
  const marginX  = 15;
  const maxWidth = width - marginX * 2;
  let y = startY;

  addWatermark(doc);

  const blocks = String(text || "")
    .split("\n")
    .map((line) => line.trimEnd());

  for (const block of blocks) {
    if (y > height - 30) {
      doc.addPage();
      addHeader(doc, "Continued");
      y = 40;
    }

    if (!block.trim()) {
      y += 5;
      continue;
    }

    const heading = isSectionHeading(block);

    doc.setFont("helvetica", heading ? "bold" : "normal");
    doc.setFontSize(heading ? 12 : 10);
    doc.setTextColor(...(heading ? BRAND.blue : BRAND.dark));

    const lines = doc.splitTextToSize(block, maxWidth);

    for (const line of lines) {
      if (y > height - 30) {
        doc.addPage();
        addHeader(doc, "Continued");
        y = 40;
      }
      doc.text(line, marginX, y);
      y += heading ? 7 : 6;
    }

    y += heading ? 3 : 2;
  }
};

const addFooter = (doc) => {
  const pageCount    = doc.internal.getNumberOfPages();
  const { width, height } = doc.internal.pageSize;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BRAND.border);
    doc.line(15, height - 18, width - 15, height - 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text(`Generated by ${BRAND.name}`, 15,         height - 10);
    doc.text(`Page ${i} of ${pageCount}`,  width - 15, height - 10, { align: "right" });
  }

  doc.setTextColor(...BRAND.dark);
};

// ── Public exports ────────────────────────────────────────────────────────────

// FIX 5: single clean implementation, no duplication
export const downloadPdf = ({ filename, title, content, meta = {} }) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  addCoverPage(doc, title, meta);
  addHeader(doc, title);
  const startY = addMetaBox(doc, meta);
  addWrappedText(doc, content, startY);
  addFooter(doc);

  doc.save(`${cleanFileName(filename)}.pdf`);
};

// FIX 3 + 4: downloadDocx now properly declared and exports;
// paragraphs built once and spread correctly into the document
export const downloadDocx = async ({ filename, title, content, meta = {} }) => {
  const paragraphs = String(content || "")
    .split("\n")
    .map((line) => {
      const heading = isSectionHeading(line);
      return new Paragraph({
        children: [
          new TextRun({
            text:  line || " ",
            bold:  heading,
            size:  heading ? 24 : 20,
            color: heading ? "2563EB" : "0F172A",
          }),
        ],
      });
    });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "LEARNIFY", bold: true, size: 36 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: BRAND.tagline, italics: true, size: 24 }),
            ],
          }),
          new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: `Subject: ${meta.subject || "N/A"}` }),
          new Paragraph({ text: `Topic: ${meta.topic || "N/A"}` }),
          new Paragraph({ text: `Generated: ${new Date().toLocaleDateString()}` }),
          new Paragraph({ text: " " }),
          ...paragraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${cleanFileName(filename)}.docx`);
};

// ── Content formatters ────────────────────────────────────────────────────────

export const formatNoteForDownload = (note) =>
  `
EXTRACTED NOTE

Title:   ${note.title         || "Untitled"}
Subject: ${note.subject       || "N/A"}
Topic:   ${note.topic         || "N/A"}
Status:  ${note.status        || "N/A"}

NOTE CONTENT

${note.extractedText || "No extracted text available yet."}
`.trim();

export const formatQuizForDownload = (quiz) => {
  const questions = quiz.questions
    ?.map((item, index) => {
      const options = item.options?.length
        ? item.options.map((o) => `   • ${o}`).join("\n")
        : "";

      return `
Question ${index + 1}
${item.question || "No question text"}

${options}

Answer:      ${item.correctAnswer || "N/A"}
Explanation: ${item.explanation   || "N/A"}
`.trim();
    })
    .join("\n\n");

  return `
QUIZ DETAILS

Subject:       ${quiz.subject      || "N/A"}
Topic:         ${quiz.topic        || "N/A"}
Question Type: ${quiz.questionType || "N/A"}
Score:         ${quiz.score        || 0}
Completed:     ${quiz.completed ? "Yes" : "No"}

QUESTIONS

${questions || "No questions available."}
`.trim();
};

export const formatStudyPlanForDownload = (studyPlan) => {
  const plan = studyPlan.plan
    ?.map((item, index) =>
      `
Task ${index + 1}: ${item.day       || "Study Day"}
Subject:          ${item.subject    || "N/A"}
Topic:            ${item.topic      || "N/A"}
Duration:         ${item.durationMinutes || 0} minutes
Task:             ${item.task       || "N/A"}
Completed:        ${item.completed ? "Yes" : "No"}
`.trim()
    )
    .join("\n\n");

  return `
STUDY PLAN DETAILS

Exam Date:              ${studyPlan.examDate?.slice(0, 10)    || "N/A"}
Available Hours Per Day: ${studyPlan.availableHoursPerDay     || "N/A"}

PLAN

${plan || "No study plan available."}
`.trim();
};