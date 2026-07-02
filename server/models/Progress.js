const mongoose = require('mongoose');

const topicStatSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    correctCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    topicStats: {
      type: [topicStatSchema],
      default: [],
    },
    totalQuizzes: {
      type: Number,
      default: 0,
    },
    totalNotesUploaded: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    scoreHistory: {
      type: [
        {
          quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
          score: Number,
          date: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Derived getters for weak/strong topics (computed, not stored redundantly)
progressSchema.methods.getWeakTopics = function (threshold = 60) {
  return this.topicStats
    .filter((t) => t.totalCount > 0 && (t.correctCount / t.totalCount) * 100 < threshold)
    .map((t) => ({
      topic: t.topic,
      accuracy: Math.round((t.correctCount / t.totalCount) * 100),
    }));
};

progressSchema.methods.getStrongTopics = function (threshold = 80) {
  return this.topicStats
    .filter((t) => t.totalCount > 0 && (t.correctCount / t.totalCount) * 100 >= threshold)
    .map((t) => ({
      topic: t.topic,
      accuracy: Math.round((t.correctCount / t.totalCount) * 100),
    }));
};

module.exports = mongoose.model('Progress', progressSchema);
