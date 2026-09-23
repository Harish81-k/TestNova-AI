const express = require('express');
const router = express.Router();
const { getDashboardData, getAssessmentDetails, getCodingDetails } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDashboardData);
router.get('/dashboard/', protect, getDashboardData);
router.get('/assessment/:id', protect, getAssessmentDetails);
router.get('/coding/:id', protect, getCodingDetails);

module.exports = router;
