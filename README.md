# Learnify
Overview
Learnify is an AI-powered learning platform designed to help students prepare for examinations such as WAEC, NECO, JAMB, and GCE. The platform combines OCR-powered note digitization, Retrieval-Augmented Generation (RAG), AI tutoring, quiz generation, personalized study planning, and learning analytics into a single learning experience.
Built using React, Node.js, Express, MongoDB, Google Gemini AI, and n8n automation workflows, Learnify enables students to transform handwritten or printed notes into interactive learning resources.

**Live app:** https://learnify-lyart.vercel.app
**GitHub:** https://github.com/EchannyE/learnify.git

---

## Project Structure

```
learnify/
├── backend/                  # Express API server
│   └── src/
│       ├── controllers/      # Route handlers
│       ├── middleware/        # Auth, error handling
│       ├── models/            # Mongoose schemas
│       ├── routes/            # Express routers
│       └── services/          # Business logic & AI layer
│           ├── geminiService.js        # Gemini API wrapper
│           ├── ragService.js           # Embedding + cosine similarity search
│           ├── ocrService.js           # Gemini Vision OCR
│           ├── quizService.js          # Quiz generation
│           ├── studyPlannerService.js  # Study plan generation
│           ├── tutorService.js         # AI tutor with RAG
│           └── noteService.js          # Note CRUD + OCR trigger
├── frontend/                 # React + Vite app
│   └── src/
│       ├── api/              # Axios instance
│       ├── components/       # Shared UI components
│       ├── hooks/            # Custom React hooks
│       ├── pages/            # Route-level page components
│       └── utils/            # Download helpers, offline DB
├── mobile/flutter_app/       # Mobile client (placeholder)
└── n8n-workflows/            # Optional automation workflows
```

---

## Key Features

- **OCR Note Scanner** — upload a photo, file, or paste text; Gemini Vision extracts readable content
- **AI Tutor** — ask curriculum questions; answers grounded in RAG-retrieved syllabus chunks
- **Quiz Generator** — auto-generates 10 MCQ or closed-ended questions from your notes + RAG context
- **Study Planner** — produces a 7-day plan aligned to your exam date and weak topics
- **RAG Pipeline** — curriculum PDFs embedded with `gemini-embedding-2`, stored in MongoDB, retrieved by cosine similarity
- **Analytics Dashboard** — tracks scores, weak topics, and study streaks
- **Offline Support** — IndexedDB caching via IDB for low-connectivity environments

---

## Backend

### Tech Stack

| Tool | Purpose |
|---|---|
| Node.js (ESM) | Runtime |
| Express | HTTP server |
| MongoDB + Mongoose | Database |
| Google Gemini API | Text generation, vision OCR, embeddings |
| JWT | Authentication |
| Multer | File uploads |
| Axios | Outbound HTTP (Gemini API calls) |
| Helmet + Morgan + CORS | Security and logging |

### Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
# MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

PORT=5000

GEMINI_API_KEY=your_gemini_api_key

N8N_OCR_WEBHOOK_URL=optional

N8N_QUIZ_WEBHOOK_URL=optional

N8N_STUDY_PLANNER_WEBHOOK_URL=optional
```

### API Endpoints

#### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new student |
| POST | `/api/auth/login` | Login and receive JWT |

#### Notes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | Get all notes for the logged-in student |
| POST | `/api/notes` | Create note (triggers OCR automatically) |
| GET | `/api/notes/:id` | Get a single note |
| POST | `/api/notes/ocr-result` | Receive OCR result callback |

#### Quiz
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/quiz/generate` | Generate a quiz from note + RAG context |
| GET | `/api/quiz` | Get all quizzes |
| GET | `/api/quiz/:id` | Get a single quiz |
| PATCH | `/api/quiz/:id/score` | Submit quiz score |

#### Study Planner
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/study-planner/generate` | Generate a 7-day study plan |
| GET | `/api/study-planner` | Get all study plans |
| GET | `/api/study-planner/:id` | Get a single plan |
| PATCH | `/api/study-planner/:id/task/:index/complete` | Mark a task complete |

#### AI Tutor
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tutor/ask` | Ask the AI tutor a question |

#### Curriculum (RAG Ingest)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/curriculum/ingest` | Ingest a curriculum document (chunks + embeds) |
| GET | `/api/curriculum` | Browse ingested chunks |

---

## Frontend

### Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router v6 | Routing |
| Axios | API calls |
| IDB (IndexedDB) | Offline caching |
| jsPDF + docx | PDF and Word export |

### Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

### Pages

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Performance overview and recent activity |
| `/notes` | Notes | Upload, scan, and manage notes |
| `/quiz` | Quiz | Take and review quizzes |
| `/tutor` | Tutor | Chat with the AI tutor |
| `/study-planner` | Study Planner | View and track your 7-day plan |
| `/login` | Login | Student authentication |
| `/register` | Register | New student signup |

---

## RAG Pipeline

Curriculum documents are ingested via `POST /api/curriculum/ingest`:

```json
{
  "text": "<full syllabus text>",
  "curriculumType": "WAEC",
  "subject": "Biology",
  "topic": "Photosynthesis",
  "level": "SS"
}
```

The service:
1. Splits the text into 800-character chunks with 120-character overlap (max 20 chunks)
2. Embeds each chunk using `gemini-embedding-2`
3. Stores chunks and embeddings in the `CurriculumChunk` MongoDB collection

At query time (tutor, quiz, study planner), the question is embedded and top-5 chunks are retrieved by cosine similarity and injected into the Gemini prompt as primary context.

**File naming convention for batch ingest:**
`WAEC_Mathematics_Algebra.pdf` → curriculumType=WAEC, subject=Mathematics, topic=Algebra

---

## n8n Workflows

Workflow definitions are in `n8n-workflows/` and can be imported into a self-hosted or cloud n8n instance for additional automation:

| File | Pipeline |
|---|---|
| `ocr.workflow.json` | OCR (3 modes: URL / upload / paste text) |
| `quiz-generator.workflow.json` | Quiz generation with RAG injection |
| `study-planner.workflow.json` | Study plan generation with RAG injection |
| `rag-retrieval.workflow.json` | RAG query / AI tutor webhook |
| `drive-injection.workflow.json` | Google Drive → PDF → chunk → embed → store |
| `weekly-report.workflow.json` | Weekly student performance summary (cron) |


---

## Deployment

| Service | Platform |
|---|---|
| Backend | Render (`https://learnify-xkts.onrender.com`) |
| Frontend | Vercel (`https://learnify-lyart.vercel.app`) |
| Database | MongoDB Atlas |
| AI | Google AI Studio (Gemini API) |

---

## License

This project was built for a hackathon and is not yet licensed. Add a license file before publishing publicly.
