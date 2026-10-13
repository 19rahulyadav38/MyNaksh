import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, spacing, typography } from '../../shared/theme';
import { useTourStore } from './tourStore';
import { TOUR_STEPS } from './tourSteps';

/** Header entry point to the guided tour, with live progress. */
export function TourButton() {
  const open = useTourStore(state => state.open);
  const doneCount = useTourStore(state => state.completed.size);
  const total = TOUR_STEPS.length;

  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`Open app tour, ${doneCount} of ${total} steps done`}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>
        🧭 Tour {doneCount}/{total}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.pill,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    ...typography.captionStrong,
    color: colors.primary,
  },
});
