import { parseRecommendations } from '../recommendations/parse';
import type { Message } from './types';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function parseMessage(raw: unknown, fallbackTimestamp: number): Message | null {
  if (
    !isRecord(raw) ||
    typeof raw.id !== 'string' ||
    typeof raw.text !== 'string'
  ) {
    return null;
  }

  const base = {
    id: raw.id,
    text: raw.text,
    createdAt:
      typeof raw.createdAt === 'number' ? raw.createdAt : fallbackTimestamp,
  };

  switch (raw.type) {
    case 'user':
      return { ...base, type: 'user', status: 'sent' };
    case 'ai': {
      const recommendations = parseRecommendations(raw.recommendations);
      return {
        ...base,
        type: 'ai',
        ...(recommendations.length > 0 && { recommendations }),
      };
    }
    case 'human':
      return {
        ...base,
        type: 'human',
        ...(typeof raw.senderName === 'string' && {
          senderName: raw.senderName,
        }),
      };
    case 'system':
      return { ...base, type: 'system' };
    default:
      if (__DEV__) {
        console.warn(
          `[messages] Skipping unsupported type "${String(raw.type)}"`,
        );
      }
      return null;
  }
}

/**
 * Converts an untrusted API payload into domain messages. Malformed entries and
 * unknown message types are dropped instead of crashing the conversation.
 */
export function parseMessages(raw: unknown, now = Date.now()): Message[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.flatMap(item => {
    const message = parseMessage(item, now);
    return message ? [message] : [];
  });
}
