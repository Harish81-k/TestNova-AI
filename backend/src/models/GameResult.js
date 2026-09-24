const mongoose = require('mongoose');

const gameResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    default: null
  },
  level: {
    type: String,
    default: null
  },
  durationSeconds: {
    type: Number,
    default: null
  },
  details: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('GameResult', gameResultSchema);
