import {
  upsertMessages,
  useChatStore,
} from '../src/features/chat/store/chatStore';
import type { Message } from '../src/features/chat/model/types';

const msg = (id: string, createdAt: number, text = id): Message => ({
  id,
  type: 'system',
  text,
  createdAt,
});

describe('upsertMessages', () => {
  const empty = { byId: {}, order: [] };

  it('appends new messages in order', () => {
    const state = upsertMessages(empty, [msg('a', 1), msg('b', 2)]);
    expect(state.order).toEqual(['a', 'b']);
  });

  it('is idempotent for duplicate deliveries and replaces content in place', () => {
    const first = upsertMessages(empty, [msg('a', 1), msg('b', 2)]);
    const second = upsertMessages(first, [msg('a', 1, 'edited')]);
    expect(second.order).toEqual(['a', 'b']);
    expect(second.byId.a?.text).toBe('edited');
  });

  it('re-sorts when a message arrives out of order', () => {
    const state = upsertMessages(upsertMessages(empty, [msg('b', 2)]), [
      msg('a', 1),
    ]);
    expect(state.order).toEqual(['a', 'b']);
  });

  it('returns the same reference when nothing is received', () => {
    const state = upsertMessages(empty, []);
    expect(state).toBe(empty);
  });
});

describe('chatStore.load', () => {
  beforeEach(() =>
    useChatStore.setState({ byId: {}, order: [], loadState: 'idle' }),
  );

  it('loads the seeded conversation', async () => {
    await useChatStore.getState().load({ delayMs: 0 });
    const { loadState, order } = useChatStore.getState();
    expect(loadState).toBe('success');
    expect(order.length).toBeGreaterThan(0);
  });

  it('handles the empty scenario', async () => {
    await useChatStore.getState().load({ delayMs: 0, scenario: 'empty' });
    expect(useChatStore.getState()).toMatchObject({
      loadState: 'success',
      order: [],
    });
  });

  it('moves to error on network failure', async () => {
    await useChatStore.getState().load({ delayMs: 0, scenario: 'error' });
    expect(useChatStore.getState().loadState).toBe('error');
  });
});
