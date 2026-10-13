import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing, typography } from '../../../../shared/theme';
import { useChatStore } from '../../store/chatStore';
import { ReplyPreview } from './ReplyPreview';

type Props = {
  onSend: (text: string) => void;
};

const MAX_INPUT_HEIGHT = 120;

export function Composer({ onSend }: Props) {
  const [text, setText] = useState('');
  const replyTarget = useChatStore(state => state.replyTarget);
  const setReplyTarget = useChatStore(state => state.setReplyTarget);
  const { bottom } = useSafeAreaInsets();

  const canSend = text.trim().length > 0;

  const handleSend = useCallback(() => {
    if (!canSend) {
      return;
    }
    onSend(text);
    setText('');
  }, [canSend, onSend, text]);

  const dismissReply = useCallback(
    () => setReplyTarget(null),
    [setReplyTarget],
  );

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(bottom, spacing.sm) },
      ]}
    >
      {replyTarget ? (
        <ReplyPreview reply={replyTarget} onDismiss={dismissReply} />
      ) : null}
      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ask about your career, love, health…"
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.input}
          accessibilityLabel="Message"
        />
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityState={{ disabled: !canSend }}
          style={({ pressed }) => [
            styles.send,
            !canSend && styles.sendDisabled,
            pressed && styles.sendPressed,
          ]}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </Pressable>
      </View>
    </View>
  );
}

const SEND_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  input: {
    ...typography.body,
    flex: 1,
    maxHeight: MAX_INPUT_HEIGHT,
    minHeight: SEND_SIZE,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  send: {
    width: SEND_SIZE,
    height: SEND_SIZE,
    borderRadius: SEND_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  sendDisabled: {
    backgroundColor: colors.textMuted,
  },
  sendPressed: {
    opacity: 0.8,
  },
  sendIcon: {
    fontSize: 16,
    color: colors.onPrimary,
  },
});
