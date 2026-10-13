import { create } from 'zustand';

import {
  fetchAiReply,
  fetchConversation,
  fetchOlderMessages,
  sendMessage,
  type FetchConversationOptions,
} from '../api/chatApi';
import type {
  AiMessage,
  FeedbackReason,
  FeedbackValue,
  Message,
  ReplyReference,
  UserMessage,
} from '../model/types';
import { createId } from '../../../shared/utils';
import { trackAiFeedback } from '../analytics';

export type LoadState = 'idle' | 'loading' | 'success' | 'error';

type MessagesState = {
  byId: Record<string, Message>;
  /** Message ids, oldest first. */
  order: string[];
};

type ChatState = MessagesState & {
  loadState: LoadState;
  /** Pagination: more history exists before the oldest loaded message. */
  hasOlder: boolean;
  olderState: 'idle' | 'loading' | 'error';
  isAiTyping: boolean;
  replyTarget: ReplyReference | null;
  /** Message whose long-press action sheet is open. */
  actionTargetId: string | null;

  load: (options?: FetchConversationOptions) => Promise<void>;
  /** Prepends the previous page of history. No-op while busy or exhausted. */
  loadOlder: () => Promise<void>;
  /** Upserts messages by id (idempotent; safe for duplicate deliveries). */
  receive: (messages: Message[]) => void;
  send: (text: string) => Promise<void>;
  retry: (id: string) => Promise<void>;
  deleteMessage: (id: string) => void;
  setReplyTarget: (id: string | null) => void;
  setActionTarget: (id: string | null) => void;
  setFeedback: (id: string, value: FeedbackValue) => void;
  toggleFeedbackReason: (id: string, reason: FeedbackReason) => void;
};

const EMPTY: MessagesState = { byId: {}, order: [] };
const REPLY_PREVIEW_LENGTH = 120;

/**
 * Pure upsert. Existing ids are replaced in place; new ids are appended and the
 * order is re-sorted only if something arrived out of chronological order.
 */
export function upsertMessages(
  state: MessagesState,
  messages: readonly Message[],
): MessagesState {
  if (messages.length === 0) {
    return state;
  }
  const byId = { ...state.byId };
  const order = [...state.order];
  const lastId = order[order.length - 1];
  let lastCreatedAt = lastId ? byId[lastId]?.createdAt ?? 0 : 0;
  let needsSort = false;

  for (const message of messages) {
    if (!byId[message.id]) {
      order.push(message.id);
      needsSort ||= message.createdAt < lastCreatedAt;
      lastCreatedAt = Math.max(lastCreatedAt, message.createdAt);
    }
    byId[message.id] = message;
  }

  if (needsSort) {
    order.sort((a, b) => (byId[a]?.createdAt ?? 0) - (byId[b]?.createdAt ?? 0));
  }
  return { byId, order };
}

/** Pure toggle rules: same thumb again clears; like clears reasons. */
export function nextFeedback(
  current: AiMessage['feedback'],
  value: FeedbackValue,
): NonNullable<AiMessage['feedback']> {
  if (current?.value === value) {
    return { value: null, reasons: [] };
  }
  return { value, reasons: value === 'dislike' ? current?.reasons ?? [] : [] };
}

export const useChatStore = create<ChatState>()((set, get) => {
  /** Replaces one message if it exists and matches `type`; otherwise no-op. */
  function updateMessage<T extends Message['type']>(
    id: string,
    type: T,
    update: (message: Extract<Message, { type: T }>) => Message,
  ) {
    set(state => {
      const message = state.byId[id];
      if (!message || message.type !== type) {
        return state;
      }
      return {
        byId: {
          ...state.byId,
          [id]: update(message as Extract<Message, { type: T }>),
        },
      };
    });
  }

  /**
   * Bumped on every (re)load. Async work captures it and drops its result if a
   * newer conversation has been loaded since, so a late reply can't leak into it.
   */
  let generation = 0;
  /** Replies in flight; the typing indicator stays up until all have landed. */
  let pendingReplies = 0;

  async function requestAiReply(prompt: string, startedIn: number) {
    pendingReplies += 1;
    set({ isAiTyping: true });
    try {
      const reply = await fetchAiReply(prompt);
      if (startedIn === generation) {
        get().receive([reply]);
      }
    } catch {
      // A failed AI reply is non-fatal: the user's message is already delivered.
    } finally {
      pendingReplies = Math.max(0, pendingReplies - 1);
      if (startedIn === generation) {
        set({ isAiTyping: pendingReplies > 0 });
      }
    }
  }

  /** Applies a feedback change and reports it, only if something changed. */
  function updateFeedback(
    id: string,
    update: (message: AiMessage) => AiMessage,
  ) {
    const before = get().byId[id];
    updateMessage(id, 'ai', update);
    const after = get().byId[id];
    if (after !== before && after?.type === 'ai' && after.feedback) {
      trackAiFeedback(id, after.feedback);
    }
  }

  /** Delivers a user message; safe to call repeatedly for the same message. */
  async function deliver(message: UserMessage) {
    const startedIn = generation;
    updateMessage(message.id, 'user', m => ({ ...m, status: 'sending' }));
    try {
      await sendMessage({
        clientId: message.clientId ?? message.id,
        text: message.text,
      });
    } catch {
      updateMessage(message.id, 'user', m => ({ ...m, status: 'failed' }));
      return;
    }
    if (startedIn !== generation) {
      return;
    }
    updateMessage(message.id, 'user', m => ({ ...m, status: 'sent' }));
    await requestAiReply(message.text, startedIn);
  }

  return {
    ...EMPTY,
    loadState: 'idle',
    hasOlder: false,
    olderState: 'idle',
    isAiTyping: false,
    replyTarget: null,
    actionTargetId: null,

    load: async options => {
      if (get().loadState === 'loading') {
        return;
      }
      generation += 1;
      pendingReplies = 0;
      set({
        loadState: 'loading',
        hasOlder: false,
        olderState: 'idle',
        isAiTyping: false,
        replyTarget: null,
        actionTargetId: null,
      });
      try {
        const { messages, hasOlder } = await fetchConversation(options);
        set({
          ...upsertMessages(EMPTY, messages),
          hasOlder,
          loadState: 'success',
        });
      } catch {
        set({ ...EMPTY, loadState: 'error' });
      }
    },

    loadOlder: async () => {
      const { hasOlder, olderState, loadState, order, byId } = get();
      const oldest = byId[order[0] ?? ''];
      if (!hasOlder || olderState === 'loading' || loadState !== 'success') {
        return;
      }
      const startedIn = generation;
      set({ olderState: 'loading' });
      try {
        // Cursor = oldest loaded message; an empty conversation pages from now.
        const page = await fetchOlderMessages(oldest?.createdAt ?? Date.now());
        if (startedIn !== generation) {
          return;
        }
        set(state => ({
          ...upsertMessages(state, page.messages),
          hasOlder: page.hasOlder,
          olderState: 'idle',
        }));
      } catch {
        if (startedIn === generation) {
          set({ olderState: 'error' });
        }
      }
    },

    receive: messages => set(state => upsertMessages(state, messages)),

    send: async rawText => {
      const text = rawText.trim();
      if (!text) {
        return;
      }
      // The client id doubles as the local message id, so the row key stays
      // stable from optimistic insert through delivery and retries.
      const clientId = createId('msg');
      const { replyTarget } = get();
      const message: UserMessage = {
        id: clientId,
        clientId,
        type: 'user',
        text,
        createdAt: Date.now(),
        status: 'sending',
        ...(replyTarget && { replyTo: replyTarget }),
      };
      set(state => ({
        ...upsertMessages(state, [message]),
        replyTarget: null,
      }));
      await deliver(message);
    },

    retry: async id => {
      const message = get().byId[id];
      if (message?.type !== 'user' || message.status !== 'failed') {
        return;
      }
      await deliver(message);
    },

    deleteMessage: id =>
      set(state => {
        if (!state.byId[id]) {
          return state;
        }
        const byId = { ...state.byId };
        delete byId[id];
        return {
          byId,
          order: state.order.filter(existing => existing !== id),
          replyTarget: state.replyTarget?.id === id ? null : state.replyTarget,
          actionTargetId:
            state.actionTargetId === id ? null : state.actionTargetId,
        };
      }),

    setReplyTarget: id => {
      const message = id ? get().byId[id] : undefined;
      set({
        replyTarget: message
          ? {
              id: message.id,
              type: message.type,
              preview: message.text.slice(0, REPLY_PREVIEW_LENGTH),
            }
          : null,
      });
    },

    setActionTarget: id => set({ actionTargetId: id }),

    setFeedback: (id, value) =>
      updateFeedback(id, m => ({
        ...m,
        feedback: nextFeedback(m.feedback, value),
      })),

    toggleFeedbackReason: (id, reason) =>
      updateFeedback(id, m => {
        if (m.feedback?.value !== 'dislike') {
          return m;
        }
        const { reasons } = m.feedback;
        return {
          ...m,
          feedback: {
            value: 'dislike',
            reasons: reasons.includes(reason)
              ? reasons.filter(r => r !== reason)
              : [...reasons, reason],
          },
        };
      }),
  };
});
