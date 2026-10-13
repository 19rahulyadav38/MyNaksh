import { showToast } from '../../shared/components/Toast';
import { simulateIncomingMessage } from '../chat/demo';
import { useChatStore } from '../chat/store/chatStore';

/** What a step can do to the chat screen. Implemented by ChatScreen. */
export type TourContext = {
  scrollToEnd: () => void;
  scrollToTop: () => void;
};

export type TourStepId =
  | 'cards'
  | 'send'
  | 'actions'
  | 'feedback'
  | 'history'
  | 'newMessages'
  | 'states'
  | 'analytics';

export type TourStep = {
  id: TourStepId;
  title: string;
  description: string;
  /** Runs the live demo. The tour sheet closes first so the effect is visible. */
  run: (context: TourContext) => void;
  /**
   * If set, the step only ticks off when the reviewer actually does the thing
   * (detected via this analytics event), not when "Show me" is pressed.
   */
  completesOn?: string;
};

function latestAiMessageId(): string | undefined {
  const { order, byId } = useChatStore.getState();
  return [...order].reverse().find(id => byId[id]?.type === 'ai');
}

/**
 * Most demos need the seeded conversation on screen. If the reviewer left it
 * in the empty or error state, reload it first.
 */
function withConversation(run: () => void) {
  const { loadState, order, load } = useChatStore.getState();
  if (loadState === 'success' && order.length > 0) {
    run();
    return;
  }
  showToast('Loading the conversation first…');
  load({ scenario: 'ok' }).then(() => setTimeout(run, 300));
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    id: 'cards',
    title: 'Recommendation cards',
    description:
      'Every card type comes from one registry. Adding a type takes 3 files (see the "Remedy" commit). Tap any card to complete this step.',
    completesOn: 'recommendation_tap',
    run: ({ scrollToEnd }) =>
      withConversation(() => {
        scrollToEnd();
        showToast('Tap a card · swipe the row for more');
      }),
  },
  {
    id: 'send',
    title: 'Optimistic send & retry',
    description:
      'Messages appear instantly as "Sending…". This demo message fails on purpose: tap "Tap to retry" to deliver it and get an AI reply.',
    run: ({ scrollToEnd }) =>
      withConversation(() => {
        useChatStore
          .getState()
          .send('Is this a good week to travel? (demo: fails once)');
        requestAnimationFrame(scrollToEnd);
      }),
  },
  {
    id: 'actions',
    title: 'Long-press actions',
    description:
      'Long-press any AI message for Reply, Copy and Delete. Reply shows a preview above the composer; Delete keeps your scroll position.',
    run: () =>
      withConversation(() => {
        const id = latestAiMessageId();
        if (id) {
          useChatStore.getState().setActionTarget(id);
        }
      }),
  },
  {
    id: 'feedback',
    title: 'AI feedback',
    description:
      '👍 / 👎 under every AI reply. 👎 opens reason chips (Inaccurate, Too Generic…). Give feedback to complete this step.',
    completesOn: 'ai_feedback',
    run: ({ scrollToEnd }) =>
      withConversation(() => {
        scrollToEnd();
        showToast('Tap 👎 under the latest reply');
      }),
  },
  {
    id: 'history',
    title: 'Load older messages',
    description:
      'Scrolling to the top pages in earlier sessions; your reading position is kept as history is inserted above.',
    run: ({ scrollToTop }) =>
      withConversation(() => {
        scrollToTop();
        showToast('Keep scrolling up to page through history');
      }),
  },
  {
    id: 'newMessages',
    title: 'New-message alert',
    description:
      'If a message arrives while you\'re reading older ones, the list stays put and a "↓ new message" pill appears instead.',
    run: ({ scrollToTop }) =>
      withConversation(() => {
        scrollToTop();
        simulateIncomingMessage(2500);
      }),
  },
  {
    id: 'states',
    title: 'Loading, empty & error states',
    description:
      'Shows the network-error screen. Tap Retry to recover and you will see the loading skeleton on the way back.',
    run: () => {
      useChatStore.getState().load({ scenario: 'error', delayMs: 600 });
    },
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description:
      'Card impressions (counted only when actually on screen), taps and feedback all go through one track() function with a pluggable backend.',
    run: () => showToast('Events are logged to the Metro console'),
  },
];
