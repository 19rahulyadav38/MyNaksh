import { track } from '../../shared/analytics/analytics';
import type { Feedback } from './model/types';
import type { Recommendation } from './recommendations/types';

export type RecommendationContext = {
  messageId: string;
  /** Zero-based index in the message's rail. */
  position: number;
};

function recommendationProperties(
  recommendation: Recommendation,
  { messageId, position }: RecommendationContext,
) {
  return {
    message_id: messageId,
    recommendation_id: recommendation.id,
    recommendation_type: recommendation.type,
    position,
  };
}

const impressionsLogged = new Set<string>();

/** Logged at most once per card per app session. */
export function trackRecommendationImpression(
  recommendation: Recommendation,
  context: RecommendationContext,
) {
  const key = `${context.messageId}:${recommendation.id}`;
  if (impressionsLogged.has(key)) {
    return;
  }
  impressionsLogged.add(key);
  track({
    name: 'recommendation_impression',
    properties: recommendationProperties(recommendation, context),
  });
}

export function trackRecommendationTap(
  recommendation: Recommendation,
  context: RecommendationContext,
) {
  track({
    name: 'recommendation_tap',
    properties: recommendationProperties(recommendation, context),
  });
}

export function trackAiFeedback(messageId: string, feedback: Feedback) {
  track({
    name: 'ai_feedback',
    properties: {
      message_id: messageId,
      value: feedback.value,
      reasons: feedback.reasons,
    },
  });
}

/** Test helper. */
export function resetImpressionsForTests() {
  impressionsLogged.clear();
}
