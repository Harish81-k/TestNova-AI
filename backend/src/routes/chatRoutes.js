const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, chatController.handleChat);
router.get('/sessions', protect, chatController.getSessions);
router.get('/sessions/:id', protect, chatController.getSessionById);
router.post('/sessions', protect, chatController.createSession);
router.put('/sessions/:id', protect, chatController.updateSession);
router.delete('/sessions/:id', protect, chatController.deleteSession);

module.exports = router;
