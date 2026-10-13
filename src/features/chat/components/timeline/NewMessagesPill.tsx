import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { colors, radii, spacing, typography } from '../../../../shared/theme';

type Props = {
  count: number;
  onPress: () => void;
};

/** Shown when messages arrive while the user is reading further up. */
export function NewMessagesPill({ count, onPress }: Props) {
  const label = `${count} new message${count === 1 ? '' : 's'}`;
  return (
    <Animated.View
      entering={FadeInDown.duration(150)}
      exiting={FadeOutDown.duration(150)}
      style={styles.container}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}. Scroll to latest`}
        accessibilityLiveRegion="polite"
        style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
      >
        <Text style={styles.label}>↓ {label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
  },
  pill: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    elevation: 3,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    ...typography.captionStrong,
    color: colors.onPrimary,
  },
});
