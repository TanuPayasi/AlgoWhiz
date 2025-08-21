const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/problems', require('./problems'));
router.use('/ai', require('./ai'));

const { getStats } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getStats);

router.get('/', (req, res) => res.send('AlgoWhiz API'));
module.exports = router;