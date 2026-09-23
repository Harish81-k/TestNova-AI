const { generateCodingQuestions, getHint } = require('../services/aiService');
const { runCode } = require('../services/executorService');
const CodingResult = require('../models/CodingResult');

const generateQuestions = async (req, res) => {
  try {
    const level = req.body.difficulty || "medium";
    const language = req.body.language || "python";
    const questions = await generateCodingQuestions(level, language);
    res.json({ questions, difficulty: level });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const submitCodingQuiz = async (req, res) => {
  try {
    const { scores = [], questions: quiz = [], difficulty = "medium" } = req.body;

    const total_questions = quiz.length;
    const max_possible_score = total_questions * 20;
    const total_score = scores.reduce((a, b) => a + b, 0);
    
    const percentage = max_possible_score ? Math.round((total_score / max_possible_score) * 100 * 100) / 100 : 0;
    
    const results = [];
    quiz.forEach((q, idx) => {
      const q_score = idx < scores.length ? scores[idx] : 0;
      results.push({
        question: q.title || `Question ${idx + 1}`,
        user_answer: `Score: ${q_score} / 20`,
        correct_answer: "Expected: 20 / 20",
        is_correct: q_score === 20
      });
    });
        
    const score_count = scores.filter(s => s === 20).length;
    const wrong = scores.filter(s => s > 0 && s < 20).length;
    const unattempted = scores.filter(s => s === 0).length;
    
    const grade = percentage >= 90 ? "Excellent" : percentage >= 70 ? "Good" : percentage >= 50 ? "Fair" : "Needs Improvement";
    
    await CodingResult.create({
      user: req.user._id,
      difficulty,
      total_score,
      max_possible_score,
      percentage,
      results
    });
    
    res.json({
      score: score_count,
      total: total_questions,
      wrong,
      unattempted,
      percentage,
      results,
      grade
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const executeCode = async (req, res) => {
  try {
    const code = (req.body.code || "").trim();
    const language = req.body.language || "python";
    const input_data = req.body.input || "";

    if (!code) {
      return res.status(400).json({ error: "Code is empty" });
    }

    const result = await runCode(code, language, input_data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCodingHint = async (req, res) => {
  try {
    const { title = '', description = '' } = req.body;
    const hint = await getHint(title, description);
    res.json({ hint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateQuestions,
  submitCodingQuiz,
  executeCode,
  getCodingHint
};
