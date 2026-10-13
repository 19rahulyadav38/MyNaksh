import { memo, useCallback } from 'react';
import { FlatList, StyleSheet, type ListRenderItem } from 'react-native';

import { spacing } from '../../../shared/theme';
import { handleRecommendationPress } from './actions';
import { CARD_WIDTH, RecommendationCard } from './RecommendationCard';
import type { Recommendation } from './types';

type Props = {
  messageId: string;
  recommendations: Recommendation[];
  /** Left inset so the first card lines up with the message bubble. */
  inset: number;
};

const GAP = spacing.sm;

function RecommendationRailBase({ messageId, recommendations, inset }: Props) {
  // Recommendation ids are only unique within a message.
  const keyExtractor = useCallback(
    (item: Recommendation) => `${messageId}:${item.id}`,
    [messageId],
  );

  const renderItem = useCallback<ListRenderItem<Recommendation>>(
    ({ item }) => (
      <RecommendationCard
        recommendation={item}
        onPress={handleRecommendationPress}
      />
    ),
    [],
  );

  return (
    <FlatList
      horizontal
      data={recommendations}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + GAP}
      decelerationRate="fast"
      contentContainerStyle={[styles.content, { paddingLeft: inset }]}
      accessibilityLabel="Recommendations"
    />
  );
}

export const RecommendationRail = memo(RecommendationRailBase);

const styles = StyleSheet.create({
  content: {
    gap: GAP,
    paddingRight: spacing.lg,
    paddingVertical: spacing.xs,
  },
});
