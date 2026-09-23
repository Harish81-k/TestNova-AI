const AssessmentResult = require('../models/AssessmentResult');
const CodingResult = require('../models/CodingResult');

const getDashboardData = async (req, res) => {
  try {
    const assessmentResults = await AssessmentResult.find({ user: req.user._id }).sort({ createdAt: 1 });
    const codingResults = await CodingResult.find({ user: req.user._id }).sort({ createdAt: 1 });

    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Assessment Data
    const assessment_dates = assessmentResults.map(r => formatDate(r.createdAt));
    const assessment_scores = assessmentResults.map(r => r.percentage || 0);

    const topicMap = {};
    assessmentResults.forEach(r => {
      if (!topicMap[r.topic]) topicMap[r.topic] = { total: 0, count: 0 };
      topicMap[r.topic].total += (r.percentage || 0);
      topicMap[r.topic].count += 1;
    });
    const topics = Object.keys(topicMap);
    const topic_averages = topics.map(t => Math.round(topicMap[t].total / topicMap[t].count));

    // Coding Data
    const coding_dates = codingResults.map(r => formatDate(r.createdAt));
    const coding_scores = codingResults.map(r => r.percentage || 0);

    const difficultyMap = {};
    codingResults.forEach(r => {
      const diff = r.difficulty || 'basic';
      if (!difficultyMap[diff]) difficultyMap[diff] = { total: 0, count: 0 };
      difficultyMap[diff].total += (r.percentage || 0);
      difficultyMap[diff].count += 1;
    });
    const difficulties = Object.keys(difficultyMap);
    const difficulty_averages = difficulties.map(d => Math.round(difficultyMap[d].total / difficultyMap[d].count));

    // Simple streak calculation based on unique days active
    const activeDates = new Set([...assessmentResults, ...codingResults].map(r => new Date(r.createdAt).toDateString()));
    const streak = activeDates.size;

    res.json({
      assessment_dates,
      assessment_scores,
      topics,
      topic_averages,
      coding_dates,
      coding_scores,
      difficulties,
      difficulty_averages,
      streak,
      assessmentHistory: assessmentResults.slice().reverse(),
      codingHistory: codingResults.slice().reverse()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAssessmentDetails = async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const result = await AssessmentResult.findOne({ _id: assessmentId, user: req.user._id });
    if (!result) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCodingDetails = async (req, res) => {
  try {
    const codingId = req.params.id;
    const result = await CodingResult.findOne({ _id: codingId, user: req.user._id });
    if (!result) {
      return res.status(404).json({ message: 'Coding result not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboardData,
  getAssessmentDetails,
  getCodingDetails
};
