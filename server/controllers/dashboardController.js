const Notes = require('../models/Notes');
const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');

// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totalNotes, totalQuizzes, progress, recentNotes, recentQuizzes] = await Promise.all([
      Notes.countDocuments({ userId }),
      Quiz.countDocuments({ userId }),
      Progress.findOne({ userId }),
      Notes.find({ userId }).select('title uploadDate').sort({ uploadDate: -1 }).limit(5),
      Quiz.find({ userId }).select('title score submitted createdAt').sort({ createdAt: -1 }).limit(5),
    ]);

    // Merge notes + quizzes into a single recent-activity feed, sorted by date
    const recentActivity = [
      ...recentNotes.map((n) => ({
        type: 'note_upload',
        title: n.title,
        date: n.uploadDate,
      })),
      ...recentQuizzes.map((q) => ({
        type: 'quiz',
        title: q.title,
        score: q.score,
        submitted: q.submitted,
        date: q.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    res.status(200).json({
      success: true,
      data: {
        welcomeName: req.user.name,
        totalNotes,
        totalQuizzes,
        averageScore: progress ? progress.averageScore : 0,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
