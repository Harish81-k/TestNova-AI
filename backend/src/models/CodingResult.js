const mongoose = require('mongoose');

const codingResultSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    difficulty: {
      type: String,
      required: true,
    },
    total_score: {
      type: Number,
      required: true,
    },
    max_possible_score: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    results: [
      {
        question: String,
        user_answer: String,
        correct_answer: String,
        is_correct: Boolean
      }
    ]
  },
  {
    timestamps: true,
  }
);

const CodingResult = mongoose.model('CodingResult', codingResultSchema);
module.exports = CodingResult;
