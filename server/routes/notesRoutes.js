const express = require('express');
const { uploadNote, getNotes, getNoteById, deleteNote } = require('../controllers/notesController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('file'), uploadNote);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.delete('/:id', deleteNote);

module.exports = router;
