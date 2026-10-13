import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { spacing } from '../../../../shared/theme';
import { buildTimeline, type TimelineItem } from '../../model/timeline';
import { useChatStore } from '../../store/chatStore';
import { DateSeparator } from './DateSeparator';
import { MessageRow } from './MessageRow';

const keyExtractor = (item: TimelineItem) => item.id;

/** Separate recycling pools per row type; AI rows (with rails) never recycle into text rows. */
const getItemType = (item: TimelineItem) =>
  item.kind === 'date' ? 'date' : item.messageType;

const renderItem: ListRenderItem<TimelineItem> = ({ item }) =>
  item.kind === 'date' ? (
    <DateSeparator label={item.label} />
  ) : (
    <MessageRow
      messageId={item.id}
      isFirstInGroup={item.isFirstInGroup}
      isLastInGroup={item.isLastInGroup}
    />
  );

/** Start at the bottom; follow new messages only if the user is within 20% of the end. */
const MAINTAIN_POSITION = {
  startRenderingFromBottom: true,
  autoscrollToBottomThreshold: 0.2,
  animateAutoScrollToBottom: true,
} as const;

export function Timeline() {
  const order = useChatStore(state => state.order);
  const byId = useChatStore(state => state.byId);

  // Rows read their own message from the store, so the item list only carries
  // ids + grouping flags; a feedback change rebuilds this cheap array but no
  // row re-renders unless its own props or message changed.
  const items = useMemo(() => buildTimeline(order, byId), [order, byId]);

  // Open at the latest message. Read once: later updates are handled by
  // maintainVisibleContentPosition, not by re-scrolling.
  const [initialScrollIndex] = useState(() =>
    items.length > 0 ? items.length - 1 : undefined,
  );

  return (
    <FlashList
      data={items}
      initialScrollIndex={initialScrollIndex}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      maintainVisibleContentPosition={MAINTAIN_POSITION}
      contentContainerStyle={styles.content}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.lg,
  },
});
