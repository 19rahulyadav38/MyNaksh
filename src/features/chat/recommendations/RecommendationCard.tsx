import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { colors, radii, spacing, typography } from '../../../shared/theme';
import { getRecommendationRenderer } from './registry';
import type { Recommendation } from './types';

export const CARD_WIDTH = 220;

type Props = {
  recommendation: Recommendation;
  onPress: (recommendation: Recommendation) => void;
};

const PRESSED_SCALE = 0.96;

/**
 * Shared shell for every recommendation: press feedback, accessibility,
 * eyebrow, title and CTA. Type-specific content comes from the registry and is
 * wrapped in an ErrorBoundary so one malformed card can't break the message.
 */
function RecommendationCardBase({ recommendation, onPress }: Props) {
  const { Content, label, icon, accent, defaultCtaLabel } =
    getRecommendationRenderer(recommendation);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(PRESSED_SCALE);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  const handlePress = useCallback(
    () => onPress(recommendation),
    [onPress, recommendation],
  );

  const ctaLabel = recommendation.cta?.label ?? defaultCtaLabel;

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${recommendation.title}. ${ctaLabel}`}
        style={styles.pressable}
      >
        <View style={[styles.header, { backgroundColor: accent.background }]}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={[styles.eyebrow, { color: accent.foreground }]}>
            {label.toUpperCase()}
          </Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {recommendation.title}
          </Text>
          {recommendation.subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {recommendation.subtitle}
            </Text>
          ) : null}
          <ErrorBoundary>
            <Content recommendation={recommendation} accent={accent} />
          </ErrorBoundary>
        </View>

        <Text style={[styles.cta, { color: accent.foreground }]}>
          {ctaLabel} →
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export const RecommendationCard = memo(RecommendationCardBase);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  icon: {
    fontSize: 16,
  },
  eyebrow: {
    ...typography.captionStrong,
    letterSpacing: 0.6,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cta: {
    ...typography.captionStrong,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
