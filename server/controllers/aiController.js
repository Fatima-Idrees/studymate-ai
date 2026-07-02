const Notes = require('../models/Notes');
const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');
const geminiService = require('../services/geminiService');

/**
 * Shared helper: fetches a note owned by the requesting user and
 * guards against missing/empty extracted text before calling the AI.
 */
const getOwnedNoteWithText = async (noteId, userId) => {
  const note = await Notes.findOne({ _id: noteId, userId });
  if (!note) {
    const err = new Error('Note not found');
    err.statusCode = 404;
    throw err;
  }
  if (!note.extractedText || note.extractedText.trim().length === 0) {
    const err = new Error('This note has no readable text (it may be a scanned image). AI features are unavailable for it.');
    err.statusCode = 400;
    throw err;
  }
  return note;
};

// @route   POST /api/ai/summary
// @body    { noteId, summaryType: "concise" | "detailed" | "bullets" }
// @access  Private
const summary = async (req, res, next) => {
  try {
    const { noteId, summaryType } = req.body;
    if (!noteId) {
      return res.status(400).json({ success: false, message: 'noteId is required' });
    }

    const note = await getOwnedNoteWithText(noteId, req.user._id);
    const result = await geminiService.generateSummary(note.extractedText, summaryType);

    res.status(200).json({
      success: true,
      data: { noteId: note._id, summaryType: summaryType || 'concise', summary: result },
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

// @route   POST /api/ai/quiz
// @body    { noteId }
// @access  Private
const quiz = async (req, res, next) => {
  try {
    const { noteId } = req.body;
    if (!noteId) {
      return res.status(400).json({ success: false, message: 'noteId is required' });
    }

    const note = await getOwnedNoteWithText(noteId, req.user._id);
    const questions = await geminiService.generateQuiz(note.extractedText);

    const newQuiz = await Quiz.create({
      userId: req.user._id,
      noteId: note._id,
      title: `Quiz: ${note.title}`,
      questions,
      totalQuestions: questions.length,
    });

    res.status(201).json({
      success: true,
      message: 'Quiz generated successfully',
      data: newQuiz,
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

// @route   POST /api/ai/quiz/:id/submit
// @body    { answers: [{ questionId, userAnswer }] }
// @access  Private
const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const quizDoc = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });

    if (!quizDoc) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let correctCount = 0;
    const topicTally = {};

    quizDoc.questions.forEach((q) => {
      const submitted = answers.find((a) => a.questionId === String(q._id));
      const userAnswer = submitted ? submitted.userAnswer : '';
      q.userAnswer = userAnswer;

      let isCorrect = null;
      if (q.type === 'mcq') {
        isCorrect = userAnswer.trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase();
      }
      if (submitted && typeof submitted.isCorrect === 'boolean') {
        isCorrect = submitted.isCorrect;
      }
      q.isCorrect = isCorrect;

      if (isCorrect !== null) {
        const topic = q.topic || 'General';
        if (!topicTally[topic]) topicTally[topic] = { correct: 0, total: 0 };
        topicTally[topic].total += 1;
        if (isCorrect) {
          topicTally[topic].correct += 1;
          correctCount += 1;
        }
      }
    });

    const gradedCount = quizDoc.questions.filter((q) => q.isCorrect !== null).length;
    const score = gradedCount > 0 ? Math.round((correctCount / gradedCount) * 100) : null;

    quizDoc.score = score;
    quizDoc.submitted = true;
    await quizDoc.save();

    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user._id });
    }

    Object.entries(topicTally).forEach(([topic, stats]) => {
      const existing = progress.topicStats.find((t) => t.topic === topic);
      if (existing) {
        existing.correctCount += stats.correct;
        existing.totalCount += stats.total;
      } else {
        progress.topicStats.push({
          topic,
          correctCount: stats.correct,
          totalCount: stats.total,
        });
      }
    });

    progress.totalQuizzes += 1;
    if (score !== null) {
      progress.scoreHistory.push({ quizId: quizDoc._id, score });
      const totalScore = progress.scoreHistory.reduce((sum, s) => sum + s.score, 0);
      progress.averageScore = Math.round(totalScore / progress.scoreHistory.length);
    }

    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: { quiz: quizDoc, score },
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/ai/chat
// @body    { noteId, question, chatHistory? }
// @access  Private
const chat = async (req, res, next) => {
  try {
    const { noteId, question, chatHistory } = req.body;
    if (!noteId || !question) {
      return res.status(400).json({ success: false, message: 'noteId and question are required' });
    }

    const note = await getOwnedNoteWithText(noteId, req.user._id);
    const answer = await geminiService.chatWithNotes(note.extractedText, question, chatHistory || []);

    res.status(200).json({
      success: true,
      data: { noteId: note._id, question, answer },
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

// @route   POST /api/ai/flashcards
// @body    { noteId }
// @access  Private
const flashcards = async (req, res, next) => {
  try {
    const { noteId } = req.body;
    if (!noteId) {
      return res.status(400).json({ success: false, message: 'noteId is required' });
    }

    const note = await getOwnedNoteWithText(noteId, req.user._id);
    const cards = await geminiService.generateFlashcards(note.extractedText);

    res.status(200).json({
      success: true,
      data: { noteId: note._id, flashcards: cards },
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

// @route   POST /api/ai/revision
// @body    { noteId }
// @access  Private
const revision = async (req, res, next) => {
  try {
    const { noteId } = req.body;
    if (!noteId) {
      return res.status(400).json({ success: false, message: 'noteId is required' });
    }

    const note = await getOwnedNoteWithText(noteId, req.user._id);
    const result = await geminiService.generateRevisionNotes(note.extractedText);

    res.status(200).json({
      success: true,
      data: { noteId: note._id, revisionNotes: result },
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

module.exports = { summary, quiz, submitQuiz, chat, flashcards, revision };