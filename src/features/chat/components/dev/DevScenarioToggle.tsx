import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing, typography } from '../../../../shared/theme';
import type { LoadScenario } from '../../api/chatApi';

const SCENARIOS: LoadScenario[] = ['ok', 'empty', 'error'];

export function nextScenario(current: LoadScenario): LoadScenario {
  return SCENARIOS[(SCENARIOS.indexOf(current) + 1) % SCENARIOS.length] ?? 'ok';
}

type Props = {
  scenario: LoadScenario;
  onPress: () => void;
};

/** Dev-only header control that cycles the mock load scenario (ok → empty → error). */
export function DevScenarioToggle({ scenario, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Load scenario: ${scenario}. Tap to change`}
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
