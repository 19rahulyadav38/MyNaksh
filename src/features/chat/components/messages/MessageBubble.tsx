import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { colors, radii, spacing } from '../../../../shared/theme';

export type BubbleTone = 'user' | 'ai' | 'human';

type Props = {
  tone: BubbleTone;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  onLongPress?: () => void;
  accessibilityLabel?: string;
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
  onLongPress,
  accessibilityLabel,
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
    <Pressable
      onLongPress={onLongPress}
      disabled={!onLongPress}
      delayLongPress={300}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={onLongPress ? 'Long press for actions' : undefined}
      style={({ pressed }) => [
        styles.bubble,
        toneStyles[tone],
        groupCorners,
        pressed && styles.pressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.75,
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
