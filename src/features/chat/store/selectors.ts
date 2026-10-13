import type { Message } from '../model/types';
import { useChatStore } from './chatStore';

/** Per-row subscription: a row re-renders only when its own message changes. */
export function useMessage(id: string): Message | undefined {
  return useChatStore(state => state.byId[id]);
}
