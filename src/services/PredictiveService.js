/**
 * Predictive Maintenance Engine
 */
import { getDistance } from '@/lib/geoUtils';

const RISK_RADIUS_METERS = 100; // Look for patterns within 100m
const REPEAT_THRESHOLD = 3; // 3 issues in same area = alert

/**
 * Detects patterns and potential infrastructure failures
 */
export const analyzePatterns = (newIssue, allIssues) => {
  const nearbyHistorical = allIssues.filter(i => 
    getDistance(newIssue.lat, newIssue.lng, i.lat, i.lng) < RISK_RADIUS_METERS &&
    i.category === newIssue.category
  );

  const count = nearbyHistorical.length;
  
  if (count >= REPEAT_THRESHOLD) {
    let alertMessage = `Recurring ${newIssue.category} issues detected in this area (${count} reports). Potential systemic infrastructure failure.`;
    
    // Special logic for anomaly detection
    const isWater = newIssue.category === 'Water';
    const isDrySeason = new Date().getMonth() >= 2 && new Date().getMonth() <= 5; // March-June (India)
    
    if (isWater && isDrySeason) {
      alertMessage = `High Risk: Unusual water logging/leakage detected during dry season. Possible major pipeline burst at this location.`;
    }

    return {
      type: 'Predictive Alert',
      message: alertMessage,
      reasoning: alertMessage,
      riskLevel: 'High',
      count: count
    };
  }

  return null;
};

/**
 * Generates an automated escalation alert for Admin
 */
export const generateEscalation = (issue, priorityScore) => {
  if (priorityScore >= 85 || issue.is_emergency) {
    return {
      type: 'Immediate Escalation',
      message: `Critical Issue [${issue.title}] requires immediate attention. Priority Score: ${priorityScore}.`,
      target: 'District Magistrate / Municipal Commissioner'
    };
  }
  return null;
};
