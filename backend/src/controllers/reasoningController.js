const { generateQuiz } = require('../services/aiService');
const AssessmentResult = require('../models/AssessmentResult');

const getQuiz = async (req, res) => {
  try {
    const topic = req.body.topic || 'Python';
    const level = req.body.difficulty || 'Beginner';
    
    const quiz = await generateQuiz(topic, level);
    res.json({ quiz, topic });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { quiz = [], answers = {}, topic = "General Assessment" } = req.body;

    let score = 0;
    let attempted = 0;
    const results = [];

    quiz.forEach((q, index) => {
      console.log('Question object received from frontend:', q);
      const userAnswer = answers[index.toString()];

      if (userAnswer) {
        attempted += 1;
      }

      const correctAnswer = q.answer;
      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) {
        score += 1;
      }

      results.push({
        question: q.question,
        options: q.options,
        user_answer: userAnswer || "Not Answered",
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        explanation: q.explanation
      });
    });

    const total = quiz.length;
    const wrong = attempted - score;
    const unattempted = total - attempted;
    const percentage = total ? Math.round((score / total) * 100 * 100) / 100 : 0;

    await AssessmentResult.create({
      user: req.user._id,
      topic,
      score,
      total_questions: total,
      percentage,
      results
    });

    res.json({
      score,
      total,
      wrong,
      unattempted,
      percentage,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await AssessmentResult.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteHistory = async (req, res) => {
  try {
    const history = await AssessmentResult.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!history) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateHistory = async (req, res) => {
  try {
    const { topic, isPinned, isArchived } = req.body;
    const updateFields = {};
    if (topic !== undefined) updateFields.topic = topic;
    if (isPinned !== undefined) updateFields.isPinned = isPinned;
    if (isArchived !== undefined) updateFields.isArchived = isArchived;

    const history = await AssessmentResult.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updateFields },
      { new: true }
    );
    if (!history) return res.status(404).json({ error: 'Assignment not found' });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getQuiz,
  submitQuiz,
  getHistory,
  updateHistory,
  deleteHistory
};
