import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, radii, spacing } from '../../../../shared/theme';
import { Avatar } from '../messages/Avatar';
import { ROW_PADDING } from '../messages/layout';

const DOT_COUNT = 3;
const STEP_MS = 160;

function Dot({ index }: { index: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * STEP_MS,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
      ),
    );
  }, [index, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.3 + progress.value * 0.7,
    transform: [{ translateY: -3 * progress.value }],
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export function TypingIndicator() {
  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.row}
      accessibilityLabel="AI Astrologer is typing"
      accessibilityLiveRegion="polite"
    >
      <Avatar glyph="✨" />
      <View style={styles.bubble}>
        {Array.from({ length: DOT_COUNT }, (_, index) => (
          <Dot key={index} index={index} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: ROW_PADDING,
    paddingTop: spacing.md,
  },
  bubble: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.aiBubble,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.textMuted,
  },
});
