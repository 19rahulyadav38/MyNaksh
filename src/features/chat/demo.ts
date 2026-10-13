import { showToast } from '../../shared/components/Toast';
import { createId } from '../../shared/utils';
import { useChatStore } from './store/chatStore';

const INCOMING_DELAY_MS = 3000;

/**
 * Demo helper: an astrologer message arrives after a delay, so the
 * "new messages" pill can be seen by scrolling up in the meantime.
 * Used by the dev header toggle and the guided tour.
 */
export function simulateIncomingMessage(delayMs = INCOMING_DELAY_MS) {
  showToast(`Astrologer message incoming in ${Math.round(delayMs / 1000)}s…`);
  setTimeout(() => {
    useChatStore.getState().receive([
      {
        id: createId('human'),
        type: 'human',
        senderName: 'Acharya Mehta',
        text: 'Adding to that: keep Thursdays light and avoid big financial commitments this week.',
        createdAt: Date.now(),
      },
    ]);
  }, delayMs);
}
