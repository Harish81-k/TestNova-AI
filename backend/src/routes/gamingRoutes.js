const express = require('express');
const router = express.Router();
const { saveGameResult, getGameHistory, getGameResultDetails, generatePortGame } = require('../controllers/gamingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/result', protect, saveGameResult);
router.get('/history', protect, getGameHistory);
router.get('/history/:id', protect, getGameResultDetails);
router.get('/generate/ports', protect, generatePortGame);

module.exports = router;
