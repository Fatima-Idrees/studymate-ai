const express = require('express');
const { getProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getProgress);

module.exports = router;
