import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing, typography } from '../../../../shared/theme';
import type { LoadScenario } from '../../api/chatApi';
import { simulateIncomingMessage } from '../../demo';

const SCENARIOS: LoadScenario[] = ['ok', 'empty', 'error'];

export function nextScenario(current: LoadScenario): LoadScenario {
  return SCENARIOS[(SCENARIOS.indexOf(current) + 1) % SCENARIOS.length] ?? 'ok';
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
      onLongPress={() => simulateIncomingMessage()}
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
