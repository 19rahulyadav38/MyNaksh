import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../../../shared/theme';
import type {
  Feedback,
  FeedbackReason,
  FeedbackValue,
} from '../../model/types';
import { useChatStore } from '../../store/chatStore';
import { FeedbackChips } from './FeedbackChips';

type Props = {
  messageId: string;
  feedback: Feedback | undefined;
};

const OPTIONS: { value: FeedbackValue; glyph: string; label: string }[] = [
  { value: 'like', glyph: '👍', label: 'Helpful' },
  { value: 'dislike', glyph: '👎', label: 'Not helpful' },
];

function FeedbackBarBase({ messageId, feedback }: Props) {
  const setFeedback = useChatStore(state => state.setFeedback);
  const toggleReason = useChatStore(state => state.toggleFeedbackReason);

  const onToggleReason = useCallback(
    (reason: FeedbackReason) => toggleReason(messageId, reason),
    [messageId, toggleReason],
  );

  const current = feedback?.value ?? null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {OPTIONS.map(option => {
          const selected = current === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setFeedback(messageId, option.value)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              hitSlop={6}
              style={[styles.thumb, selected && styles.thumbSelected]}
            >
              <Text style={styles.glyph}>{option.glyph}</Text>
            </Pressable>
          );
        })}
        {current === 'like' ? (
          <Text style={styles.thanks}>Thanks for the feedback</Text>
        ) : null}
      </View>
      {current === 'dislike' ? (
        <FeedbackChips
          selected={feedback?.reasons ?? []}
          onToggle={onToggleReason}
        />
      ) : null}
    </View>
  );
}

export const FeedbackBar = memo(FeedbackBarBase);

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  thumb: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  thumbSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  glyph: {
    fontSize: 14,
  },
  thanks: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
});
