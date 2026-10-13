import {
  FlashList,
  type FlashListRef,
  type ListRenderItem,
} from '@shopify/flash-list';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type Ref,
} from 'react';
import {
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { spacing } from '../../../../shared/theme';
import {
  appendedIds,
  buildTimeline,
  type TimelineItem,
} from '../../model/timeline';
import { useChatStore } from '../../store/chatStore';
import { useVisibilityStore } from '../../store/visibilityStore';
import { DateSeparator } from './DateSeparator';
import { HistoryHeader } from './HistoryHeader';
import { MessageRow } from './MessageRow';
import { NewMessagesPill } from './NewMessagesPill';
import { TypingIndicator } from './TypingIndicator';

export type TimelineRef = {
  scrollToEnd: () => void;
};

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

/** "Near the bottom" = within 20% of a screen of the end. */
const BOTTOM_THRESHOLD = 0.2;

/**
 * Follow new messages only when near the bottom; otherwise hold position and
 * surface them through the "new messages" pill. Also keeps position when
 * history is prepended or a message is deleted.
 */
const MAINTAIN_POSITION = {
  startRenderingFromBottom: true,
  autoscrollToBottomThreshold: BOTTOM_THRESHOLD,
  animateAutoScrollToBottom: true,
} as const;

/** Start fetching history while the user is still half a screen from the top. */
const START_REACHED_THRESHOLD = 0.5;

type Props = {
  ref?: Ref<TimelineRef>;
};

export function Timeline({ ref }: Props) {
  const listRef = useRef<FlashListRef<TimelineItem>>(null);
  const order = useChatStore(state => state.order);
  const isAiTyping = useChatStore(state => state.isAiTyping);
  const loadOlder = useChatStore(state => state.loadOlder);

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

  const [unseenCount, setUnseenCount] = useState(0);
  const isNearBottomRef = useRef(true);
  const previousOrderRef = useRef(order);

  const scrollToEnd = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
    setUnseenCount(0);
  }, []);

  useImperativeHandle(ref, () => ({ scrollToEnd }), [scrollToEnd]);

  // Count incoming messages that landed while the user was reading history.
  // The user's own messages never count: sending always scrolls to the end.
  useEffect(() => {
    const previous = previousOrderRef.current;
    previousOrderRef.current = order;
    if (isNearBottomRef.current) {
      return;
    }
    const { byId } = useChatStore.getState();
    const incoming = appendedIds(previous, order).filter(
      id => byId[id]?.type !== 'user',
    );
    if (incoming.length > 0) {
      setUnseenCount(count => count + incoming.length);
    }
  }, [order]);

  const handleScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
      const distanceFromEnd =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      const isNearBottom =
        distanceFromEnd <= layoutMeasurement.height * BOTTOM_THRESHOLD;
      isNearBottomRef.current = isNearBottom;
      if (isNearBottom) {
        setUnseenCount(0);
      }
    },
    [],
  );

  return (
    <View style={styles.container}>
      <FlashList
        ref={listRef}
        data={items}
        initialScrollIndex={initialScrollIndex}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        maintainVisibleContentPosition={MAINTAIN_POSITION}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={onViewableItemsChanged}
        onStartReached={loadOlder}
        onStartReachedThreshold={START_REACHED_THRESHOLD}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        ListHeaderComponent={HistoryHeader}
        ListFooterComponent={isAiTyping ? TypingIndicator : null}
        contentContainerStyle={styles.content}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />
      {unseenCount > 0 ? (
        <NewMessagesPill count={unseenCount} onPress={scrollToEnd} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.lg,
  },
});
