const { categorizeIssue, enhanceDescription, matchVolunteer } = require('../services/aiService');
const User = require('../models/User');

/**
 * AI endpoint to categorize an issue
 * POST /api/ai/categorize-issue
 */
async function categorize(req, res) {
  try {
    const { description, title } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const result = await categorizeIssue(description, title || '');

    res.json({
      category: result.category,
      priority: result.priority,
      reasoning: result.reasoning,
      aiCategorized: result.aiCategorized
    });
  } catch (error) {
    console.error('AI categorization error:', error);
    res.status(500).json({ error: 'Failed to categorize issue' });
  }
}

/**
 * AI endpoint to enhance description
 * POST /api/ai/enhance-description
 */
async function enhance(req, res) {
  try {
    const { description, title } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const result = await enhanceDescription(description, title || '');

    res.json({
      original: description,
      enhanced: result.enhanced,
      wasEnhanced: result.wasEnhanced,
      message: result.message
    });
  } catch (error) {
    console.error('AI enhancement error:', error);
    res.status(500).json({ error: 'Failed to enhance description' });
  }
}

/**
 * AI endpoint to match volunteers
 * POST /api/ai/match-volunteer
 */
async function match(req, res) {
  try {
    const { issue_details } = req.body;

    if (!issue_details) {
      return res.status(400).json({ error: 'Issue details are required' });
    }

    // Get all volunteers
    const volunteers = await User.findByRole('volunteer');

    if (volunteers.length === 0) {
      return res.json({
        recommendedVolunteers: [],
        reasoning: 'No volunteers available',
        aiMatched: false
      });
    }

    const result = await matchVolunteer(issue_details, volunteers);

    res.json({
      recommendedVolunteers: result.recommendedVolunteers,
      reasoning: result.reasoning,
      aiMatched: result.aiMatched
    });
  } catch (error) {
    console.error('AI matching error:', error);
    res.status(500).json({ error: 'Failed to match volunteers' });
  }
}

module.exports = {
  categorize,
  enhance,
  match
};
