const express = require('express');
const router = express.Router();
const { getQuiz, submitQuiz, getHistory, updateHistory, deleteHistory } = require('../controllers/reasoningController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate/', protect, getQuiz);
router.post('/submit/', protect, submitQuiz);
router.get('/history/', protect, getHistory);
router.put('/history/:id', protect, updateHistory);
router.delete('/history/:id', protect, deleteHistory);

module.exports = router;
