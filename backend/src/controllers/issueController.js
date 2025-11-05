const Issue = require('../models/Issue');
const IssueActivity = require('../models/IssueActivity');
const User = require('../models/User');
const { categorizeIssue, enhanceDescription } = require('../services/aiService');
const path = require('path');

/**
 * Create a new issue
 */
async function createIssue(req, res) {
  try {
    const {
      title,
      description,
      category,
      location_lat,
      location_lng,
      location_address
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Get image URL if uploaded
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    // AI: Categorize and enhance description
    let aiCategory = category;
    let aiPriority = 'Medium';
    let aiReasoning = null;
    let aiCategorized = false;
    let enhanced_description = description;

    // Only use AI if category not provided or description is brief
    if (!category || description.length < 100) {
      try {
        // Get AI categorization
        const categorization = await categorizeIssue(description, title);
        if (!category) {
          aiCategory = categorization.category;
          aiPriority = categorization.priority;
          aiReasoning = categorization.reasoning;
          aiCategorized = categorization.aiCategorized;
        }

        // Enhance description if brief
        if (description.length < 100) {
          const enhancement = await enhanceDescription(description, title);
          if (enhancement.wasEnhanced) {
            enhanced_description = enhancement.enhanced;
          }
        }
      } catch (aiError) {
        console.error('AI processing error:', aiError);
        // Continue without AI enhancement
      }
    }

    // Create issue
    const issue = await Issue.create({
      title,
      description,
      enhanced_description,
      category: aiCategory,
      priority: aiPriority,
      location_lat,
      location_lng,
      location_address,
      image_url,
      reported_by: req.user.id,
      ai_categorized: aiCategorized,
      ai_reasoning: aiReasoning
    });

    // Log activity
    await IssueActivity.logIssueCreated(issue.id, req.user.id, title);

    // Award reputation point to reporter
    await User.updateReputation(req.user.id, 1);

    res.status(201).json({
      message: 'Issue reported successfully',
      issue,
      ai_info: {
        categorized: aiCategorized,
        enhanced: enhanced_description !== description
      }
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
}

/**
 * Get all issues with filters
 */
async function getIssues(req, res) {
  try {
    const { status, category, reported_by, assigned_to } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (reported_by) filters.reported_by = reported_by;
    if (assigned_to) filters.assigned_to = assigned_to;

    const issues = await Issue.findAll(filters);

    res.json({ issues });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
}

/**
 * Get single issue by ID
 */
async function getIssueById(req, res) {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Get issue activities
    const activities = await IssueActivity.findByIssueId(id);

    res.json({ issue, activities });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
}

/**
 * Volunteer picks an issue
 */
async function pickIssue(req, res) {
  try {
    const { id } = req.params;

    // Verify user is a volunteer
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ error: 'Only volunteers can pick issues' });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (issue.assigned_to) {
      return res.status(400).json({ error: 'Issue already assigned to a volunteer' });
    }

    // Assign volunteer
    const updatedIssue = await Issue.assignVolunteer(id, req.user.id);

    // Log activity
    const user = await User.findById(req.user.id);
    await IssueActivity.logVolunteerAssigned(id, req.user.id, user.name);

    // Award reputation
    await User.updateReputation(req.user.id, 2);

    res.json({
      message: 'Issue assigned successfully',
      issue: updatedIssue
    });
  } catch (error) {
    console.error('Pick issue error:', error);
    res.status(500).json({ error: 'Failed to pick issue' });
  }
}

/**
 * Sponsor an issue
 */
async function sponsorIssue(req, res) {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // Verify user is a sponsor
    if (req.user.role !== 'sponsor') {
      return res.status(403).json({ error: 'Only sponsors can sponsor issues' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (issue.sponsored_by) {
      return res.status(400).json({ error: 'Issue already sponsored' });
    }

    // Add sponsor
    const updatedIssue = await Issue.addSponsor(id, req.user.id, amount);

    // Log activity
    const user = await User.findById(req.user.id);
    await IssueActivity.logSponsorAdded(id, req.user.id, user.name, amount);

    // Award reputation
    await User.updateReputation(req.user.id, Math.floor(amount / 10)); // 1 point per $10

    res.json({
      message: 'Issue sponsored successfully',
      issue: updatedIssue
    });
  } catch (error) {
    console.error('Sponsor issue error:', error);
    res.status(500).json({ error: 'Failed to sponsor issue' });
  }
}

/**
 * Update issue status
 */
async function updateIssueStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Reported', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check permissions
    if (issue.assigned_to !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Only assigned volunteer or admin can update status'
      });
    }

    const oldStatus = issue.status;
    const updatedIssue = await Issue.updateStatus(id, status);

    // Log activity
    await IssueActivity.logStatusChange(id, req.user.id, oldStatus, status);

    if (status === 'Resolved') {
      const user = await User.findById(req.user.id);
      await IssueActivity.logIssueResolved(id, req.user.id, user.name);

      // Award bonus reputation for resolving
      await User.updateReputation(req.user.id, 5);
    }

    res.json({
      message: 'Issue status updated',
      issue: updatedIssue
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
}

/**
 * Upload after image (when marking as resolved)
 */
async function uploadAfterImage(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (issue.assigned_to !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only assigned volunteer can upload after image' });
    }

    const after_image_url = `/uploads/${req.file.filename}`;
    const updatedIssue = await Issue.updateAfterImage(id, after_image_url);

    res.json({
      message: 'After image uploaded successfully',
      issue: updatedIssue
    });
  } catch (error) {
    console.error('Upload after image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
}

/**
 * Get dashboard statistics
 */
async function getDashboardStats(req, res) {
  try {
    const stats = await Issue.getStats();
    const leaderboards = await Issue.getLeaderboards();
    const recentResolved = await Issue.getRecentResolved(5);

    res.json({
      stats,
      leaderboards,
      recentResolved
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
}

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  pickIssue,
  sponsorIssue,
  updateIssueStatus,
  uploadAfterImage,
  getDashboardStats
};
