import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../../../shared/theme';

type Props = { label: string };

function DateSeparatorBase({ label }: Props) {
  return (
    <View style={styles.row} accessibilityRole="header">
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

export const DateSeparator = memo(DateSeparatorBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  label: {
    ...typography.captionStrong,
    color: colors.textMuted,
  },
});
