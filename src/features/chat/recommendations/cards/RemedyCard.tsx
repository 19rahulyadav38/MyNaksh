import type { RecommendationContentProps } from '../registry';
import type { RemedyRecommendation } from '../types';
import { CardMeta } from './CardMeta';

export function RemedyCard({
  recommendation: { day, durationDays },
  accent,
}: RecommendationContentProps<RemedyRecommendation>) {
  const items = [
    day ? `Every ${day}` : 'Daily practice',
    ...(durationDays ? [`${durationDays} days`] : []),
  ];
  return <CardMeta items={items} accent={accent} />;
}
