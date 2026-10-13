import { StyleSheet, Text, type TextStyle } from 'react-native';

import { colors, spacing, typography } from '../../../../shared/theme';
import { formatTime } from '../../../../shared/utils';

type Props = {
  createdAt: number;
  align: TextStyle['alignSelf'];
};

export function MessageTime({ createdAt, align }: Props) {
  return (
    <Text style={[styles.time, { alignSelf: align }]}>
      {formatTime(createdAt)}
    </Text>
  );
}

const styles = StyleSheet.create({
  time: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
});
