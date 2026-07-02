// ✅ New SDK import
const { GoogleGenAI } = require('@google/genai');

if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not set. AI features will fail until it is configured in .env');
}

// ✅ New client initialization (supports AQ. keys)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// ✅ Model name - updated to latest stable
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

/**
 * Truncates note text to a safe length to avoid exceeding context limits
 * while still giving the model enough material to work with.
 */
const MAX_CONTEXT_CHARS = 30000;
const truncate = (text = '') =>
  text.length > MAX_CONTEXT_CHARS ? text.slice(0, MAX_CONTEXT_CHARS) : text;

/**
 * Low-level call to the Gemini API. Wraps errors into a consistent
 * shape so controllers don't need to know about the SDK's internals.
 */
const callGemini = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error('Gemini API error:', error.message);
    throw new Error('AI service is currently unavailable. Please try again later.');
  }
};

/**
 * Strips markdown code fences (```json ... ```) that Gemini sometimes
 * wraps JSON responses in, then parses the result.
 */
const parseJSONResponse = (rawText) => {
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse Gemini JSON response:', cleaned.slice(0, 300));
    throw new Error('AI returned an unexpected response format. Please try again.');
  }
};

// ---------------------------------------------------------------------------
// Prompt builders — one per feature, kept separate so prompt tweaks don't
// risk breaking unrelated features.
// ---------------------------------------------------------------------------

const generateSummary = async (notesText, summaryType = 'concise') => {
  const text = truncate(notesText);

  const typeInstructions = {
    concise: 'Generate a concise academic summary in 3-5 short paragraphs.',
    detailed: 'Generate a detailed academic summary covering all key concepts, sub-topics, and explanations in depth.',
    bullets: 'Generate a bullet-point summary using clear, hierarchical bullet points grouped by topic.',
  };

  const instruction = typeInstructions[summaryType] || typeInstructions.concise;

  const prompt = `You are an academic study assistant. ${instruction}

Base your summary strictly on the study material provided below. Do not add outside information.

STUDY MATERIAL:
"""
${text}
"""

Respond with the summary only, formatted in clean markdown.`;

  return callGemini(prompt);
};

const generateQuiz = async (notesText) => {
  const text = truncate(notesText);

  const prompt = `You are an academic quiz generator. Generate 10 MCQs, 5 short questions, and 3 long questions from the following study material.

Return ONLY valid JSON (no markdown fences, no commentary) in exactly this shape:
{
  "questions": [
    { "type": "mcq", "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "...", "topic": "..." },
    { "type": "short", "question": "...", "correctAnswer": "model answer in 1-3 sentences", "topic": "..." },
    { "type": "long", "question": "...", "correctAnswer": "model answer outline", "topic": "..." }
  ]
}

Rules:
- Exactly 10 items with type "mcq", each with exactly 4 options and correctAnswer matching one option exactly.
- Exactly 5 items with type "short".
- Exactly 3 items with type "long".
- "topic" should be a short 1-4 word label for the sub-topic each question covers (used for tracking weak/strong areas).
- Base every question strictly on the material below.

STUDY MATERIAL:
"""
${text}
"""`;

  const raw = await callGemini(prompt);
  const parsed = parseJSONResponse(raw);
  return parsed.questions || [];
};

const chatWithNotes = async (notesText, question, chatHistory = []) => {
  const text = truncate(notesText);

  const historyContext =
    chatHistory.length > 0
      ? `Previous conversation:\n${chatHistory
          .slice(-6)
          .map((m) => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`)
          .join('\n')}\n\n`
      : '';

  const prompt = `You are an academic assistant answering questions strictly based on a student's uploaded notes. Answer only using the provided notes. If the answer is not available in the notes, respond exactly: "Information not available in uploaded notes."

${historyContext}STUDY NOTES:
"""
${text}
"""

STUDENT QUESTION: ${question}

Answer clearly and concisely, citing the relevant concept from the notes where helpful.`;

  return callGemini(prompt);
};

const generateFlashcards = async (notesText) => {
  const text = truncate(notesText);

  const prompt = `You are an academic study assistant. Create flashcards from the following study notes. Each flashcard should have a clear question on the front and a concise answer on the back.

Return ONLY valid JSON (no markdown fences) in exactly this shape:
{
  "flashcards": [
    { "front": "question text", "back": "answer text", "topic": "short topic label" }
  ]
}

Generate between 10 and 15 flashcards covering the most important concepts.

STUDY MATERIAL:
"""
${text}
"""`;

  const raw = await callGemini(prompt);
  const parsed = parseJSONResponse(raw);
  return parsed.flashcards || [];
};

const generateRevisionNotes = async (notesText) => {
  const text = truncate(notesText);

  const prompt = `You are an academic study assistant. Generate last-minute exam revision notes as a 1-page revision sheet. Highlight important concepts, formulas, and definitions clearly using markdown formatting (headings, bold text, bullet points).

Structure it as:
1. Key Concepts (bulleted, bolded terms)
2. Important Formulas / Definitions (if applicable)
3. Quick-Recall Points (short bullets, exam-style)

Base this strictly on the material below.

STUDY MATERIAL:
"""
${text}
"""

Respond with the revision sheet only, in clean markdown.`;

  return callGemini(prompt);
};

module.exports = {
  generateSummary,
  generateQuiz,
  chatWithNotes,
  generateFlashcards,
  generateRevisionNotes,
};