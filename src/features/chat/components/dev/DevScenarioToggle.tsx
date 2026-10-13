import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing, typography } from '../../../../shared/theme';
import type { LoadScenario } from '../../api/chatApi';
import { useChatStore } from '../../store/chatStore';
import { createId } from '../../../../shared/utils';
import { showToast } from '../../../../shared/components/Toast';

const SCENARIOS: LoadScenario[] = ['ok', 'empty', 'error'];

export function nextScenario(current: LoadScenario): LoadScenario {
  return SCENARIOS[(SCENARIOS.indexOf(current) + 1) % SCENARIOS.length] ?? 'ok';
}

const INCOMING_DELAY_MS = 3000;

/**
 * Dev-only: an astrologer message arrives in a few seconds, so the
 * "new messages" pill can be demoed by scrolling up in the meantime.
 */
function simulateIncomingMessage() {
  showToast('Astrologer message incoming in 3s…');
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
  }, INCOMING_DELAY_MS);
}

type Props = {
  scenario: LoadScenario;
  onPress: () => void;
};

/**
 * Dev-only header control. Tap cycles the mock load scenario
 * (ok → empty → error); long-press simulates an incoming astrologer message.
 */
export function DevScenarioToggle({ scenario, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={simulateIncomingMessage}
      accessibilityRole="button"
      accessibilityLabel={`Load scenario: ${scenario}. Tap to change, long press to simulate an incoming message`}
      hitSlop={8}
    >
      <Text style={styles.label}>DEV · {scenario}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.captionStrong,
    color: colors.primary,
    paddingHorizontal: spacing.xs,
  },
});
