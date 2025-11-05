const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/stats', issueController.getDashboardStats);
router.get('/', optionalAuth, issueController.getIssues);
router.get('/:id', optionalAuth, issueController.getIssueById);

// Protected routes - any authenticated user
router.post('/', authenticateToken, upload.single('image'), issueController.createIssue);

// Volunteer-specific routes
router.post('/:id/pick', authenticateToken, requireRole('volunteer'), issueController.pickIssue);
router.put('/:id/status', authenticateToken, issueController.updateIssueStatus);
router.post('/:id/after-image', authenticateToken, upload.single('image'), issueController.uploadAfterImage);

// Sponsor-specific routes
router.post('/:id/sponsor', authenticateToken, requireRole('sponsor'), issueController.sponsorIssue);

module.exports = router;
