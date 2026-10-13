import Clipboard from '@react-native-clipboard/clipboard';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { BottomSheet } from '../../../../shared/components/BottomSheet';
import { showToast } from '../../../../shared/components/Toast';
import { colors, radii, spacing, typography } from '../../../../shared/theme';
import { useChatStore } from '../../store/chatStore';
import { useMessage } from '../../store/selectors';

type Action = {
  key: 'reply' | 'copy' | 'delete';
  label: string;
  icon: string;
  destructive?: boolean;
};

const ACTIONS: Action[] = [
  { key: 'reply', label: 'Reply', icon: '↩︎' },
  { key: 'copy', label: 'Copy', icon: '⧉' },
  { key: 'delete', label: 'Delete', icon: '🗑', destructive: true },
];

/** Long-press actions for the message in `actionTargetId`. Mounted once per screen. */
export function MessageActionSheet() {
  const targetId = useChatStore(state => state.actionTargetId);
  const message = useMessage(targetId ?? '');
  const setActionTarget = useChatStore(state => state.setActionTarget);
  const setReplyTarget = useChatStore(state => state.setReplyTarget);
  const deleteMessage = useChatStore(state => state.deleteMessage);

  const close = useCallback(() => setActionTarget(null), [setActionTarget]);

  const run = useCallback(
    (key: Action['key']) => {
      if (!message) {
        return;
      }
      switch (key) {
        case 'reply':
          setReplyTarget(message.id);
          break;
        case 'copy':
          Clipboard.setString(message.text);
          showToast('Copied to clipboard');
          break;
        case 'delete':
          deleteMessage(message.id);
          showToast('Message deleted');
          break;
      }
      close();
    },
    [close, deleteMessage, message, setReplyTarget],
  );

  return (
    <BottomSheet
      visible={Boolean(message)}
      onClose={close}
      dismissLabel="Dismiss actions"
    >
      <Text style={styles.preview} numberOfLines={2}>
        {message?.text}
      </Text>
      {ACTIONS.map(action => (
        <Pressable
          key={action.key}
          onPress={() => run(action.key)}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => [
            styles.action,
            pressed && styles.actionPressed,
          ]}
        >
          <Text style={styles.icon}>{action.icon}</Text>
          <Text
            style={[styles.label, action.destructive && styles.destructive]}
          >
            {action.label}
          </Text>
        </Pressable>
      ))}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  preview: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
  },
  actionPressed: {
    backgroundColor: colors.background,
  },
  icon: {
    width: 24,
    fontSize: 18,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
  destructive: {
    color: colors.danger,
  },
});
