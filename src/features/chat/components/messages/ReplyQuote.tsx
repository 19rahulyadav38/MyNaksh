import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../../../shared/theme';
import type { ReplyReference } from '../../model/types';
import { senderLabel } from './senderLabel';

type Props = {
  reply: ReplyReference;
  /** Quotes inside the user's own bubble use inverted colours. */
  inverted?: boolean;
};

export function ReplyQuote({ reply, inverted = false }: Props) {
  return (
    <View style={[styles.quote, inverted && styles.invertedQuote]}>
      <Text style={[styles.sender, inverted && styles.invertedText]}>
        {senderLabel(reply.type)}
      </Text>
      <Text
        style={[styles.preview, inverted && styles.invertedText]}
        numberOfLines={2}
      >
        {reply.preview}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  quote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  invertedQuote: {
    borderLeftColor: colors.onUserBubble,
    backgroundColor: colors.userBubbleQuote,
  },
  sender: {
    ...typography.captionStrong,
    color: colors.primary,
  },
  preview: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  invertedText: {
    color: colors.onUserBubble,
  },
});
