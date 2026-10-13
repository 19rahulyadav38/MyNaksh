import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../../../shared/theme';
import { assertNever } from '../../../../shared/utils';
import { useMessage } from '../../store/selectors';
import { AiMessage } from '../messages/AiMessage';
import { HumanMessage } from '../messages/HumanMessage';
import { SystemMessage } from '../messages/SystemMessage';
import { UserMessage } from '../messages/UserMessage';

type Props = {
  messageId: string;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
};

/**
 * Subscribes to a single message by id and picks its component. The exhaustive
 * switch makes adding a message type without a renderer a compile error.
 */
function MessageRowBase({ messageId, isFirstInGroup, isLastInGroup }: Props) {
  const message = useMessage(messageId);
  if (!message) {
    return null;
  }

  const grouping = { isFirstInGroup, isLastInGroup };
  let content: ReactNode;

  switch (message.type) {
    case 'user':
      content = <UserMessage message={message} {...grouping} />;
      break;
    case 'ai':
      content = <AiMessage message={message} {...grouping} />;
      break;
    case 'human':
      content = <HumanMessage message={message} {...grouping} />;
      break;
    case 'system':
      content = <SystemMessage message={message} {...grouping} />;
      break;
    default:
      assertNever(message, 'message type');
  }

  return (
    <View style={isFirstInGroup ? styles.groupStart : styles.grouped}>
      {content}
    </View>
  );
}

export const MessageRow = memo(MessageRowBase);

const styles = StyleSheet.create({
  groupStart: {
    paddingTop: spacing.md,
  },
  grouped: {
    paddingTop: spacing.xxs,
  },
});
