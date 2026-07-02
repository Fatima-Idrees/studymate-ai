const fs = require('fs');
const Notes = require('../models/Notes');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');
const { extractTextFromPDF } = require('../services/pdfService');

// @route   POST /api/notes/upload
// @access  Private
const uploadNote = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please attach a PDF file.',
      });
    }

    const title = req.body.title || req.file.originalname.replace(/\.pdf$/i, '');

    const extractedText = await extractTextFromPDF(req.file.path);

    const note = await Notes.create({
      userId: req.user._id,
      title,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      extractedText,
    });

    // Keep the running "total notes uploaded" counter in sync
    await Progress.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { totalNotesUploaded: 1 } },
      { upsert: true }
    );

    res.status(201).json({
      success: true,
      message: extractedText
        ? 'Note uploaded and processed successfully'
        : 'Note uploaded, but no readable text was found in the PDF (it may be a scanned image).',
      data: {
        id: note._id,
        title: note.title,
        originalFileName: note.originalFileName,
        fileSize: note.fileSize,
        uploadDate: note.uploadDate,
        hasExtractedText: Boolean(extractedText),
      },
    });
  } catch (error) {
    // Clean up the uploaded file if DB save failed after upload
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
};

// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res, next) => {
  try {
    const notes = await Notes.find({ userId: req.user._id })
      .select('-extractedText -filePath') // keep list response lightweight
      .sort({ uploadDate: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res, next) => {
  try {
    const note = await Notes.findOne({ _id: req.params.id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res, next) => {
  try {
    const note = await Notes.findOne({ _id: req.params.id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Remove physical file from disk
    if (note.filePath && fs.existsSync(note.filePath)) {
      fs.unlink(note.filePath, () => {});
    }

    // Remove any quizzes tied to this note to avoid orphaned references
    await Quiz.deleteMany({ noteId: note._id, userId: req.user._id });

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadNote, getNotes, getNoteById, deleteNote };
