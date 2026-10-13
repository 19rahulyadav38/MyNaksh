import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, spacing, typography } from '../../../../shared/theme';
import { useChatStore } from '../../store/chatStore';

/** Top of the timeline: pagination progress, failure with retry, or the start marker. */
export function HistoryHeader() {
  const hasOlder = useChatStore(state => state.hasOlder);
  const olderState = useChatStore(state => state.olderState);
  const loadOlder = useChatStore(state => state.loadOlder);

  if (olderState === 'loading') {
    return (
      <View style={styles.row} accessibilityLabel="Loading earlier messages">
        <ActivityIndicator size="small" color={colors.textMuted} />
        <Text style={styles.text}>Loading earlier messages…</Text>
      </View>
    );
  }
  if (olderState === 'error') {
    return (
      <Pressable
        onPress={loadOlder}
        style={styles.row}
        accessibilityRole="button"
        accessibilityLabel="Couldn't load earlier messages. Retry"
      >
        <Text style={styles.text}>Couldn't load earlier messages.</Text>
        <Text style={styles.retry}>Retry</Text>
      </Pressable>
    );
  }
  if (!hasOlder) {
    return (
      <View style={styles.row}>
        <Text style={styles.text}>This is the start of your conversation</Text>
      </View>
    );
  }
  return <View style={styles.spacer} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  text: {
    ...typography.caption,
    color: colors.textMuted,
  },
  retry: {
    ...typography.captionStrong,
    color: colors.primary,
  },
  spacer: {
    height: spacing.lg,
  },
});
