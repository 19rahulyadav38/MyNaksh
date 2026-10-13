import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../../../shared/theme';
import { formatTime } from '../../../../shared/utils';
import type { UserMessage as UserMessageModel } from '../../model/types';
import { useChatStore } from '../../store/chatStore';
import { ROW_PADDING } from './layout';
import { MessageBubble } from './MessageBubble';
import { ReplyQuote } from './ReplyQuote';
import type { MessageComponentProps } from './types';

export function UserMessage({
  message,
  isFirstInGroup,
  isLastInGroup,
}: MessageComponentProps<UserMessageModel>) {
  const retry = useChatStore(state => state.retry);
  const { status } = message;

  return (
    <View style={styles.row}>
      <MessageBubble
        tone="user"
        isFirstInGroup={isFirstInGroup}
        isLastInGroup={isLastInGroup}
      >
        {message.replyTo ? (
          <ReplyQuote reply={message.replyTo} inverted />
        ) : null}
        <Text style={styles.text}>{message.text}</Text>
      </MessageBubble>

      {status === 'failed' ? (
        <Pressable
          onPress={() => retry(message.id)}
          accessibilityRole="button"
          accessibilityLabel="Message failed to send. Retry"
          hitSlop={8}
          style={styles.footer}
        >
          <Text style={styles.failed}>⚠ Failed · Tap to retry</Text>
        </Pressable>
      ) : status === 'sending' || isLastInGroup ? (
        <Text
          style={[styles.footer, styles.meta]}
          accessibilityLiveRegion="polite"
        >
          {status === 'sending'
            ? 'Sending…'
            : `${formatTime(message.createdAt)} · Sent ✓`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: ROW_PADDING,
  },
  text: {
    ...typography.body,
    color: colors.onUserBubble,
  },
  footer: {
    alignSelf: 'flex-end',
    marginTop: spacing.xxs,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  failed: {
    ...typography.captionStrong,
    color: colors.danger,
  },
});
