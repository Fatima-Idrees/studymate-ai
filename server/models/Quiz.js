const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['mcq', 'short', 'long'],
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      // Only populated for MCQs
      type: [String],
      default: undefined,
    },
    correctAnswer: {
      type: String, // For MCQ: option text. For short/long: model answer / rubric
      default: '',
    },
    topic: {
      type: String,
      default: 'General',
    },
    userAnswer: {
      type: String,
      default: '',
    },
    isCorrect: {
      type: Boolean,
      default: null,
    },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notes',
      required: true,
    },
    title: {
      type: String,
      default: 'Untitled Quiz',
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    score: {
      type: Number, // percentage 0-100, null until submitted
      default: null,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    submitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

quizSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);
