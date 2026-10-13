import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../../../../shared/theme';
import type { UserMessage as UserMessageModel } from '../../model/types';
import { ROW_PADDING } from './layout';
import { MessageBubble } from './MessageBubble';
import { MessageTime } from './MessageTime';
import type { MessageComponentProps } from './types';

export function UserMessage({
  message,
  isFirstInGroup,
  isLastInGroup,
}: MessageComponentProps<UserMessageModel>) {
  return (
    <View style={styles.row}>
      <MessageBubble
        tone="user"
        isFirstInGroup={isFirstInGroup}
        isLastInGroup={isLastInGroup}
      >
        <Text style={styles.text}>{message.text}</Text>
      </MessageBubble>
      {isLastInGroup ? (
        <MessageTime createdAt={message.createdAt} align="flex-end" />
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
});
