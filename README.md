# 📚 AI Study Platform

An AI-powered study assistant built with the MERN stack and Google's Gemini API. The platform helps students study smarter by generating AI-powered summaries, quizzes, flashcards, and providing an interactive question-answering experience.

---

## 🚀 Features

### 🤖 AI-Powered Learning
- AI-generated note summarization
- Automatic quiz generation
- AI-generated flashcards
- Interactive Q&A using Google Gemini API

### 👤 User Authentication
- User Registration
- Secure Login
- JWT Authentication
- Password Hashing
- Protected Routes

### 📊 Personalized Dashboard
- User profile
- Learning progress tracking
- Study history
- Saved notes
- Generated quizzes
- Flashcard management

### 📚 Study Management
- Upload or create notes
- Store study materials
- AI-generated learning resources
- Organize content efficiently

### 📱 Responsive Design
- Mobile-friendly interface
- Tablet support
- Desktop optimized

---

# 🛠 Tech Stack

## Frontend
- React.js
- React Router
- Axios
- Bootstrap / Tailwind CSS
- Context API

## Backend
- Node.js
- Express.js

## Database
- MongoDB
- Mongoose

## Authentication
- JWT
- bcrypt.js

## AI
- Google Gemini API

---

# 📂 Project Structure

```
AI-Study-Platform/

│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── services/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── config/
│   ├── utils/
│   └── server.js
│
├── package.json
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Fatima-Idrees/studymate-ai.git
```

---

## Navigate

```bash
cd studymate-ai
```

---

## Install Backend Dependencies

```bash
cd server
npm install
```

---

## Install Frontend Dependencies

```bash
cd ../client
npm install
```

# ▶️ Run the Project

## Backend

```bash
cd server
npm run dev
```

## Frontend

```bash
cd client
npm start
```

---

# 🔄 Application Workflow

```
User Registration/Login
          │
          ▼
JWT Authentication
          │
          ▼
User Dashboard
          │
          ▼
Upload or Create Notes
          │
          ▼
Gemini API
          │
 ┌────────┼────────┐
 ▼        ▼        ▼
Summary  Quiz  Flashcards
          │
          ▼
Interactive AI Chat
          │
          ▼
Save Results in MongoDB
          │
          ▼
Track User Progress
```

---

# 📡 REST API Endpoints

## Authentication

```
POST /api/auth/register

POST /api/auth/login

GET /api/auth/profile
```

## Notes

```
POST /api/notes

GET /api/notes

PUT /api/notes/:id

DELETE /api/notes/:id
```

## AI

```
POST /api/ai/summarize

POST /api/ai/quiz

POST /api/ai/flashcards

POST /api/ai/chat
```

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing (bcrypt)
- Protected API Routes
- Input Validation
- Environment Variables
- Secure API Communication

---

# 📈 Future Improvements

- Voice Assistant
- PDF Upload & Parsing
- OCR for Image Notes
- AI Study Planner
- Dark Mode
- Collaborative Study Groups
- Performance Analytics
- Multi-language Support

---

