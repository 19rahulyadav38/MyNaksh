import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Chip } from '../../../../shared/components/Chip';
import { colors, spacing, typography } from '../../../../shared/theme';
import { FEEDBACK_REASONS, type FeedbackReason } from '../../model/types';

type Props = {
  selected: readonly FeedbackReason[];
  onToggle: (reason: FeedbackReason) => void;
};

export function FeedbackChips({ selected, onToggle }: Props) {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
    >
      <Text style={styles.prompt}>What went wrong?</Text>
      <View style={styles.row}>
        {FEEDBACK_REASONS.map(reason => (
          <Chip
            key={reason}
            label={reason}
            selected={selected.includes(reason)}
            onPress={() => onToggle(reason)}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  prompt: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
