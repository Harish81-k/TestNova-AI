const express = require('express');
const router = express.Router();
const { generateQuestions, submitCodingQuiz, executeCode, getCodingHint } = require('../controllers/codingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate/', protect, generateQuestions);
router.post('/submit/', protect, submitCodingQuiz);
router.post('/execute/', protect, executeCode);
router.post('/hint/', protect, getCodingHint);

module.exports = router;
