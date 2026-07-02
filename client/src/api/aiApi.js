import apiClient from './apiClient';

export const generateSummary = (noteId, summaryType) =>
  apiClient.post('/ai/summary', { noteId, summaryType });

export const generateQuiz = (noteId) => apiClient.post('/ai/quiz', { noteId });

export const submitQuiz = (quizId, answers) =>
  apiClient.post(`/ai/quiz/${quizId}/submit`, { answers });

export const chatWithNotes = (noteId, question, chatHistory) =>
  apiClient.post('/ai/chat', { noteId, question, chatHistory });

export const generateFlashcards = (noteId) => apiClient.post('/ai/flashcards', { noteId });

export const generateRevisionNotes = (noteId) => apiClient.post('/ai/revision', { noteId });
