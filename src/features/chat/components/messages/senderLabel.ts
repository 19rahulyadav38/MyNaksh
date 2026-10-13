import { assertNever } from '../../../../shared/utils';
import type { MessageType } from '../../model/types';

export function senderLabel(type: MessageType): string {
  switch (type) {
    case 'user':
      return 'You';
    case 'ai':
      return 'AI Astrologer';
    case 'human':
      return 'Astrologer';
    case 'system':
      return 'System';
    default:
      return assertNever(type, 'message type');
  }
}
