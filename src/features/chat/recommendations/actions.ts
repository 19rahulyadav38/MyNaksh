import { Alert } from 'react-native';

import { getRecommendationRenderer } from './registry';
import type { Recommendation } from './types';

/**
 * Single entry point for recommendation taps. Today it shows an Alert; this is
 * where deep links (`cta.action`), analytics and navigation would plug in.
 */
export function handleRecommendationPress(recommendation: Recommendation) {
  const { label, defaultCtaLabel } = getRecommendationRenderer(recommendation);
  const cta = recommendation.cta?.label ?? defaultCtaLabel;

  Alert.alert(recommendation.title, `${label} · ${cta}`);
}
