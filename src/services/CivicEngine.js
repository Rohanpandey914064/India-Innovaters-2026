/**
 * Advanced Civic Intelligence Engine
 */
import { translateWithGemini } from '@/services/GeminiService';

/**
 * Calculates a Priority Score (0-100)
 */
export const calculatePriorityScore = (issue, votes = {}) => {
  const { severity = 'Low', upvotes = 0, downvotes = 0, isHospitalArea = false, isRepeat = false } = issue;

  const severityMap = { Low: 25, Medium: 50, High: 75, Critical: 100 };
  const severityScore = severityMap[severity] ?? 25;

  let aiScore = severityScore;
  if (isHospitalArea || issue.location?.toLowerCase().includes('hospital')) aiScore += 15;
  else if (issue.location?.toLowerCase().includes('school')) aiScore += 10;
  else if (issue.location?.toLowerCase().includes('market')) aiScore += 6;
  if (isRepeat) aiScore += 10;
  aiScore = Math.min(Math.max(aiScore, 0), 100);

  let computedUpvotes = Number(upvotes || 0);
  let computedDownvotes = Number(downvotes || 0);

  // Prefer exact vote map when available.
  if (votes && typeof votes === 'object' && Object.keys(votes).length > 0) {
    const arr = Object.values(votes);
    computedUpvotes = arr.filter((v) => v === 1).length;
    computedDownvotes = arr.filter((v) => v === -1).length;
  }

  const totalVotes = computedUpvotes + computedDownvotes;
  const voteRatioPercent = totalVotes === 0 ? 0 : (computedUpvotes / totalVotes) * 100;

  // Requested formula: 0.3 * AI score + 0.7 * (upvotes / totalVotes) * 100
  const weightedScore = Math.round(0.3 * aiScore + 0.7 * voteRatioPercent);

  return Math.min(Math.max(weightedScore, 0), 100);
};

/**
 * Gets Priority Label from Score
 */
export const getPriorityLabel = (score) => {
  if (score >= 85) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
};

/**
 * Uses AI to classify issue details
 */
export const classifyIssue = async (title, description) => {
  const prompt = `Classify this civic issue:\nTitle: ${title}\nDescription: ${description}\n\nReturn JSON only: { "severity": "Low|Medium|High|Critical", "urgency": "Low|Medium|High", "category": "Infrastructure|Water|Electricity|Sanitation|Other", "is_emergency": boolean, "department": "string" }`;
  
  try {
    const aiResponse = await translateWithGemini(prompt, 'en'); // Using Gemini for analysis
    if (aiResponse) {
      // Clean possible MD markers
      const cleanJson = aiResponse.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    }
  } catch (err) {
    console.error('AI Classification failed:', err);
  }
  
  return { severity: 'Medium', urgency: 'Medium', category: 'Infrastructure', is_emergency: false, department: 'General Public Works' };
};
