const Progress = require('../models/Progress');

// @route   GET /api/progress
// @access  Private
const getProgress = async (req, res, next) => {
  try {
    let progress = await Progress.findOne({ userId: req.user._id });

    if (!progress) {
      progress = await Progress.create({ userId: req.user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        totalQuizzes: progress.totalQuizzes,
        totalNotesUploaded: progress.totalNotesUploaded,
        averageScore: progress.averageScore,
        weakTopics: progress.getWeakTopics(),
        strongTopics: progress.getStrongTopics(),
        scoreHistory: progress.scoreHistory.sort((a, b) => a.date - b.date),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProgress };
