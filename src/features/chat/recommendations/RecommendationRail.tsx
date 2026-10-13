import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
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
  /** Distance from the screen edge to the first card, to line it up with the bubble. */
  inset: number;
};

const GAP = spacing.sm;
const STEP = CARD_WIDTH + GAP;
/** Cards are clipped this far from each screen edge, matching the message rows. */
const EDGE_GUTTER = spacing.lg;
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

  // The rail is clipped to the gutter, so the first card's lead-in is
  // measured from the gutter rather than the screen edge.
  const leading = Math.max(0, inset - EDGE_GUTTER);

  // Rest position: first card under the bubble. Every later stop puts a card
  // flush against the gutter, so no sliver of the previous card shows.
  const snapToOffsets = useMemo(
    () =>
      recommendations.map((_, index) =>
        index === 0 ? 0 : leading + index * STEP,
      ),
    [leading, recommendations],
  );

  const renderItem = useCallback<ListRenderItem<Recommendation>>(
    ({ item }) => (
      <RecommendationCard recommendation={item} onPress={handlePress} />
    ),
    [handlePress],
  );

  return (
    <View style={styles.clip}>
      <FlatList
        horizontal
        data={recommendations}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={onViewableItemsChanged}
        showsHorizontalScrollIndicator={false}
        snapToOffsets={snapToOffsets}
        decelerationRate="fast"
        contentContainerStyle={[styles.content, { paddingLeft: leading }]}
        accessibilityLabel="Recommendations"
      />
    </View>
  );
}

export const RecommendationRail = memo(RecommendationRailBase);

const styles = StyleSheet.create({
  clip: {
    marginHorizontal: EDGE_GUTTER,
    overflow: 'hidden',
  },
  content: {
    gap: GAP,
    paddingVertical: spacing.xs,
  },
});
