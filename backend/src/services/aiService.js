const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

// Initialize Anthropic client
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Mock responses for when API key is not available
const MOCK_MODE = !process.env.ANTHROPIC_API_KEY;

if (MOCK_MODE) {
  console.log('⚠️  AI Service running in MOCK MODE - No API key provided');
  console.log('💡 Add ANTHROPIC_API_KEY to .env file for real AI integration');
}

/**
 * AI-powered issue categorization
 * Analyzes the problem description and returns category + priority
 */
async function categorizeIssue(description, title = '') {
  if (MOCK_MODE) {
    // Mock response when no API key
    return {
      category: 'Infrastructure',
      priority: 'Medium',
      reasoning: 'Mock categorization - Add API key for real AI analysis',
      aiCategorized: false
    };
  }

  try {
    const prompt = `You are an AI assistant helping categorize civic problems for a problem reporting platform.

Given the following problem report, categorize it into ONE of these categories:
- Infrastructure (roads, bridges, potholes, streetlights, water supply, drainage)
- Cleanliness (garbage, waste management, littering, sanitation)
- Safety (broken lights, dangerous areas, unsafe structures)
- Other (anything that doesn't fit above)

Also assign a priority level:
- Low: Minor inconvenience, non-urgent
- Medium: Moderate impact, should be addressed soon
- High: Urgent, safety risk or major impact

Title: ${title}
Description: ${description}

Respond in JSON format:
{
  "category": "one of the four categories",
  "priority": "Low, Medium, or High",
  "reasoning": "brief explanation of your categorization"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Parse the AI response
    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        category: result.category,
        priority: result.priority,
        reasoning: result.reasoning,
        aiCategorized: true
      };
    }

    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('❌ AI Categorization error:', error.message);
    // Fallback to default categorization
    return {
      category: 'Other',
      priority: 'Medium',
      reasoning: 'Auto-categorization failed, using default',
      aiCategorized: false
    };
  }
}

/**
 * Enhance a brief problem description with AI
 * Makes descriptions clearer and more detailed
 */
async function enhanceDescription(briefDescription, title = '') {
  if (MOCK_MODE) {
    return {
      enhanced: briefDescription,
      wasEnhanced: false,
      message: 'Mock mode - Add API key for AI enhancement'
    };
  }

  try {
    // Only enhance if description is brief (less than 100 characters)
    if (briefDescription.length > 100) {
      return {
        enhanced: briefDescription,
        wasEnhanced: false,
        message: 'Description already detailed enough'
      };
    }

    const prompt = `You are helping citizens report civic problems. Enhance this brief problem description to be clearer and more actionable while keeping it concise (2-3 sentences max).

Title: ${title}
Brief Description: ${briefDescription}

Provide an enhanced description that:
1. Clarifies the problem
2. Adds relevant details
3. Remains factual and objective
4. Is 2-3 sentences

Return ONLY the enhanced description, no other text.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const enhanced = message.content[0].text.trim();

    return {
      enhanced: enhanced,
      wasEnhanced: true,
      message: 'Description enhanced by AI'
    };
  } catch (error) {
    console.error('❌ AI Enhancement error:', error.message);
    return {
      enhanced: briefDescription,
      wasEnhanced: false,
      message: 'Enhancement failed, using original'
    };
  }
}

/**
 * Smart volunteer matching using AI
 * Matches issues with best-suited volunteers based on skills and history
 */
async function matchVolunteer(issueDetails, availableVolunteers) {
  if (MOCK_MODE || !availableVolunteers || availableVolunteers.length === 0) {
    return {
      recommendedVolunteers: availableVolunteers || [],
      reasoning: 'Mock matching - Add API key for smart AI matching',
      aiMatched: false
    };
  }

  try {
    const prompt = `You are helping match civic problems with the best volunteers.

Issue Details:
- Title: ${issueDetails.title}
- Category: ${issueDetails.category}
- Description: ${issueDetails.description}
- Priority: ${issueDetails.priority}

Available Volunteers:
${availableVolunteers.map((v, idx) => `
${idx + 1}. ${v.name}
   - Skills: ${v.skills ? v.skills.join(', ') : 'None specified'}
   - Completed Issues: ${v.issues_completed || 0}
   - Reputation: ${v.reputation_points || 0}
`).join('\n')}

Rank these volunteers from best to worst match for this issue. Consider:
1. Relevant skills
2. Experience (completed issues)
3. Reputation

Respond in JSON format:
{
  "rankedVolunteerIds": [array of user_ids in order of best match],
  "reasoning": "brief explanation of top match"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);

      // Reorder volunteers based on AI ranking
      const rankedVolunteers = result.rankedVolunteerIds
        .map(id => availableVolunteers.find(v => v.user_id === id || v.id === id))
        .filter(v => v !== undefined);

      return {
        recommendedVolunteers: rankedVolunteers,
        reasoning: result.reasoning,
        aiMatched: true
      };
    }

    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('❌ AI Matching error:', error.message);
    return {
      recommendedVolunteers: availableVolunteers,
      reasoning: 'Auto-matching failed, showing all volunteers',
      aiMatched: false
    };
  }
}

/**
 * Generate suggested actions for an issue
 */
async function suggestActions(issueDetails) {
  if (MOCK_MODE) {
    return {
      suggestions: ['Review the issue', 'Assign a volunteer', 'Seek sponsorship'],
      aiGenerated: false
    };
  }

  try {
    const prompt = `Given this civic issue, suggest 3 actionable next steps:

Issue: ${issueDetails.title}
Category: ${issueDetails.category}
Description: ${issueDetails.description}
Status: ${issueDetails.status}

Provide 3 concrete, actionable suggestions as a JSON array of strings.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      return {
        suggestions: suggestions,
        aiGenerated: true
      };
    }

    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('❌ AI Suggestions error:', error.message);
    return {
      suggestions: ['Review the issue details', 'Contact relevant authorities', 'Monitor progress'],
      aiGenerated: false
    };
  }
}

module.exports = {
  categorizeIssue,
  enhanceDescription,
  matchVolunteer,
  suggestActions,
  MOCK_MODE
};
