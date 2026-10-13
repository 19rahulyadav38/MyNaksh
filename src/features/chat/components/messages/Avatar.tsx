import { StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '../../../../shared/theme';
import { AVATAR_SIZE } from './layout';

type Props = {
  /** Emoji or initial. `null` reserves the space without drawing (grouped rows). */
  glyph: string | null;
  backgroundColor?: string;
};

export function Avatar({
  glyph,
  backgroundColor = colors.primarySurface,
}: Props) {
  if (glyph === null) {
    return <View style={styles.avatar} />;
  }
  return (
    <View style={[styles.avatar, styles.filled, { backgroundColor }]}>
      <Text style={styles.glyph}>{glyph}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  filled: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
