const GameResult = require('../models/GameResult');
const { generatePortsData } = require('../services/aiService');

// @desc    Save game result
// @route   POST /gaming/result
// @access  Private
const saveGameResult = async (req, res) => {
  try {
    const { gameName, score, maxScore, level, durationSeconds, details } = req.body;

    if (!gameName || score === undefined) {
      return res.status(400).json({ message: 'gameName and score are required' });
    }

    const result = await GameResult.create({
      user: req.user._id,
      gameName,
      score,
      maxScore,
      level,
      durationSeconds,
      details
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error saving game result:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all game results for user
// @route   GET /gaming/history
// @access  Private
const getGameHistory = async (req, res) => {
  try {
    const history = await GameResult.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single game result details
// @route   GET /gaming/history/:id
// @access  Private
const getGameResultDetails = async (req, res) => {
  try {
    const result = await GameResult.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Game result not found' });
    }

    if (result.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching game details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Generate port game data via AI
// @route   GET /gaming/generate/ports
// @access  Private
const generatePortGame = async (req, res) => {
  try {
    const data = await generatePortsData();
    res.json(data);
  } catch (error) {
    console.error('Error generating ports:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  saveGameResult,
  getGameHistory,
  getGameResultDetails,
  generatePortGame
};
