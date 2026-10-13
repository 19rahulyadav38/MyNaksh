import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../../../shared/theme';
import type { AiMessage as AiMessageModel } from '../../model/types';
import { RecommendationRail } from '../../recommendations/RecommendationRail';
import { Avatar } from './Avatar';
import { INCOMING_CONTENT_INSET, ROW_PADDING } from './layout';
import { MessageBubble } from './MessageBubble';
import { MessageTime } from './MessageTime';
import type { MessageComponentProps } from './types';

export function AiMessage({
  message,
  isFirstInGroup,
  isLastInGroup,
}: MessageComponentProps<AiMessageModel>) {
  return (
    <View>
      <View style={styles.row}>
        <Avatar glyph={isFirstInGroup ? '✨' : null} />
        <View style={styles.content}>
          {isFirstInGroup ? (
            <Text style={styles.sender}>AI Astrologer</Text>
          ) : null}
          <MessageBubble
            tone="ai"
            isFirstInGroup={isFirstInGroup}
            isLastInGroup={isLastInGroup}
          >
            <Text style={styles.text}>{message.text}</Text>
          </MessageBubble>
        </View>
      </View>

      {message.recommendations ? (
        <View style={styles.rail}>
          <RecommendationRail
            messageId={message.id}
            recommendations={message.recommendations}
            inset={INCOMING_CONTENT_INSET}
          />
        </View>
      ) : null}

      {isLastInGroup ? (
        <View style={styles.footer}>
          <MessageTime createdAt={message.createdAt} align="flex-start" />
        </View>
      ) : null}
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
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  text: {
    ...typography.body,
    color: colors.textPrimary,
  },
  rail: {
    marginTop: spacing.sm,
  },
  footer: {
    paddingLeft: INCOMING_CONTENT_INSET,
  },
});
