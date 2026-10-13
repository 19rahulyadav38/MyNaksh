import type { RecommendationContentProps } from '../registry';
import type { TarotRecommendation } from '../types';
import { CardMeta } from './CardMeta';

const DEFAULT_CARD_COUNT = 3;

export function TarotCard({
  recommendation: { cardCount = DEFAULT_CARD_COUNT },
  accent,
}: RecommendationContentProps<TarotRecommendation>) {
  return <CardMeta items={[`${cardCount}-card spread`]} accent={accent} />;
}
