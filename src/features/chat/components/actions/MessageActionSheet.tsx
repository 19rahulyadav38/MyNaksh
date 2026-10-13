import Clipboard from '@react-native-clipboard/clipboard';
import { useCallback, useEffect } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

/**
 * Long-press actions for the message in `actionTargetId`. Mounted once, as the
 * last child of the screen. Rendered as an in-screen overlay rather than a
 * `Modal`: Android Modal windows don't extend under the navigation bar in
 * edge-to-edge mode, which left the sheet floating above the bottom edge.
 */
export function MessageActionSheet() {
  const targetId = useChatStore(state => state.actionTargetId);
  const message = useMessage(targetId ?? '');
  const setActionTarget = useChatStore(state => state.setActionTarget);
  const setReplyTarget = useChatStore(state => state.setReplyTarget);
  const deleteMessage = useChatStore(state => state.deleteMessage);
  const { bottom } = useSafeAreaInsets();

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

  const visible = Boolean(message);

  // Android back button closes the sheet instead of leaving the screen.
  useEffect(() => {
    if (!visible) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        close();
        return true;
      },
    );
    return () => subscription.remove();
  }, [close, visible]);

  if (!message) {
    return null;
  }

  return (
    <View style={styles.root} accessibilityViewIsModal>
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
        style={StyleSheet.absoluteFill}
      >
        <Pressable
          style={styles.backdrop}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Dismiss actions"
        />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.duration(200)}
        exiting={SlideOutDown.duration(180)}
        style={[styles.sheet, { paddingBottom: bottom + spacing.md }]}
      >
        <View style={styles.handle} />
        <Text style={styles.preview} numberOfLines={2}>
          {message.text}
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
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
