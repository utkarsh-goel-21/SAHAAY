const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

// AI routes - require authentication
router.post('/categorize-issue', authenticateToken, aiController.categorize);
router.post('/enhance-description', authenticateToken, aiController.enhance);
router.post('/match-volunteer', authenticateToken, aiController.match);

module.exports = router;
