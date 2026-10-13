import type { RecommendationContentProps } from '../registry';
import type { ConsultationRecommendation } from '../types';
import { CardMeta } from './CardMeta';

export function ConsultationCard({
  recommendation: { astrologerName, pricePerMinute },
  accent,
}: RecommendationContentProps<ConsultationRecommendation>) {
  const items = [
    astrologerName ?? 'Verified experts',
    pricePerMinute ? `₹${pricePerMinute}/min` : 'Chat or call',
  ];
  return <CardMeta items={items} accent={accent} />;
}
