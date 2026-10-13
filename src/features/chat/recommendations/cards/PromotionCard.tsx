import type { RecommendationContentProps } from '../registry';
import type { PromotionRecommendation } from '../types';
import { CardMeta } from './CardMeta';

export function PromotionCard({
  recommendation: { discountLabel },
  accent,
}: RecommendationContentProps<PromotionRecommendation>) {
  return <CardMeta items={[discountLabel ?? 'Limited time']} accent={accent} />;
}
