import { Alert } from 'react-native';

import {
  trackRecommendationTap,
  type RecommendationContext,
} from '../analytics';
import { getRecommendationRenderer } from './registry';
import type { Recommendation } from './types';

/**
 * Single entry point for recommendation taps: records the tap, then shows an
 * Alert. Deep links (`cta.action`) and navigation plug in here.
 */
export function handleRecommendationPress(
  recommendation: Recommendation,
  context: RecommendationContext,
) {
  trackRecommendationTap(recommendation, context);
  const { label, defaultCtaLabel } = getRecommendationRenderer(recommendation);
  const cta = recommendation.cta?.label ?? defaultCtaLabel;

  Alert.alert(recommendation.title, `${label} · ${cta}`);
}
