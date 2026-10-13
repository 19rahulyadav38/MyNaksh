import {
  buildTimeline,
  GROUP_WINDOW_MS,
} from '../src/features/chat/model/timeline';
import type { Message } from '../src/features/chat/model/types';

const NOW = new Date(2026, 9, 13, 15, 0).getTime();
const MIN = 60 * 1000;
const YESTERDAY = NOW - 24 * 60 * MIN;

function toState(messages: Message[]) {
  return {
    order: messages.map(m => m.id),
    byId: Object.fromEntries(messages.map(m => [m.id, m])),
  };
}

const user = (id: string, createdAt: number): Message => ({
  id,
  type: 'user',
  text: id,
  createdAt,
  status: 'sent',
});
const ai = (id: string, createdAt: number): Message => ({
  id,
  type: 'ai',
  text: id,
  createdAt,
});
const system = (id: string, createdAt: number): Message => ({
  id,
  type: 'system',
  text: id,
  createdAt,
});
const human = (
  id: string,
  createdAt: number,
  senderName?: string,
): Message => ({
  id,
  type: 'human',
  text: id,
  createdAt,
  senderName,
});

function run(messages: Message[]) {
  const { order, byId } = toState(messages);
  return buildTimeline(order, byId, NOW);
}

function grouping(messages: Message[]) {
  return run(messages).flatMap(item =>
    item.kind === 'message'
      ? [[item.id, item.isFirstInGroup, item.isLastInGroup]]
      : [],
  );
}

describe('buildTimeline', () => {
  it('returns no rows for an empty conversation', () => {
    expect(run([])).toEqual([]);
  });

  it('inserts a date separator before the first message of each day', () => {
    const items = run([
      user('a', YESTERDAY),
      user('b', YESTERDAY + MIN),
      user('c', NOW),
    ]);

    expect(
      items.map(i => (i.kind === 'date' ? `date:${i.label}` : i.id)),
    ).toEqual(['date:Yesterday', 'a', 'b', 'date:Today', 'c']);
  });

  it('groups consecutive messages from the same sender', () => {
    expect(
      grouping([
        user('a', NOW),
        user('b', NOW + MIN),
        user('c', NOW + 2 * MIN),
      ]),
    ).toEqual([
      ['a', true, false],
      ['b', false, false],
      ['c', false, true],
    ]);
  });

  it('breaks groups on sender change', () => {
    expect(
      grouping([user('a', NOW), ai('b', NOW + MIN), ai('c', NOW + 2 * MIN)]),
    ).toEqual([
      ['a', true, true],
      ['b', true, false],
      ['c', false, true],
    ]);
  });

  it('breaks groups when the gap exceeds the window', () => {
    expect(
      grouping([user('a', NOW), user('b', NOW + GROUP_WINDOW_MS + 1)]),
    ).toEqual([
      ['a', true, true],
      ['b', true, true],
    ]);
  });

  it('breaks groups across midnight even within the window', () => {
    const midnight = new Date(2026, 9, 13).getTime();
    const items = grouping([
      user('a', midnight - MIN),
      user('b', midnight + MIN),
    ]);
    expect(items).toEqual([
      ['a', true, true],
      ['b', true, true],
    ]);
  });

  it('never groups system messages', () => {
    expect(grouping([system('a', NOW), system('b', NOW + MIN)])).toEqual([
      ['a', true, true],
      ['b', true, true],
    ]);
  });

  it('treats different human astrologers as different senders', () => {
    expect(
      grouping([
        human('a', NOW, 'Mehta'),
        human('b', NOW + MIN, 'Mehta'),
        human('c', NOW + 2 * MIN, 'Rao'),
      ]),
    ).toEqual([
      ['a', true, false],
      ['b', false, true],
      ['c', true, true],
    ]);
  });

  it('skips ids missing from byId', () => {
    const { byId } = toState([user('a', NOW)]);
    expect(
      buildTimeline(['a', 'ghost'], byId, NOW).filter(
        i => i.kind === 'message',
      ),
    ).toHaveLength(1);
  });
});
