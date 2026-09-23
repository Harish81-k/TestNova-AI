const mongoose = require('mongoose');

const assessmentResultSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    topic: {
      type: String,
      required: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      required: true,
    },
    total_questions: {
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
        options: [String],
        user_answer: String,
        correct_answer: String,
        is_correct: Boolean,
        explanation: String
      }
    ]
  },
  {
    timestamps: true,
  }
);

const AssessmentResult = mongoose.model('AssessmentResult', assessmentResultSchema);
module.exports = AssessmentResult;
