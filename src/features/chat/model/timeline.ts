import { formatDayLabel, isSameDay } from '../../../shared/utils';
import type { Message, MessageType } from './types';

/** Consecutive messages from the same sender within this window are grouped. */
export const GROUP_WINDOW_MS = 5 * 60 * 1000;

export type DateSeparatorItem = {
  kind: 'date';
  id: string;
  label: string;
};

export type MessageItem = {
  kind: 'message';
  id: string;
  messageType: MessageType;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
};

export type TimelineItem = DateSeparatorItem | MessageItem;

/** Identity used for grouping. System events never group. */
function senderKey(message: Message): string | null {
  switch (message.type) {
    case 'system':
      return null;
    case 'human':
      return `human:${message.senderName ?? ''}`;
    case 'user':
    case 'ai':
      return message.type;
  }
}

function isSameGroup(a: Message, b: Message): boolean {
  const key = senderKey(a);
  return (
    key !== null &&
    key === senderKey(b) &&
    isSameDay(a.createdAt, b.createdAt) &&
    Math.abs(b.createdAt - a.createdAt) <= GROUP_WINDOW_MS
  );
}

/**
 * Turns ordered messages into list rows: inserts a date separator at every
 * day boundary and annotates each message with its position in its group.
 * Pure, so it's cheap to memoize and trivial to test.
 */
export function buildTimeline(
  order: readonly string[],
  byId: Readonly<Record<string, Message>>,
  now = Date.now(),
): TimelineItem[] {
  const messages = order.flatMap(id => {
    const message = byId[id];
    return message ? [message] : [];
  });

  const items: TimelineItem[] = [];

  messages.forEach((message, index) => {
    const previous = messages[index - 1];
    const next = messages[index + 1];

    if (!previous || !isSameDay(previous.createdAt, message.createdAt)) {
      items.push({
        kind: 'date',
        id: `date:${new Date(message.createdAt).toDateString()}`,
        label: formatDayLabel(message.createdAt, now),
      });
    }

    items.push({
      kind: 'message',
      id: message.id,
      messageType: message.type,
      isFirstInGroup: !previous || !isSameGroup(previous, message),
      isLastInGroup: !next || !isSameGroup(message, next),
    });
  });

  return items;
}

/**
 * Ids added after the previous last message. Prepended history, deletions and
 * full reloads (previous last no longer present) all return [].
 */
export function appendedIds(
  previous: readonly string[],
  next: readonly string[],
): string[] {
  const previousLast = previous[previous.length - 1];
  if (previousLast === undefined) {
    return [];
  }
  const index = next.lastIndexOf(previousLast);
  return index === -1 ? [] : next.slice(index + 1);
}
