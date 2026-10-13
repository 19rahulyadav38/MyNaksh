import type { RecommendationContentProps } from '../registry';
import type { ArticleRecommendation } from '../types';
import { CardMeta } from './CardMeta';

const DEFAULT_READ_TIME_MINUTES = 5;

export function ArticleCard({
  recommendation: { readTimeMinutes = DEFAULT_READ_TIME_MINUTES },
  accent,
}: RecommendationContentProps<ArticleRecommendation>) {
  return <CardMeta items={[`${readTimeMinutes} min read`]} accent={accent} />;
}
