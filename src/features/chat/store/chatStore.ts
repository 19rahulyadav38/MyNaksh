import { create } from 'zustand';

import {
  fetchConversation,
  type FetchConversationOptions,
} from '../api/chatApi';
import type { Message } from '../model/types';

export type LoadState = 'idle' | 'loading' | 'success' | 'error';

type MessagesState = {
  byId: Record<string, Message>;
  /** Message ids, oldest first. */
  order: string[];
};

type ChatState = MessagesState & {
  loadState: LoadState;

  load: (options?: FetchConversationOptions) => Promise<void>;
  /** Upserts messages by id (idempotent; safe for duplicate deliveries). */
  receive: (messages: Message[]) => void;
};

const EMPTY: MessagesState = { byId: {}, order: [] };

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

export const useChatStore = create<ChatState>()((set, get) => ({
  ...EMPTY,
  loadState: 'idle',

  load: async options => {
    if (get().loadState === 'loading') {
      return;
    }
    set({ loadState: 'loading' });
    try {
      const messages = await fetchConversation(options);
      set({ ...upsertMessages(EMPTY, messages), loadState: 'success' });
    } catch {
      set({ loadState: 'error' });
    }
  },

  receive: messages => set(state => upsertMessages(state, messages)),
}));
