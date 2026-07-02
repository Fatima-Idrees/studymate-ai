# StudyMate AI

An AI-powered study assistant for university students. Upload PDF notes, chat with them, generate quizzes, summaries, flashcards, and revision sheets, and track quiz performance over time.

Built with the MERN stack (MongoDB, Express, React, Node.js) and Google Gemini for all AI features.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), React Router, Tailwind CSS v4, Axios, Recharts, react-hot-toast |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcrypt |
| AI | Google Gemini API (`@google/generative-ai`) |
| File upload | Multer (PDF only) |
| PDF parsing | pdf-parse |

---

## Project structure

```
studymate-ai/
├── server/                 # Express API
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/              # User, Notes, Quiz, Progress
│   ├── routes/
│   ├── services/            # geminiService.js, pdfService.js
│   ├── utils/generateToken.js
│   ├── uploads/              # uploaded PDFs (gitignored)
│   ├── server.js
│   └── .env.example
└── client/                 # React (Vite) frontend
    ├── src/
    │   ├── api/              # axios calls per feature
    │   ├── components/       # shared UI + layout
    │   ├── context/AuthContext.jsx
    │   ├── pages/             # one file per route
    │   └── App.jsx
    └── .env.example
```

---

## Features

1. **Auth** — register, login, JWT-protected routes, logout
2. **Dashboard** — welcome message, totals, recent activity feed
3. **Notes management** — upload PDF, list, delete (with extracted text stored)
4. **AI summaries** — concise / detailed / bullet-point
5. **AI quiz generator** — 10 MCQs + 5 short + 3 long questions, auto-graded MCQs
6. **Chat with notes** — answers strictly from the selected note, with a "not available" fallback
7. **Flashcards** — flip-card UI, question/answer pairs
8. **Revision notes** — 1-page exam revision sheet
9. **Progress tracking** — score history chart, weak/strong topic breakdown
10. **Profile** — update name/email, change password

---

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local instance or MongoDB Atlas connection string)
- A Google Gemini API key — get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/studymate-ai
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
MAX_FILE_SIZE_MB=10
CLIENT_URL=http://localhost:5173
```

Run it:

```bash
npm run dev        # nodemon, auto-restart
# or
npm start          # plain node
```

The API runs on `http://localhost:5000`. Check `GET /api/health` to confirm it's up.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
```

Edit `client/.env` if your API isn't on the default port:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run it:

```bash
npm run dev
```

The app runs on `http://localhost:5173`.

### 3. Use it

1. Open `http://localhost:5173`, register an account.
2. Go to **Upload Notes**, upload a PDF.
3. Use **Summary**, **Chat**, **Quiz**, **Flashcards**, or **Revision Notes** from the Notes Library or sidebar.
4. Check **Progress** after taking a few quizzes.

---

## API reference

All routes except `/api/auth/*` and `/api/health` require `Authorization: Bearer <token>`.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/user/profile` | Get current user |
| PUT | `/api/user/profile` | Update name/email/password |
| POST | `/api/notes/upload` | Upload a PDF (`multipart/form-data`, field `file`) |
| GET | `/api/notes` | List notes |
| GET | `/api/notes/:id` | Get one note (incl. extracted text) |
| DELETE | `/api/notes/:id` | Delete a note |
| POST | `/api/ai/summary` | `{ noteId, summaryType }` → summary |
| POST | `/api/ai/quiz` | `{ noteId }` → generates and saves a quiz |
| POST | `/api/ai/quiz/:id/submit` | `{ answers }` → grades and updates progress |
| POST | `/api/ai/chat` | `{ noteId, question, chatHistory }` → answer |
| POST | `/api/ai/flashcards` | `{ noteId }` → flashcard set |
| POST | `/api/ai/revision` | `{ noteId }` → revision sheet |
| GET | `/api/progress` | Score history, weak/strong topics |
| GET | `/api/dashboard` | Aggregated dashboard stats |

---

## Deployment guide

### Database
Use [MongoDB Atlas](https://www.mongodb.com/atlas) for a managed instance. Create a cluster, add a database user, allow your server's IP (or `0.0.0.0/0` for quick testing, tightened later), and copy the connection string into `MONGO_URI`.

### Backend (Render / Railway / Fly.io / a VPS)
1. Push the `server/` folder to its own repo or deploy as a subdirectory.
2. Set environment variables from `.env.example` in your host's dashboard (`MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL` pointing to your deployed frontend URL, etc).
3. Build command: `npm install`. Start command: `npm start`.
4. Make sure the `uploads/` directory is writable, or switch to a cloud storage bucket (S3, Cloudinary) if your host uses an ephemeral filesystem — most PaaS containers wipe local disk on redeploy, so for production durability beyond a demo, swap `multer.diskStorage` for a cloud storage adapter.

### Frontend (Vercel / Netlify)
1. Set `VITE_API_BASE_URL` to your deployed backend's `/api` URL as a build-time environment variable.
2. Build command: `npm run build`. Output directory: `dist`.
3. Add a rewrite rule so client-side routes (e.g. `/dashboard`) don't 404 on refresh:
   - Vercel: add a `vercel.json` with a catch-all rewrite to `/index.html`.
   - Netlify: add a `_redirects` file with `/* /index.html 200`.

### CORS
Double check `CLIENT_URL` in the backend `.env` matches your deployed frontend's exact origin (including `https://`), or the browser will block requests.

### Secrets
Never commit `.env` files. Rotate `JWT_SECRET` and your Gemini API key if they're ever exposed.

---

## Notes on AI behavior

- Gemini responses for quizzes/flashcards are requested as structured JSON; the service strips markdown code fences before parsing and surfaces a clear error if the model returns something unparseable, rather than silently failing.
- Chat answers are constrained by prompt instructions to only use the uploaded note's text, with an explicit fallback string when the answer isn't present — this is enforced by the prompt, not by retrieval filtering, so very tangential questions may occasionally be answered if the model considers them in-scope.
- Notes with no extractable text (e.g. scanned image PDFs with no OCR layer) are flagged in the UI and AI endpoints will return a clear 400 error rather than calling Gemini with empty content.
