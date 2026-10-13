import { isRecommendationType } from './registry';
import type { Recommendation } from './types';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Validates recommendations coming from the network.
 *
 * Unknown types are dropped rather than rendered: a newer backend can ship a
 * new experience without crashing older app builds. Only the shared base
 * fields are validated; variant fields are optional and read defensively by
 * each card.
 */
export function parseRecommendations(raw: unknown): Recommendation[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter((item): item is Recommendation => {
    if (!isRecord(item)) {
      return false;
    }
    if (!isRecommendationType(item.type)) {
      if (__DEV__) {
        console.warn(
          `[recommendations] Skipping unsupported type "${String(item.type)}"`,
        );
      }
      return false;
    }
    return isNonEmptyString(item.id) && isNonEmptyString(item.title);
  });
}
