import type { RecommendationContentProps } from '../registry';
import type { GemstoneRecommendation } from '../types';
import { CardMeta } from './CardMeta';

export function GemstoneCard({
  recommendation: { planet, priceFrom },
  accent,
}: RecommendationContentProps<GemstoneRecommendation>) {
  const items = [
    planet ? `For ${planet}` : 'Lab certified',
    priceFrom ? `From ₹${priceFrom.toLocaleString('en-IN')}` : 'Energised',
  ];
  return <CardMeta items={items} accent={accent} />;
}
