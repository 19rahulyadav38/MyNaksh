import { parseMessages } from '../model/parse';
import type { AiMessage, Message } from '../model/types';
import { createId } from '../../../shared/utils';
import { pickAiReply } from './aiReplies';
import { createSeedConversation } from './mockData';

export type LoadScenario = 'ok' | 'empty' | 'error';

export type FetchConversationOptions = {
  scenario?: LoadScenario;
  delayMs?: number;
};

type Range = readonly [min: number, max: number];

/** Tunable mock behaviour. Tests set delays to 0 and pin the failure rate. */
export const mockConfig: {
  loadDelayMs: number;
  sendDelayMs: Range;
  replyDelayMs: Range;
  sendFailureRate: number;
} = {
  loadDelayMs: 1200,
  sendDelayMs: [800, 1500],
  replyDelayMs: [1200, 2200],
  sendFailureRate: 0.2,
};

/** Messages containing this keyword fail on their first attempt (handy for demos). */
export const FORCE_FAIL_KEYWORD = 'fail';

export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomIn([min, max]: Range): number {
  return min + Math.random() * (max - min);
}

/** Mock of `GET /conversations/:id/messages`. */
export async function fetchConversation({
  scenario = 'ok',
  delayMs = mockConfig.loadDelayMs,
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

export type SendMessageRequest = { clientId: string; text: string };
export type SendMessageResponse = { id: string; createdAt: number };

/** What the mock "server" has already accepted, keyed by clientId. */
const accepted = new Map<string, SendMessageResponse>();
const attempts = new Map<string, number>();

/**
 * Mock of `POST /messages`. Idempotent on `clientId`: a retry of a message the
 * server already accepted returns the original result instead of a duplicate.
 */
export async function sendMessage({
  clientId,
  text,
}: SendMessageRequest): Promise<SendMessageResponse> {
  await wait(randomIn(mockConfig.sendDelayMs));

  const previous = accepted.get(clientId);
  if (previous) {
    return previous;
  }

  const attempt = (attempts.get(clientId) ?? 0) + 1;
  attempts.set(clientId, attempt);

  const forceFail =
    attempt === 1 && text.toLowerCase().includes(FORCE_FAIL_KEYWORD);
  if (forceFail || Math.random() < mockConfig.sendFailureRate) {
    throw new NetworkError();
  }

  const response = { id: clientId, createdAt: Date.now() };
  accepted.set(clientId, response);
  return response;
}

/** Mock of the AI responding to a user prompt. */
export async function fetchAiReply(prompt: string): Promise<AiMessage> {
  await wait(randomIn(mockConfig.replyDelayMs));
  const { text, recommendations } = pickAiReply(prompt);
  return {
    id: createId('ai'),
    type: 'ai',
    text,
    recommendations,
    createdAt: Date.now(),
  };
}
