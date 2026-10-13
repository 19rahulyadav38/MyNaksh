import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing, typography } from '../../../../shared/theme';

/** Bubble skeletons hinting at the conversation's shape while it loads. */
const SKELETON: { align: 'flex-start' | 'flex-end'; width: `${number}%` }[] = [
  { align: 'flex-start', width: '70%' },
  { align: 'flex-end', width: '55%' },
  { align: 'flex-start', width: '80%' },
  { align: 'flex-start', width: '45%' },
  { align: 'flex-end', width: '60%' },
];

export function LoadingState() {
  const { bottom } = useSafeAreaInsets();
  const pulse = useSharedValue(0.4);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View
      style={[styles.container, { paddingBottom: bottom + spacing.lg }]}
      accessibilityLabel="Loading conversation"
      accessibilityRole="progressbar"
    >
      <Animated.View style={[styles.skeleton, pulseStyle]}>
        {SKELETON.map((bubble, index) => (
          <View
            key={index}
            style={[
              styles.bubble,
              { alignSelf: bubble.align, width: bubble.width },
            ]}
          />
        ))}
      </Animated.View>
      <Text style={styles.label}>Loading conversation...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  skeleton: {
    gap: spacing.md,
  },
  bubble: {
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.border,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
