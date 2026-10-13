import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  type ListRenderItem,
  type ListViewToken,
} from 'react-native';

import { spacing } from '../../../shared/theme';
import { trackRecommendationImpression } from '../analytics';
import { useIsMessageVisible } from '../store/visibilityStore';
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
/** A card counts as seen once most of it is on screen horizontally. */
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 60 };

function RecommendationRailBase({ messageId, recommendations, inset }: Props) {
  const isMessageVisible = useIsMessageVisible(messageId);
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);

  // FlatList requires a stable callback for its whole lifetime.
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ListViewToken[] }) =>
      setVisibleIndexes(
        viewableItems.flatMap(token =>
          typeof token.index === 'number' ? [token.index] : [],
        ),
      ),
  ).current;

  // Impression = card visible in the rail AND its message visible in the
  // timeline, so cards pre-rendered off screen are never counted.
  useEffect(() => {
    if (!isMessageVisible) {
      return;
    }
    for (const position of visibleIndexes) {
      const recommendation = recommendations[position];
      if (recommendation) {
        trackRecommendationImpression(recommendation, { messageId, position });
      }
    }
  }, [isMessageVisible, messageId, recommendations, visibleIndexes]);

  const handlePress = useCallback(
    (recommendation: Recommendation) =>
      handleRecommendationPress(recommendation, {
        messageId,
        position: recommendations.indexOf(recommendation),
      }),
    [messageId, recommendations],
  );

  // Recommendation ids are only unique within a message.
  const keyExtractor = useCallback(
    (item: Recommendation) => `${messageId}:${item.id}`,
    [messageId],
  );

  const renderItem = useCallback<ListRenderItem<Recommendation>>(
    ({ item }) => (
      <RecommendationCard recommendation={item} onPress={handlePress} />
    ),
    [handlePress],
  );

  return (
    <FlatList
      horizontal
      data={recommendations}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      viewabilityConfig={VIEWABILITY_CONFIG}
      onViewableItemsChanged={onViewableItemsChanged}
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
