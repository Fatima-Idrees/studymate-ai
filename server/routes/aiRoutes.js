const express = require('express');
const { body } = require('express-validator');
const {
  summary,
  quiz,
  submitQuiz,
  chat,
  flashcards,
  revision,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.post(
  '/summary',
  [
    body('noteId').notEmpty().withMessage('noteId is required'),
    body('summaryType').optional().isIn(['concise', 'detailed', 'bullets']),
  ],
  validate,
  summary
);

router.post('/quiz', [body('noteId').notEmpty().withMessage('noteId is required')], validate, quiz);

router.post('/quiz/:id/submit', submitQuiz);

router.post(
  '/chat',
  [
    body('noteId').notEmpty().withMessage('noteId is required'),
    body('question').trim().notEmpty().withMessage('question is required'),
  ],
  validate,
  chat
);

router.post('/flashcards', [body('noteId').notEmpty().withMessage('noteId is required')], validate, flashcards);

router.post('/revision', [body('noteId').notEmpty().withMessage('noteId is required')], validate, revision);

module.exports = router;
