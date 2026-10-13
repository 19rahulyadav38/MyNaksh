import { StyleSheet, Text, View } from 'react-native';

import {
  radii,
  spacing,
  typography,
  type Accent,
} from '../../../../shared/theme';

type Props = {
  items: string[];
  accent: Accent;
};

/** Row of small accent-tinted pills for card metadata. */
export function CardMeta({ items, accent }: Props) {
  return (
    <View style={styles.row}>
      {items.map(item => (
        <Text
          key={item}
          style={[
            styles.pill,
            { color: accent.foreground, backgroundColor: accent.background },
          ]}
          numberOfLines={1}
        >
          {item}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  pill: {
    ...typography.caption,
    overflow: 'hidden',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
});
