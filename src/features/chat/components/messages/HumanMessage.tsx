import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../../../shared/theme';
import type { HumanMessage as HumanMessageModel } from '../../model/types';
import { Avatar } from './Avatar';
import { ROW_PADDING } from './layout';
import { MessageBubble } from './MessageBubble';
import { MessageTime } from './MessageTime';
import type { MessageComponentProps } from './types';

const DEFAULT_SENDER = 'Astrologer';

export function HumanMessage({
  message,
  isFirstInGroup,
  isLastInGroup,
}: MessageComponentProps<HumanMessageModel>) {
  const senderName = message.senderName ?? DEFAULT_SENDER;

  return (
    <View style={styles.row}>
      <Avatar
        glyph={isFirstInGroup ? senderName.charAt(0).toUpperCase() : null}
        backgroundColor={colors.humanBubble}
      />
      <View style={styles.content}>
        {isFirstInGroup ? (
          <Text style={styles.sender}>
            {senderName} <Text style={styles.badge}>· Astrologer</Text>
          </Text>
        ) : null}
        <MessageBubble
          tone="human"
          isFirstInGroup={isFirstInGroup}
          isLastInGroup={isLastInGroup}
        >
          <Text style={styles.text}>{message.text}</Text>
        </MessageBubble>
        {isLastInGroup ? (
          <MessageTime createdAt={message.createdAt} align="flex-start" />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: ROW_PADDING,
  },
  content: {
    flex: 1,
  },
  sender: {
    ...typography.captionStrong,
    color: colors.humanAccent,
    marginBottom: spacing.xxs,
  },
  badge: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
  text: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
