import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { colors, spacing, typography } from '../../../../shared/theme';
import type { ReplyReference } from '../../model/types';
import { senderLabel } from '../messages/senderLabel';

type Props = {
  reply: ReplyReference;
  onDismiss: () => void;
};

export function ReplyPreview({ reply, onDismiss }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.duration(180)}
      exiting={FadeOutDown.duration(120)}
      style={styles.container}
    >
      <View style={styles.accent} />
      <View style={styles.body}>
        <Text style={styles.title}>Replying to {senderLabel(reply.type)}</Text>
        <Text style={styles.preview} numberOfLines={1}>
          {reply.preview}
        </Text>
      </View>
      <Pressable
        onPress={onDismiss}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Cancel reply"
      >
        <Text style={styles.close}>✕</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  accent: {
    alignSelf: 'stretch',
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  body: {
    flex: 1,
  },
  title: {
    ...typography.captionStrong,
    color: colors.primary,
  },
  preview: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  close: {
    ...typography.body,
    color: colors.textMuted,
  },
});
