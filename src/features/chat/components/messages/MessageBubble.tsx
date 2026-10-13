import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radii, spacing } from '../../../../shared/theme';

export type BubbleTone = 'user' | 'ai' | 'human';

type Props = {
  tone: BubbleTone;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  children: ReactNode;
};

const TIGHT_RADIUS = radii.xs;

/**
 * Shared bubble chrome. Corners on the sender's side tighten inside a group so
 * consecutive messages read as one block.
 */
export function MessageBubble({
  tone,
  isFirstInGroup,
  isLastInGroup,
  children,
}: Props) {
  const isOutgoing = tone === 'user';
  const groupCorners: ViewStyle = isOutgoing
    ? {
        ...(!isFirstInGroup && { borderTopRightRadius: TIGHT_RADIUS }),
        ...(!isLastInGroup && { borderBottomRightRadius: TIGHT_RADIUS }),
      }
    : {
        ...(!isFirstInGroup && { borderTopLeftRadius: TIGHT_RADIUS }),
        ...(!isLastInGroup && { borderBottomLeftRadius: TIGHT_RADIUS }),
      };

  return (
    <View style={[styles.bubble, toneStyles[tone], groupCorners]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});

const toneStyles = StyleSheet.create({
  user: {
    alignSelf: 'flex-end',
    backgroundColor: colors.userBubble,
  },
  ai: {
    alignSelf: 'flex-start',
    backgroundColor: colors.aiBubble,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  human: {
    alignSelf: 'flex-start',
    backgroundColor: colors.humanBubble,
  },
});
