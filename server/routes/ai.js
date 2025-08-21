const express = require('express');
const router = express.Router();
const { getHint, summarize, testOpenAI } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/hint', protect, getHint);
router.post('/summarize', protect, summarize);

module.exports = router;