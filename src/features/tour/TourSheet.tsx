import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '../../shared/components/BottomSheet';
import { colors, radii, spacing, typography } from '../../shared/theme';
import { useTourStore } from './tourStore';
import { TOUR_STEPS, type TourContext, type TourStep } from './tourSteps';

/** Lets the sheet's slide-out finish before the demo starts. */
const RUN_DELAY_MS = 250;

type Props = {
  context: TourContext;
};

/** Guided checklist of the app's features, each with a live "Show me" demo. */
export function TourSheet({ context }: Props) {
  const isOpen = useTourStore(state => state.isOpen);
  const completed = useTourStore(state => state.completed);
  const eventCount = useTourStore(state => state.eventCount);
  const close = useTourStore(state => state.close);
  const markDone = useTourStore(state => state.markDone);

  const run = useCallback(
    (step: TourStep) => {
      close();
      if (!step.completesOn) {
        markDone(step.id);
      }
      setTimeout(() => step.run(context), RUN_DELAY_MS);
    },
    [close, context, markDone],
  );

  const doneCount = completed.size;
  const total = TOUR_STEPS.length;

  return (
    <BottomSheet visible={isOpen} onClose={close} dismissLabel="Close tour">
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Tour of this app
        </Text>
        <Text style={styles.progressLabel}>
          {doneCount}/{total}
        </Text>
      </View>
      <View
        style={styles.progressTrack}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: doneCount }}
      >
        <View
          style={[
            styles.progressFill,
            { width: `${(doneCount / total) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.intro}>
        Each step demos a feature live. Tap "Show me", then come back here from
        the Tour button in the header.
      </Text>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
      >
        {TOUR_STEPS.map((step, index) => {
          const done = completed.has(step.id);
          return (
            <View key={step.id} style={styles.step}>
              <View style={[styles.badge, done && styles.badgeDone]}>
                <Text style={[styles.badgeText, done && styles.badgeTextDone]}>
                  {done ? '✓' : index + 1}
                </Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
                {step.id === 'analytics' ? (
                  <Text style={styles.live}>
                    {eventCount} events tracked this session
                  </Text>
                ) : null}
              </View>
              <Pressable
                onPress={() => run(step)}
                accessibilityRole="button"
                accessibilityLabel={`${done ? 'Show again' : 'Show me'}: ${
                  step.title
                }`}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.showMe,
                  done && styles.showMeDone,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[styles.showMeText, done && styles.showMeTextDone]}
                >
                  {done ? 'Again' : 'Show me'}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const BADGE_SIZE = 24;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  progressLabel: {
    ...typography.captionStrong,
    color: colors.primary,
  },
  progressTrack: {
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  intro: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  list: {
    marginTop: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.sm,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  badgeText: {
    ...typography.captionStrong,
    color: colors.textSecondary,
  },
  badgeTextDone: {
    color: colors.onPrimary,
  },
  stepBody: {
    flex: 1,
    gap: spacing.xxs,
  },
  stepTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  stepDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  live: {
    ...typography.captionStrong,
    color: colors.primary,
  },
  showMe: {
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  showMeDone: {
    backgroundColor: colors.primarySurface,
  },
  showMeText: {
    ...typography.captionStrong,
    color: colors.onPrimary,
  },
  showMeTextDone: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
});
