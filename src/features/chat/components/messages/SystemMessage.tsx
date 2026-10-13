import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../../../shared/theme';
import type { SystemMessage as SystemMessageModel } from '../../model/types';
import type { MessageComponentProps } from './types';

export function SystemMessage({
  message,
}: MessageComponentProps<SystemMessageModel>) {
  return (
    <View style={styles.row} accessibilityRole="text">
      <Text style={styles.text}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  text: {
    ...typography.caption,
    color: colors.systemText,
    textAlign: 'center',
    backgroundColor: colors.systemSurface,
    borderRadius: radii.pill,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
