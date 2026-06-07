# Learnify

Learnify is a full-stack student learning assistant built with a React/Vite frontend, an Express/MongoDB backend, and optional n8n automation workflows. It includes note ingestion, OCR-based text extraction, quiz generation, AI tutoring, study plan generation, RAG-based context search, and analytics.

## Project structure

- `backend/` - Express API server, MongoDB models, authentication, notes, quizzes, study plans, tutor, and RAG chunk support.
- `frontend/` - React app with Vite, Tailwind CSS, React Router, and browser offline support.
- `mobile/flutter_app/` - mobile client workspace placeholder.
- `n8n-workflows/` - automation workflows for OCR, quiz generation, RAG retrieval, study planner, and weekly reports.

## Key features

- User authentication and authorization
- Note creation and OCR text extraction
- Quiz generation and performance tracking
- AI tutor powered by Google Gemini API
- Study planner generation via n8n webhook integration
- Retrieval-augmented generation (RAG) chunk storage and search
- Analytics dashboard for student performance

## Backend

### Tech stack

- Node.js (ESM)
- Express
- MongoDB / Mongoose
- dotenv
- CORS, Helmet, Morgan
- Nodemon for development

### Setup

1. Open a terminal and install backend dependencies:

   ```powershell
   cd C:\Users\joe\Desktop\learnify\backend
   npm install
   ```

2. Create a `.env` file in `backend/` with the following values:

   ```env
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   PORT=5000
   GEMINI_API_KEY=<your-google-gemini-api-key>
   N8N_OCR_WEBHOOK_URL=<optional-n8n-ocr-webhook>
   N8N_QUIZ_WEBHOOK_URL=<optional-n8n-quiz-webhook>
   N8N_STUDY_PLANNER_WEBHOOK_URL=<optional-n8n-study-planner-webhook>
   ```

3. Start the backend server:

   ```powershell
   npm run dev
   ```

## Frontend

### Tech stack

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- IDB for offline storage

### Setup

1. Open a terminal and install frontend dependencies:

   ```powershell
   cd C:\Users\joe\Desktop\learnify\frontend
   npm install
   ```

2. Start the frontend development server:

   ```powershell
   npm run dev
   ```

### Optional frontend packages

If you want to add PDF or Word export support, install:

```powershell
npm install jspdf docx file-saver
```

## Environment variables

The backend uses the following variables:

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - secret for signing JWT tokens
- `PORT` - backend server port (default: `5000`)
- `GEMINI_API_KEY` - Google Gemini API key for AI tutor requests
- `N8N_OCR_WEBHOOK_URL` - optional webhook URL for OCR processing
- `N8N_QUIZ_WEBHOOK_URL` - optional webhook URL for quiz generation
- `N8N_STUDY_PLANNER_WEBHOOK_URL` - optional webhook URL for study planner generation

## n8n workflows

Workflow definitions are stored in `n8n-workflows/`:

- `drive-injection.workflow.json`
- `ocr.workflow.json`
- `quiz-generator.workflow.json`
- `rag-retrieval.workflow.json`
- `study-planner.workflow.json`
- `weekly-report.workflow.json`

These workflows can be imported into n8n to support external processing and automation used by the backend.

## Notes

- The backend runs in ESM mode via `type: "module"`.
- The frontend is a Vite-powered React app with Tailwind styles.
- The `mobile/flutter_app/` directory is available for future mobile client work.

## License

This project does not include a license file. Add one if you want to publish or share it publicly.
