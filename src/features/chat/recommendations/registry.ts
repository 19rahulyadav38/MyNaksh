import type { ComponentType } from 'react';

import { accents, type Accent } from '../../../shared/theme';
import { ArticleCard } from './cards/ArticleCard';
import { ConsultationCard } from './cards/ConsultationCard';
import { GemstoneCard } from './cards/GemstoneCard';
import { PromotionCard } from './cards/PromotionCard';
import { TarotCard } from './cards/TarotCard';
import type { Recommendation, RecommendationType } from './types';

export type RecommendationContentProps<R extends Recommendation> = {
  recommendation: R;
  accent: Accent;
};

export type RecommendationRenderer<R extends Recommendation> = {
  /** Type-specific card body. The shared shell owns press, title, CTA and errors. */
  Content: ComponentType<RecommendationContentProps<R>>;
  /** Human-readable category, shown as the card eyebrow. */
  label: string;
  icon: string;
  accent: Accent;
  /** Used when the server doesn't send `cta.label`. */
  defaultCtaLabel: string;
};

type RecommendationRegistry = {
  [T in RecommendationType]: RecommendationRenderer<
    Extract<Recommendation, { type: T }>
  >;
};

/**
 * The single place that maps a recommendation type to its UI.
 *
 * Adding a new type:
 *   1. Add a variant to the `Recommendation` union (types.ts).
 *   2. Create its card body in `cards/`.
 *   3. Register it here. The mapped type makes a missing entry a compile error.
 */
export const recommendationRegistry: RecommendationRegistry = {
  gemstone: {
    Content: GemstoneCard,
    label: 'Gemstone',
    icon: '💎',
    accent: accents.violet,
    defaultCtaLabel: 'View gemstone',
  },
  tarot: {
    Content: TarotCard,
    label: 'Tarot',
    icon: '🔮',
    accent: accents.indigo,
    defaultCtaLabel: 'Start reading',
  },
  consultation: {
    Content: ConsultationCard,
    label: 'Consultation',
    icon: '👨‍🏫',
    accent: accents.teal,
    defaultCtaLabel: 'Talk now',
  },
  article: {
    Content: ArticleCard,
    label: 'Article',
    icon: '📖',
    accent: accents.sky,
    defaultCtaLabel: 'Read',
  },
  promotion: {
    Content: PromotionCard,
    label: 'Offer',
    icon: '🎁',
    accent: accents.saffron,
    defaultCtaLabel: 'Claim offer',
  },
};

export function isRecommendationType(
  type: unknown,
): type is RecommendationType {
  return (
    typeof type === 'string' &&
    Object.prototype.hasOwnProperty.call(recommendationRegistry, type)
  );
}

export function getRecommendationRenderer<R extends Recommendation>(
  recommendation: R,
): RecommendationRenderer<R> {
  // The mapped registry type guarantees the entry for `R['type']` renders `R`;
  // TypeScript can't correlate the union through the index, hence the cast.
  return recommendationRegistry[
    recommendation.type
  ] as unknown as RecommendationRenderer<R>;
}
