import { mockConfig, sendMessage } from '../src/features/chat/api/chatApi';
import type {
  AiMessage,
  Message,
  UserMessage,
} from '../src/features/chat/model/types';
import {
  nextFeedback,
  useChatStore,
} from '../src/features/chat/store/chatStore';

const ai = (id: string): AiMessage => ({
  id,
  type: 'ai',
  text: `ai ${id}`,
  createdAt: 1,
});

function reset(messages: Message[] = []) {
  useChatStore.setState({
    byId: Object.fromEntries(messages.map(m => [m.id, m])),
    order: messages.map(m => m.id),
    loadState: 'success',
    isAiTyping: false,
    replyTarget: null,
    actionTargetId: null,
  });
}

const state = () => useChatStore.getState();
const userMessages = () =>
  state()
    .order.map(id => state().byId[id])
    .filter((m): m is UserMessage => m?.type === 'user');

beforeAll(() => {
  mockConfig.sendDelayMs = [0, 0];
  mockConfig.replyDelayMs = [0, 0];
});

beforeEach(() => {
  mockConfig.sendFailureRate = 0;
  reset();
});

describe('send', () => {
  it('adds the message optimistically as "sending"', () => {
    const pending = state().send('Hello');
    expect(userMessages()).toEqual([
      expect.objectContaining({ text: 'Hello', status: 'sending' }),
    ]);
    return pending;
  });

  it('marks the message sent and appends an AI reply with recommendations', async () => {
    await state().send('How is my career?');
    const [message] = userMessages();
    expect(message?.status).toBe('sent');

    const reply = state().byId[state().order[state().order.length - 1] ?? ''];
    expect(reply).toMatchObject({ type: 'ai' });
    expect((reply as AiMessage).recommendations?.length).toBeGreaterThan(0);
    expect(state().isAiTyping).toBe(false);
  });

  it('ignores blank input', async () => {
    await state().send('   ');
    expect(state().order).toEqual([]);
  });

  it('marks the message failed and does not request an AI reply', async () => {
    mockConfig.sendFailureRate = 1;
    await state().send('Hello');
    expect(userMessages()[0]?.status).toBe('failed');
    expect(state().order).toHaveLength(1);
  });

  it('attaches and then clears the reply target', async () => {
    reset([ai('a1')]);
    state().setReplyTarget('a1');
    await state().send('Tell me more');
    expect(userMessages()[0]?.replyTo).toEqual({
      id: 'a1',
      type: 'ai',
      preview: 'ai a1',
    });
    expect(state().replyTarget).toBeNull();
  });
});

describe('retry', () => {
  it('re-delivers a failed message under the same id', async () => {
    await state().send('please fail once'); // keyword forces the first attempt to fail
    const [failed] = userMessages();
    expect(failed?.status).toBe('failed');

    await state().retry(failed!.id);
    const retried = userMessages();
    expect(retried).toHaveLength(1);
    expect(retried[0]).toMatchObject({ id: failed!.id, status: 'sent' });
  });

  it('is a no-op for messages that are not failed', async () => {
    await state().send('Hi');
    const before = state().byId;
    await state().retry(userMessages()[0]!.id);
    expect(state().byId).toBe(before);
  });
});

describe('sendMessage (mock server)', () => {
  it('is idempotent per clientId', async () => {
    const first = await sendMessage({ clientId: 'c-1', text: 'x' });
    const second = await sendMessage({ clientId: 'c-1', text: 'x' });
    expect(second).toBe(first);
  });
});

describe('deleteMessage', () => {
  it('removes the message and clears targets pointing at it', () => {
    reset([ai('a1'), ai('a2')]);
    state().setReplyTarget('a1');
    state().setActionTarget('a1');
    state().deleteMessage('a1');

    expect(state().order).toEqual(['a2']);
    expect(state().byId.a1).toBeUndefined();
    expect(state().replyTarget).toBeNull();
    expect(state().actionTargetId).toBeNull();
  });

  it('ignores unknown ids', () => {
    reset([ai('a1')]);
    const before = state().order;
    state().deleteMessage('nope');
    expect(state().order).toBe(before);
  });
});

describe('feedback', () => {
  const feedbackOf = (id: string) => (state().byId[id] as AiMessage).feedback;

  it('follows toggle rules', () => {
    expect(nextFeedback(undefined, 'like')).toEqual({
      value: 'like',
      reasons: [],
    });
    expect(nextFeedback({ value: 'like', reasons: [] }, 'like')).toEqual({
      value: null,
      reasons: [],
    });
    expect(
      nextFeedback({ value: 'dislike', reasons: ['Too Long'] }, 'like'),
    ).toEqual({
      value: 'like',
      reasons: [],
    });
  });

  it('toggles dislike reasons only while disliked', () => {
    reset([ai('a1')]);
    state().toggleFeedbackReason('a1', 'Inaccurate');
    expect(feedbackOf('a1')).toBeUndefined();

    state().setFeedback('a1', 'dislike');
    state().toggleFeedbackReason('a1', 'Inaccurate');
    state().toggleFeedbackReason('a1', 'Too Long');
    state().toggleFeedbackReason('a1', 'Inaccurate');
    expect(feedbackOf('a1')).toEqual({
      value: 'dislike',
      reasons: ['Too Long'],
    });
  });

  it('only updates the targeted message', () => {
    reset([ai('a1'), ai('a2')]);
    const untouched = state().byId.a2;
    state().setFeedback('a1', 'like');
    expect(state().byId.a2).toBe(untouched);
  });

  it('ignores feedback on non-AI messages', () => {
    const user: UserMessage = {
      id: 'u1',
      type: 'user',
      text: 'x',
      createdAt: 1,
      status: 'sent',
    };
    reset([user]);
    state().setFeedback('u1', 'like');
    expect(state().byId.u1).toBe(user);
  });
});
