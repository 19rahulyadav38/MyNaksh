import { parseMessages } from '../model/parse';
import type { Message } from '../model/types';
import { createSeedConversation } from './mockData';

export type LoadScenario = 'ok' | 'empty' | 'error';

export type FetchConversationOptions = {
  scenario?: LoadScenario;
  delayMs?: number;
};

export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

const DEFAULT_LOAD_DELAY_MS = 1200;

export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Mock of `GET /conversations/:id/messages`. */
export async function fetchConversation({
  scenario = 'ok',
  delayMs = DEFAULT_LOAD_DELAY_MS,
}: FetchConversationOptions = {}): Promise<Message[]> {
  await wait(delayMs);

  switch (scenario) {
    case 'error':
      throw new NetworkError('Unable to load conversation.');
    case 'empty':
      return [];
    case 'ok':
      return parseMessages(createSeedConversation());
  }
}
