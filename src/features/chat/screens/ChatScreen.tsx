import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../../shared/theme';
import { Timeline } from '../components/timeline/Timeline';
import { useChatStore } from '../store/chatStore';

export function ChatScreen() {
  const loadState = useChatStore(state => state.loadState);
  const load = useChatStore(state => state.load);

  useEffect(() => {
    load();
  }, [load]);

  // Interim states; replaced by dedicated components in Part B.
  if (loadState === 'idle' || loadState === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (loadState === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Unable to load conversation.</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Timeline />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
