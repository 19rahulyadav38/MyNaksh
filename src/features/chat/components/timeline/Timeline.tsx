import {
  FlashList,
  type FlashListRef,
  type ListRenderItem,
} from '@shopify/flash-list';
import { useMemo, useState, type Ref } from 'react';
import { StyleSheet } from 'react-native';

import { spacing } from '../../../../shared/theme';
import { buildTimeline, type TimelineItem } from '../../model/timeline';
import { useChatStore } from '../../store/chatStore';
import { useVisibilityStore } from '../../store/visibilityStore';
import { DateSeparator } from './DateSeparator';
import { MessageRow } from './MessageRow';
import { TypingIndicator } from './TypingIndicator';

export type TimelineRef = FlashListRef<TimelineItem>;

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

/** AI rows with rails are tall; a third on screen is enough to count as seen. */
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 30 };

const onViewableItemsChanged = ({
  viewableItems,
}: {
  viewableItems: { item: TimelineItem }[];
}) =>
  useVisibilityStore
    .getState()
    .setVisibleMessageIds(
      viewableItems.flatMap(({ item }) =>
        item.kind === 'message' ? [item.id] : [],
      ),
    );

/** Follow new messages only if the user is within 20% of the end. */
const MAINTAIN_POSITION = {
  startRenderingFromBottom: true,
  autoscrollToBottomThreshold: 0.2,
  animateAutoScrollToBottom: true,
} as const;

type Props = {
  ref?: Ref<TimelineRef>;
};

export function Timeline({ ref }: Props) {
  const order = useChatStore(state => state.order);
  const isAiTyping = useChatStore(state => state.isAiTyping);

  // Grouping depends only on fields that never change after insert (type,
  // sender, createdAt), so the timeline is rebuilt when `order` changes, not
  // on every status/feedback edit. Rows subscribe to their own message.
  const items = useMemo(
    () => buildTimeline(order, useChatStore.getState().byId),
    [order],
  );

  // Open at the latest message. Read once: later updates are handled by
  // maintainVisibleContentPosition, not by re-scrolling.
  const [initialScrollIndex] = useState(() =>
    items.length > 0 ? items.length - 1 : undefined,
  );

  return (
    <FlashList
      ref={ref}
      data={items}
      initialScrollIndex={initialScrollIndex}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      maintainVisibleContentPosition={MAINTAIN_POSITION}
      viewabilityConfig={VIEWABILITY_CONFIG}
      onViewableItemsChanged={onViewableItemsChanged}
      ListFooterComponent={isAiTyping ? TypingIndicator : null}
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
