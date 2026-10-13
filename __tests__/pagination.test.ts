import * as chatApi from '../src/features/chat/api/chatApi';
import { appendedIds } from '../src/features/chat/model/timeline';
import { useChatStore } from '../src/features/chat/store/chatStore';

const { mockConfig, OLDER_PAGE_SIZE } = chatApi;
const state = () => useChatStore.getState();

beforeAll(() => {
  mockConfig.olderDelayMs = 0;
});

beforeEach(async () => {
  useChatStore.setState({ loadState: 'idle' });
  await state().load({ delayMs: 0 });
});

afterEach(() => jest.restoreAllMocks());

describe('loadOlder', () => {
  it('prepends a page of history and keeps chronological order', async () => {
    const before = state().order;
    await state().loadOlder();

    const { order, byId } = state();
    expect(order).toHaveLength(before.length + OLDER_PAGE_SIZE);
    expect(order.slice(OLDER_PAGE_SIZE)).toEqual(before);
    const times = order.map(id => byId[id]!.createdAt);
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it('pages until history is exhausted, then stops', async () => {
    let pages = 0;
    while (state().hasOlder && pages < 10) {
      await state().loadOlder();
      pages += 1;
    }
    expect(state().hasOlder).toBe(false);
    expect(pages).toBe(3); // 14 history messages / 6 per page

    const spy = jest.spyOn(chatApi, 'fetchOlderMessages');
    await state().loadOlder();
    expect(spy).not.toHaveBeenCalled();
  });

  it('ignores concurrent calls while a page is in flight', async () => {
    const spy = jest.spyOn(chatApi, 'fetchOlderMessages');
    await Promise.all([state().loadOlder(), state().loadOlder()]);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('surfaces failures so the header can offer a retry', async () => {
    jest
      .spyOn(chatApi, 'fetchOlderMessages')
      .mockRejectedValueOnce(new Error('offline'));
    await state().loadOlder();
    expect(state()).toMatchObject({ olderState: 'error', hasOlder: true });

    await state().loadOlder();
    expect(state().olderState).toBe('idle');
  });

  it('drops a page that lands after the conversation was reloaded', async () => {
    mockConfig.olderDelayMs = 20;
    try {
      const paging = state().loadOlder();
      await state().load({ delayMs: 0, scenario: 'empty' });
      await paging;
      expect(state().order).toEqual([]);
    } finally {
      mockConfig.olderDelayMs = 0;
    }
  });
});

describe('appendedIds', () => {
  it('returns ids added after the previous last message', () => {
    expect(appendedIds(['a', 'b'], ['a', 'b', 'c', 'd'])).toEqual(['c', 'd']);
  });

  it('ignores prepended history', () => {
    expect(appendedIds(['c', 'd'], ['a', 'b', 'c', 'd'])).toEqual([]);
  });

  it('ignores reloads, deletions of the last message and the initial render', () => {
    expect(appendedIds(['a', 'b'], ['x', 'y'])).toEqual([]);
    expect(appendedIds(['a', 'b'], ['a'])).toEqual([]);
    expect(appendedIds([], ['a'])).toEqual([]);
  });
});
